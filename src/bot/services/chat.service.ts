import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../libs/database/database.service';
import { QueryService } from '../libs/query/query.service';
import { OpenAIService } from '../libs/openai/openai.service';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ChatService {
  private history: { role: string; content: any; bot: number }[] = [];
  private readonly dataFilePath = join(
    process.cwd(),
    'src',
    'bot',
    'data',
    'data.json',
  );

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly queryService: QueryService,
    private readonly openAIService: OpenAIService,
  ) {}

  private async loadData(): Promise<any[]> {
    try {
      const data = await readFile(this.dataFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async saveData(data: any[]): Promise<void> {
    await writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async getOrCreateConversation(
    id_user: number,
    prompt: any,
    id_chat?: string,
  ): Promise<any> {
    const data = await this.loadData();

    let conversation = data.find(
      (conv) => conv.id_usuario === id_user && conv.id_chat === id_chat,
    );

    if (!conversation) {
      const instrucciones = `Basado en la solicitud del usuario, crearé un título de conversación de 3 a 4 palabras que sea coherente y significativo. Debe componer EL TITULO DE UNA NUEVA CONVERSACIÓN. Solo devolveré el título, sin información adicional, y me basaré exclusivamente en la solicitud del usuario para generar un título sobrio.`;

      let messages = [
        {
          role: 'system',
          bot: 0,
          content: instrucciones,
        },
        {
          role: 'user',
          bot: 0,
          content: prompt,
        },
      ];

      let tituloChat;

      tituloChat = await this.openAIService.useGpt4ModelV2(
        'gpt-4o',
        0.1,
        50,
        messages,
      );

      conversation = {
        id: data.length + 1,
        id_usuario: id_user,
        label_chat: tituloChat.choices[0].message.content,
        id_chat: id_chat || `chat_${Date.now()}`,
        history: [],
      };
      data.push(conversation);
      await this.saveData(data);
    }

    return conversation;
  }

  private async updateConversationHistory(
    id_user: number,
    id_chat: string,
    newMessages: any[],
  ): Promise<void> {
    const data = await this.loadData();
    const conversation = data.find(
      (conv) => conv.id_usuario === id_user && conv.id_chat === id_chat,
    );

    if (!conversation) {
      throw new Error(
        `Conversación con id_chat ${id_chat} no encontrada para el usuario ${id_user}.`,
      );
    }

    conversation.history.push(...newMessages);
    await this.saveData(data);
  }

  public async getChatsByUserId(
    id_usuario: number,
  ): Promise<{ id_chat: string; label_chat: string }[]> {
    const data = await this.loadData();
    const userChats = data
      .filter((conv) => conv.id_usuario == id_usuario)
      .map((conv) => ({
        id_chat: conv.id_chat,
        label_chat: conv.label_chat,
      }));

    return userChats;
  }

  public async getChatById(id_chat: string): Promise<{ history: any }[]> {
    const data = await this.loadData();
    const history = data
      .filter((conv) => conv.id_chat == id_chat)
      .map((conv) => ({
        history: conv.history.filter((o) => o.bot == 1 && o.label),
      }));

    return history;
  }

  public async deleteChatById(id_chat: string): Promise<{ delete: boolean }> {
    try {
      const data = await this.loadData();
      const updatedData = data.filter((conv) => conv.id_chat !== id_chat);

      await this.saveData(updatedData);
      return { delete: true };
    } catch (error) {
      return { delete: false };
    }
  }

  public async chatV3(prompt: any, id_chat: any, id_user: any): Promise<any> {
    let systemContent = ``;
    let model = 'gpt-4o';
    const tables = {
      documentos_rechazos: [
        'id_documentos',
        'fecha_rechazo',
        'observacion_revision',
      ],
      empresas: [
        'id_empresas',
        'nombre',
        'razon_social_cliente',
        'cuit_cliente',
        'activa',
        'nacionalidad',
        'id_grupos',
        'fecha_hora_carga',
        'eliminado',
      ],
      proveedores: [
        'id_proveedores',
        'cuit',
        'id_empresas',
        'nombre_razon_social',
        'nombre_comercial',
        'domicilio_legal',
        'email',
        'nacionalidad',
        'fecha_hora_carga',
      ],
      empleados: [
        'id_empleados',
        'id_proveedores',
        'apellido',
        'nombre',
        'dni',
        'cuil',
        'domicilio',
        'estado',
        'anulado',
        'eliminado',
        'baja_afip',
        'id_motivos_baja_afip',
        'fecha_baja_afip',
        'estado',
        'fecha_ingreso',
        'sexo',
        'fecha_nacimiento',
      ],
      documentos: [
        'id',
        'id_documentos',
        'fecha_hora_creacion',
        'id_documentos_tipos',
        'tipo_entidad',
        'modulo',
        'tipo_entidad',
        'id_entidad',
        'estado',
        'fecha_hora_modifica',
        'id_empresas',
      ],
      documentos_tipos: [
        'id_documentos_tipos',
        'nombre',
        'tipo',
        'ayuda',
        'nacionalidad',
      ],
      empresas_grupos: ['id_grupos', 'nombre', 'tipo_cliente'],
    };
    let sqlResponseIa;
    let extractedSql;
    let processResponse;
    let system;
    let user;
    let response;
    let resultSQL;
    let chatHistory;

    const getTableStructure = await this.queryService.getTableStructure(tables);

    const conversation = await this.getOrCreateConversation(
      id_user,
      prompt,
      id_chat,
    );
    const currentChatId = conversation.id_chat;

    systemContent = `Generar consultas MariaDB tipo SELECT (mínimo 6 columnas, máximo 10 filas) utilizando la ESTRUCTURA DE TABLAS, sin comentarios ni nada adicional, tomando en cuenta:    Clientes = Empresas.
    Contratistas = Proveedores.
    Uso de LIKE y %% para nombres propios (empresas, empleados, proveedores, etc).
    Alias: Siempre descriptivos.
    Empleado habilitado: eliminado = 0 AND baja_afip = 0 AND anulado = 0.
    Antigüedad: fecha_ingreso != '0000-00-00'.
    Empresa habilitada: eliminado = 0 AND activa = 1.
    Documentos relacionados por tipo_entidad y id_entidad:
    empleado → tabla: empleados → clave: id_empleados = id_entidad.
    vehiculo → tabla: vehiculos → clave: id_vehiculos = id_entidad.
    proveedor → tabla: proveedores → clave: id_proveedores = id_entidad.
    socio → tabla: socios → clave: id_socios = id_entidad.
    Estados de documentos:
    1 = Incompleto.
    2 = Rechazado.
    3 = Pendiente.
    4 = Aprobado.
    Motivo del Rechazo de un documento: buscar en documentos_rechazos.observacion_revision donde coincida con id_documentos.
    Modalidad de empresa:
    "integral" = directo.
    "renting" = indirecto.`;

    let systemC = {
      role: 'system',
      bot: 0,
      content: `ESTRUCTURA DE TABLAS: ${JSON.stringify(getTableStructure)}`,
    };

    system = {
      role: 'system',
      bot: 0,
      content: systemContent,
    };
    user = {
      role: 'user',
      bot: 0,
      content: prompt,
    };

    await this.updateConversationHistory(id_user, currentChatId, [
      systemC,
      system,
      user,
    ]);

    chatHistory = await this.loadData();
    const bot0History =
      chatHistory
        .find((conv) => conv.id_chat === currentChatId)
        ?.history.filter((item) => item.bot === 0) || [];

    sqlResponseIa = await this.openAIService.useGpt4ModelV2(
      model,
      0.3,
      250,
      bot0History,
    );

    extractedSql =
      await this.queryService.extractAndSanitizeQuery(sqlResponseIa);
    if (!extractedSql) {
      throw new Error(
        'Verifique la logica de su consulta e intente nuevamente',
      );
    }

    response = await this.databaseService.executeQuery(extractedSql);

    system = {
      role: 'system',
      bot: 0,
      content: sqlResponseIa.choices[0].message.content,
    };

    resultSQL = {
      role: 'system',
      bot: 0,
      content: JSON.stringify(response),
    };

    await this.updateConversationHistory(id_user, currentChatId, [
      system,
      resultSQL,
    ]);

    systemContent = `SIN HACER MENCION DE LA EXISTENCIA DE UN CONTEXTO generare un informe extenso, detallado y completo (utilizando todo el contexto SIEMPRE) en formato de parrafo de respuesta con estilos como listas, saltos de linea y destacando en negrita con **Palabra importante**. Interpretaré los valores de "estado" del documento como: **ESTADO 1** = INCOMPLETO, **ESTADO 2** = RECHAZADO, **ESTADO 3** = PENDIENTE, **ESTADO 4** = APROBADO.`;

    system = {
      role: 'system',
      bot: 1,
      content: systemContent,
    };

    resultSQL = {
      role: 'system',
      bot: 1,
      content: `CONTEXTO: ${JSON.stringify(response)}`,
    };

    await this.updateConversationHistory(id_user, currentChatId, [
      system,
      resultSQL,
    ]);

    user = {
      role: 'user',
      bot: 1,
      label: true,
      content: prompt,
    };

    await this.updateConversationHistory(id_user, currentChatId, [user]);

    chatHistory = await this.loadData();

    const bot1History =
      chatHistory
        .find((conv) => conv.id_chat === currentChatId)
        ?.history.filter((item) => item.bot === 1) || [];

    processResponse = await this.openAIService.useGpt4ModelV2(
      model,
      0.6,
      null,
      bot1History,
    );

    system = {
      role: 'system',
      bot: 1,
      label: true,
      responseSQL: response,
      onRefresh: prompt,
      content: processResponse.choices[0].message.content,
    };

    await this.updateConversationHistory(id_user, currentChatId, [system]);

    chatHistory = await this.loadData();

    return {
      message: 'Success',
      responseIA: processResponse.choices[0].message.content,
      querySQL: extractedSql,
      responseSQL: response,
      // history: {
      //   bot0: chatHistory.find(conv => conv.id_chat === currentChatId)?.history.filter(item => item.bot === 0) || [],
      //   bot1: chatHistory.find(conv => conv.id_chat === currentChatId)?.history.filter(item => item.bot === 1) || [],
      // },
      fullHistory: chatHistory,
      history:
        chatHistory
          .find((conv) => conv.id_chat === currentChatId)
          ?.history.filter((item) => item.bot === 1 && item.label) || [],
      prompt,
      id_chat: currentChatId,
    };
  }
}
