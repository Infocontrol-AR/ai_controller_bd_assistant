import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../libs/database/database.service';
import { QueryService } from '../libs/query/query.service';
import { OpenAIService } from '../libs/openai/openai.service';
import { HistoryService } from './history.service';
import { CrudService } from './crud.service';

@Injectable()
export class ChatService {
  private seeded = false;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly queryService: QueryService,
    private readonly openAIService: OpenAIService,
    private readonly historyService: HistoryService,
    private readonly crudService: CrudService,
  ) {}

  async initialize(): Promise<void> {
    if (!this.seeded) {
      await this.seeders();
      this.seeded = true;
    }
  }
  private async createNewConversation(prompt: any): Promise<any> {
    const setting3 = await this.getSettings(3);
    const instrucciones = setting3.prompt_text;
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
      setting3.model.model_name,
      setting3.model.temperature,
      setting3.model.max_tokens,
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

  private async getSettings(id: number): Promise<any> {
    try {
      const setting = await this.crudService.findOne('setting', id);
      if (!setting) {
        throw new Error(`Setting con id ${id} no encontrado.`);
      }

      const cleanedSetting = this.cleanResponse(setting);

      const prompt = await this.crudService.findOne(
        'prompt',
        cleanedSetting.id_prompt,
      );
      if (!prompt) {
        throw new Error(
          `Prompt con id ${cleanedSetting.id_prompt} no encontrado.`,
        );
      }

      const cleanedPrompt = this.cleanResponse(prompt);

      const model = await this.crudService.findOne(
        'model',
        cleanedSetting.id_model,
      );
      if (!model) {
        throw new Error(
          `Model con id ${cleanedSetting.id_model} no encontrado.`,
        );
      }

      const cleanedModel = this.cleanResponse(model);

      let context_text = null;
      if (cleanedPrompt.id_context) {
        const context = await this.crudService.findOne(
          'context',
          cleanedPrompt.id_context,
        );
        const cleanedContext = this.cleanResponse(context);

        if (cleanedContext) {
          context_text = cleanedContext.context_text;
        }
      }

      return {
        prompt_text: cleanedPrompt.prompt_text,
        context_text,
        model: cleanedModel,
      };
    } catch (error) {
      throw new Error(
        `Error al obtener los datos del setting: ${error.message}`,
      );
    }
  }

  private cleanResponse(response: any): any {
    if (response && response['0']) {
      return { ...response['0'], id: response.id };
    }
    return response;
  }

  // const getTableStructure = await this.queryService.getTableStructure(tables);
  // const tables = {
  //   documentos_rechazos: [
  //     'id_documentos',
  //     'fecha_rechazo',
  //     'observacion_revision',
  //   ],
  //   empresas: [
  //     'id_empresas',
  //     'nombre',
  //     'razon_social_cliente',
  //     'cuit_cliente',
  //     'activa',
  //     'nacionalidad',
  //     'id_grupos',
  //     'fecha_hora_carga',
  //     'eliminado',
  //   ],
  //   proveedores: [
  //     'id_proveedores',
  //     'cuit',
  //     'id_empresas',
  //     'nombre_razon_social',
  //     'nombre_comercial',
  //     'domicilio_legal',
  //     'email',
  //     'nacionalidad',
  //     'fecha_hora_carga',
  //   ],
  //   empleados: [
  //     'id_empleados',
  //     'id_proveedores',
  //     'apellido',
  //     'nombre',
  //     'dni',
  //     'cuil',
  //     'domicilio',
  //     'estado',
  //     'anulado',
  //     'eliminado',
  //     'baja_afip',
  //     'id_motivos_baja_afip',
  //     'fecha_baja_afip',
  //     'estado',
  //     'fecha_ingreso',
  //     'sexo',
  //     'fecha_nacimiento',
  //   ],
  //   documentos: [
  //     'id',
  //     'id_documentos',
  //     'fecha_hora_creacion',
  //     'id_documentos_tipos',
  //     'tipo_entidad',
  //     'modulo',
  //     'tipo_entidad',
  //     'id_entidad',
  //     'estado',
  //     'fecha_hora_modifica',
  //     'id_empresas',
  //   ],
  //   documentos_tipos: [
  //     'id_documentos_tipos',
  //     'nombre',
  //     'tipo',
  //     'ayuda',
  //     'nacionalidad',
  //   ],
  //   empresas_grupos: ['id_grupos', 'nombre', 'tipo_cliente'],
  // };

  private async seeders(): Promise<void> {
    try {
      const data = [
        {
          tableName: 'model',
          operation: 'insert',
          values: [
            {
              model_name: 'gpt-4o',
              model_version: 'v1.0',
              max_tokens: 250,
              temperature: 0.3,
              label: 'querys-sql',
            },
          ],
        },
        {
          tableName: 'context',
          operation: 'insert',
          values: [
            {
              context_text: `{
              documentos_rechazos: [
              {
              column: 'id_documentos',
              type: 'int(11)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_rechazo',
              type: 'datetime',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'observacion_revision',
              type: 'text',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              ],
              empresas: [
              {
              column: 'id_empresas',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nombre',
              type: 'varchar(200)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'razon_social_cliente',
              type: 'varchar(200)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'cuit_cliente',
              type: 'char(200)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'activa',
              type: 'tinyint(1)',
              comment: '0:no; 1:si; si esta usando el sistema',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nacionalidad',
              type: "enum('argentina','chilena','bolivia','brasil','colombia','ecuador','paraguay','peru','uruguay','venezuela','canada','suecia','singapur','mexico')",
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_grupos',
              type: 'char(36)',
              comment: 'si pertenece a algun grupo',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_hora_carga',
              type: 'timestamp',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'eliminado',
              type: 'tinyint(1)',
              comment: '0:no;1:si',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              ],
              proveedores: [
              {
              column: 'id_proveedores',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'cuit',
              type: 'char(20)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_empresas',
              type: 'char(36)',
              isForeignKey: true,
              referenced_table: 'empresas',
              referenced_column: 'id_empresas',
              },
              {
              column: 'nombre_razon_social',
              type: 'varchar(255)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nombre_comercial',
              type: 'varchar(255)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'domicilio_legal',
              type: 'varchar(255)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'email',
              type: 'varchar(255)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_hora_carga',
              type: 'timestamp',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nacionalidad',
              type: "enum('alemania','argentina','australia','bolivia','brasil','canada','chilena','china','colombiana','costa_rica','dinamarca','ee_uu','ecuador','el_salvador','espania','francia','guyana','guatemala','honduras','inglaterra','italia','japon','mexico','nicaragua','paises_bajos','paraguay','peru','rumania','singapur','suecia','suiza','surinam','uruguay','venezuela','taiwan')",
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              ],
              empleados: [
              {
              column: 'id_empleados',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_proveedores',
              type: 'char(36)',
              isForeignKey: true,
              referenced_table: 'proveedores',
              referenced_column: 'id_proveedores',
              },
              {
              column: 'apellido',
              type: 'varchar(50)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nombre',
              type: 'varchar(50)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'dni',
              type: 'char(20)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'cuil',
              type: 'char(20)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'domicilio',
              type: 'varchar(255)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_ingreso',
              type: 'date',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'estado',
              type: 'bigint(1)',
              comment: 'ver tabla estados',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'anulado',
              type: 'bigint(1)',
              comment: '0:no;1:si',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'eliminado',
              type: 'tinyint(1)',
              comment: '0:no; 1:si; indica si fue eliminado',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'baja_afip',
              type: 'tinyint(1)',
              comment: '0:no;1:si; indica si se dio de baja definitiva',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_motivos_baja_afip',
              type: 'int(1)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_baja_afip',
              type: 'date',
              comment: 'para calcular las 48hs ',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'sexo',
              type: 'bigint(1)',
              comment: '1:M;2:F',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_nacimiento',
              type: 'date',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              ],
              documentos: [
              {
              column: 'id',
              type: 'int(1)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_documentos',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_hora_creacion',
              type: 'timestamp',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_documentos_tipos',
              type: 'char(36)',
              isForeignKey: true,
              referenced_table: 'documentos_tipos',
              referenced_column: 'id_documentos_tipos',
              },
              {
              column: 'tipo_entidad',
              type: "enum('empleado','vehiculo','proveedor','socio','planes_pago','ordenes_compra')",
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'modulo',
              type: "enum('datos_especificos','datos_generales','datos_impositivos','datos_laborales','socios','trabajadores','transporte_internacional','vehiculos','planes_pago','datos_hys','ordenes_compra')",
              comment: 'usado para proveedores mas que nada',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_entidad',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'estado',
              type: 'bigint(1)',
              comment: 'ver tabla estados',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'fecha_hora_modifica',
              type: 'datetime',
              comment: 'se actualiza por trigger',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'id_empresas',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              ],
              documentos_tipos: [
              {
              column: 'id_documentos_tipos',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nombre',
              type: 'varchar(200)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'tipo',
              type: "enum('general','laboral')",
              comment: 'indica que tipo de documento es',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'ayuda',
              type: 'text',
              comment: 'muestra ayuda sobre el manejo del documento',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nacionalidad',
              type: "enum('argentina','chilena','argentina_chilena')",
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              ],
              empresas_grupos: [
              {
              column: 'id_grupos',
              type: 'char(36)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'nombre',
              type: 'varchar(50)',
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              {
              column: 'tipo_cliente',
              type: "enum('directo','indirecto')",
              isForeignKey: false,
              referenced_table: undefined,
              referenced_column: undefined,
              },
              ],
              }`,
            },
          ],
        },
        {
          tableName: 'prompt',
          operation: 'insert',
          values: [
            {
              prompt_text: `Generar consultas MariaDB tipo SELECT (mínimo 6 columnas, máximo 10 filas) utilizando la ESTRUCTURA DE TABLAS, sin comentarios ni nada adicional, tomando en cuenta:    Clientes = Empresas.
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
          "renting" = indirecto.`,
              id_context: 1,
            },
          ],
        },
        {
          tableName: 'setting',
          operation: 'insert',
          values: [
            {
              id_model: 1,
              id_prompt: 1,
            },
          ],
        },
        ///
        {
          tableName: 'model',
          operation: 'insert',
          values: [
            {
              model_name: 'gpt-4o',
              model_version: 'v1.0',
              max_tokens: 600,
              temperature: 0.6,
              label: 'querys-sql-informe-nl',
            },
          ],
        },
        {
          tableName: 'prompt',
          operation: 'insert',
          values: [
            {
              prompt_text: `SIN HACER MENCION DE LA EXISTENCIA DE UN CONTEXTO generare un informe extenso, detallado y completo (utilizando todo el contexto SIEMPRE) en formato de parrafo de respuesta con estilos como listas, saltos de linea y destacando en negrita con **Palabra importante**. Interpretaré los valores de "estado" del documento como: **ESTADO 1** = INCOMPLETO, **ESTADO 2** = RECHAZADO, **ESTADO 3** = PENDIENTE, **ESTADO 4** = APROBADO.`,
            },
          ],
        },
        {
          tableName: 'setting',
          operation: 'insert',
          values: [
            {
              id_model: 2,
              id_prompt: 2,
            },
          ],
        },
        /////
        {
          tableName: 'model',
          operation: 'insert',
          values: [
            {
              model_name: 'gpt-4o',
              model_version: 'v1.0',
              max_tokens: 50,
              temperature: 0.1,
              label: 'generar-label-chat',
            },
          ],
        },
        {
          tableName: 'prompt',
          operation: 'insert',
          values: [
            {
              prompt_text: `Basado en la solicitud del usuario, crearé un título de conversación de 3 a 4 palabras que sea coherente y significativo. Debe componer EL TITULO DE UNA NUEVA CONVERSACIÓN. Solo devolveré el título, sin información adicional, y me basaré exclusivamente en la solicitud del usuario para generar un título sobrio.`,
            },
          ],
        },
        {
          tableName: 'setting',
          operation: 'insert',
          values: [
            {
              id_model: 3,
              id_prompt: 3,
            },
          ],
        },
      ];

      for (const d of data) {
        await this.crudService.create(d.tableName, d.values);
      }
    } catch (error) {
      throw new Error(`Error al insertar los seeders : ${error.message}`);
    }
  }

  public async chatV3(
    prompt: string,
    id_chat: number,
    id_user: number,
  ): Promise<any> {
    let systemContent = ``;
    let sqlResponseIa;
    let extractedSql;
    let processResponse;
    let system;
    let user;
    let response;
    let resultSQL;
    let chatHistory;

    await this.initialize();

    const setting1 = await this.getSettings(1);

    // return setting1;

    const conversation = await this.getOrCreateConversation(
      id_user,
      prompt,
      id_chat,
    );

    const currentChatId = conversation.id_chat || conversation.id;

   // console.log(currentChatId, conversation);

    systemContent = setting1.prompt_text;

    let systemC = {
      role: 'system',
      bot: 0,
      content: setting1.context_text,
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
      setting1.model.model_name,
      setting1.model.temperature,
      setting1.model.max_tokens,
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

    //// console.log(currentChatId, conversation);

    const setting2 = await this.getSettings(2);

    systemContent = setting2.prompt_text;

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

    //// console.log(currentChatId, conversation);

    processResponse = await this.openAIService.useGpt4ModelV2(
      setting2.model.model_name,
      setting2.model.temperature,
      setting2.model.max_tokens || null,
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

    //// console.log(currentChatId, conversation);

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
