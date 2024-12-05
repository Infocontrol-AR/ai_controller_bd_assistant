import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../libs/database/database.service';
import { QueryService } from '../libs/query/query.service';
import { OpenAIService } from '../libs/openai/openai.service';
import { HistoryService } from './history.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly queryService: QueryService,
    private readonly openAIService: OpenAIService,
    private readonly historyService: HistoryService,
  ) {}

  private async createNewConversation(prompt: any): Promise<any> {
    const instrucciones = `      Basado en la solicitud del usuario, crearé un título de conversación de 3 a 4 palabras que sea coherente y significativo. Debe componer EL TITULO DE UNA NUEVA CONVERSACIÓN. Solo devolveré el título, sin información adicional, y me basaré exclusivamente en la solicitud del usuario para generar un título sobrio.`;
    const messages = [
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

    const tituloChatResponse = await this.openAIService.useGpt4ModelV2(
      'gpt-4o',
      0.1,
      50,
      messages,
    );

    if ('error' in tituloChatResponse) {
      throw new Error(tituloChatResponse.error);
    }

    return {
      label_chat: tituloChatResponse.choices[0].message.content,
    };
  }

  public async getOrCreateConversation(
    id_user: number,
    prompt: string,
    id_chat?: number,
  ): Promise<any> {
    //console.log(id_chat, id_user, 3);
    return this.historyService.getOrCreateConversation(
      id_user,
      prompt,
      id_chat,
      (p) => this.createNewConversation(p),
    );
  }

  public async updateConversationHistory(
    id_user: number,
    id_chat: string,
    newMessages: any[],
  ): Promise<void> {
    await this.historyService.updateConversationHistory(
      id_user,
      id_chat,
      newMessages,
    );
  }

  public async getChatsByUserId(
    id_usuario: number,
  ): Promise<{ id_chat: string; label_chat: string }[]> {
    return this.historyService.getChatsByUserId(id_usuario);
  }

  public async getChatById(id_chat: string): Promise<{ history: any }[]> {
    return this.historyService.getChatById(id_chat);
  }

  public async deleteChatById(id_chat: string): Promise<{ delete: boolean }> {
    return this.historyService.deleteChatById(id_chat);
  }

  public async chatV3(
    prompt: string,
    id_chat: number,
    id_user: number,
  ): Promise<any> {
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

    const currentChatId = conversation.id_chat || conversation.id;

   console.log(currentChatId, conversation);

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

    chatHistory = await this.historyService.loadData(currentChatId, 0);

    sqlResponseIa = await this.openAIService.useGpt4ModelV2(
      model,
      0.3,
      250,
      chatHistory[0].history,
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

   // console.log(currentChatId, conversation);

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
      visible: true,
      content: prompt,
    };

    await this.updateConversationHistory(id_user, currentChatId, [user]);

    chatHistory = await this.historyService.loadData(currentChatId, 1);

   // console.log(currentChatId, conversation);

    processResponse = await this.openAIService.useGpt4ModelV2(
      model,
      0.6,
      null,
      chatHistory[0].history,
    );

    system = {
      role: 'system',
      bot: 1,
      visible: true,
      responseSQL: response,
      onRefresh: prompt,
      content: processResponse.choices[0].message.content,
    };

    await this.updateConversationHistory(id_user, currentChatId, [system]);

    chatHistory = await this.historyService.loadData(currentChatId);

  // console.log(currentChatId, conversation);

    return {
      message: 'Success',
      responseIA: processResponse.choices[0].message.content,
      querySQL: extractedSql,
      responseSQL: response,
      history: chatHistory[0].history,
      prompt,
      id_chat: currentChatId,
    };
  }
}
