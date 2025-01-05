import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../libs/database/database.service';
import { QueryService } from '../libs/query/query.service';
import { OpenAIService } from '../libs/openai/openai.service';
import { ComputerVisionService } from '../libs/computer-vision/computer-vision.service';
import { HistoryService } from './history.service';
import { CrudService } from './crud.service';
import { Files } from 'openai/resources';

@Injectable()
export class ChatService {
  private seeded = false;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly queryService: QueryService,
    private readonly openAIService: OpenAIService,
    private readonly historyService: HistoryService,
    private readonly crudService: CrudService,
    private readonly computerVisionService: ComputerVisionService,
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

  public async changeChatStatus(id_chat, status): Promise<any> {
    const context = await this.crudService.update('chat', id_chat, { status });

    return context;
  }

  private cleanResponse(response: any): any {
    if (response && response['0']) {
      return { ...response['0'], id: response.id };
    }
    return response;
  }

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
              max_tokens: 1500,
              temperature: 0.5,
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
              prompt_text: `SIEMPRE RESPONDERE EN FORMATO JSON. Verifica el historial para intentar responder al usuario. Si hay coincidencia, responde como asistente amigable en JSON: {"mode": 0, "response": "respuesta en lenguaje natural"}. Si no puedes responder genera una consulta MARIA DB para intentar responder al usuario {"mode": 1, "response": "QUERY MARIA DB PURA"}, SOLO CONSULTAS TIPO 'SELECT' puedes tomar en cuenta: filtrar por 'id_empresas' (SOLO RESPONDERAS PREGUNTAS DE ESTA EMPRESA) (para empleados: empleado -> id_proveedores -> proveedor -> id_empresas), usar LIKE y %% para nombres, incluir solo registros activos: empleados (eliminado = 0, baja_afip = 0, anulado = 0, fecha_ingreso != '0000-00-00'), empresas (eliminado = 0, activa = 1). Basarse en 'tipo_entidad' y 'id_entidad': empleados ('id_empleados'), vehículos ('id_vehiculos'), proveedores ('id_proveedores'), socios ('id_socios'). Estados de documentos: 1 = Incompleto, 2 = Rechazado, 3 = Pendiente, 4 = Aprobado (documentos -> documento -> estado). Motivo de rechazo en 'observacion_revision' de 'documentos_rechazos'. Consultas: entre 6-10 columnas, máximo 10 filas, considerar modalidades: "integral" (directo) o "renting" (indirecto). Responde exclusivamente en JSON válido para JSON.parse(). Respuestas negativas o no lógicas: {"mode": 0, "response": "No puedo responder a esa pregunta.", "motivo": "Motivo del rechazo en lenguaje natural"}.`,
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
              max_tokens: 800,
              temperature: 0.5,
              label: 'querys-sql-informe-nl',
            },
          ],
        },
        {
          tableName: 'prompt',
          operation: 'insert',
          values: [
            {
              prompt_text: `A modo de asistente respondere a las preguntas del usuario (con texto decorado: negrita, saltos de linea, listas, etc.) utilizando todo el contexto no hare mención del mismo. Interpretaré los valores de "estado" como: 1 = INCOMPLETO, 2 = RECHAZADO, 3 = PENDIENTE, 4 = APROBADO.`,
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

  private async base64OcrAzure(documents): Promise<any> {
    const analyzedDocuments = await Promise.all(
      documents.map(async (d) => {
        const ocr = await this.computerVisionService.analyzeDocumentFromBase64(
          d.content,
        );
        return {
          name: d.name,
          content: ocr.content,
        };
      }),
    );

    return analyzedDocuments;
  }

  public async chatV3(
    prompt: string,
    id_chat: number,
    id_user: number,
    id_empresas: string,
    documents: any,
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

    const conversation = await this.getOrCreateConversation(
      id_user,
      prompt,
      id_chat,
    );

    const currentChatId = conversation.id_chat || conversation.id;

    const setting1 = await this.getSettings(1);

    let contextDocs = 'NO HAY CONTEXTO DE DOCUMENTOS';

    if (documents) {
      const result = await this.base64OcrAzure(documents);

      contextDocs = '';
      result.forEach((doc) => {
        contextDocs += `DOCUMENTO NOMBRE: ${doc.name}. \n CONTENIDO: ${doc.content} \n \n`;
      });
    }

    let systemDocs = {
      role: 'user',
      bot: 2,
      content: contextDocs,
    };

    systemContent = setting1.prompt_text;

    let systemC = {
      role: 'system',
      bot: 0,
      content: setting1.context_text,
    };

    let contextId_empresas = {
      role: 'system',
      bot: 0,
      content: `ID_ EMPRESAS DE EL USUARIO ACTUAL: ${id_empresas}`,
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
      systemDocs,
      systemC,
      contextId_empresas,
      system,
      user,
    ]);

    chatHistory = await this.historyService.loadData(currentChatId, 0);

    try {
      sqlResponseIa = await this.openAIService.useGpt4ModelV2(
        setting1.model.model_name,
        setting1.model.temperature,
        setting1.model.max_tokens,
        chatHistory[0].history,
      );

      console.log(sqlResponseIa);

      console.log(sqlResponseIa.choices[0].message.content);

      const crudoJSON = await this.queryService.toJSON(
        sqlResponseIa.choices[0].message.content,
      );

      if (!crudoJSON) {
        const system0 = {
          role: 'system',
          bot: 0,
          // visible: true,
          responseSQL: [],
          onRefresh: prompt,
          content:
            'Ocurrio un error al ejecutar la consulta, puede intentar nuevamente más tarde',
        };

        user = {
          role: 'user',
          bot: 1,
          visible: true,
          content: prompt,
          files: documents || [],
        };

        system = {
          role: 'system',
          bot: 1,
          visible: true,
          responseSQL: [],
          onRefresh: prompt,
          content:
            'Ocurrio un error al ejecutar la consulta, puede intentar nuevamente más tarde',
        };

        await this.updateConversationHistory(id_user, currentChatId, [
          system0,
          user,
          system,
        ]);

        chatHistory = await this.historyService.loadData(currentChatId);

        return {
          history: chatHistory[0].history,
          id_chat: currentChatId,
        };
      }

      switch (parseInt(crudoJSON.mode)) {
        case 1:
          response = await this.databaseService.executeQuery(
            crudoJSON.response,
          );

          if (!response) {
            const system0 = {
              role: 'system',
              bot: 0,
              // visible: true,
              responseSQL: [],
              onRefresh: prompt,
              content:
                'Ocurrio un error al ejecutar la consulta, puede intentar nuevamente más tarde',
            };

            user = {
              role: 'user',
              bot: 1,
              visible: true,
              content: prompt,
              files: documents || [],
            };

            system = {
              role: 'system',
              bot: 1,
              visible: true,
              responseSQL: [],
              onRefresh: prompt,
              content:
                'Ocurrio un error al ejecutar la consulta, puede intentar nuevamente más tarde',
            };

            await this.updateConversationHistory(id_user, currentChatId, [
              system0,
              user,
              system,
            ]);

            chatHistory = await this.historyService.loadData(currentChatId);

            return {
              history: chatHistory[0].history,
              id_chat: currentChatId,
            };
          }

          system = {
            role: 'system',
            bot: 0,
            content: crudoJSON.response,
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

          const setting2 = await this.getSettings(2);

          systemContent = setting2.prompt_text;

          system = {
            role: 'system',
            bot: 1,
            content: systemContent,
          };

          const sysDocs = {
            role: 'system',
            bot: 1,
            content: contextDocs,
          };

          resultSQL = {
            role: 'system',
            bot: 1,
            content: JSON.stringify(response),
          };

          user = {
            role: 'user',
            bot: 1,
            visible: true,
            content: prompt,
            files: documents || [],
          };

          // console.log(resultSQL);

          await this.updateConversationHistory(id_user, currentChatId, [
            sysDocs,
            resultSQL,
            system,
          ]);

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

          await this.updateConversationHistory(id_user, currentChatId, [
            system,
          ]);

          chatHistory = await this.historyService.loadData(currentChatId);

          return {
            history: chatHistory[0].history,
            id_chat: currentChatId,
          };

          //// console.log(currentChatId, conversation);

          break;

        case 0:
          const system0 = {
            role: 'system',
            bot: 0,
            // visible: true,
            responseSQL: [],
            onRefresh: prompt,
            content: crudoJSON.response,
          };

          user = {
            role: 'user',
            bot: 1,
            visible: true,
            content: prompt,
            files: documents || [],
          };

          system = {
            role: 'system',
            bot: 1,
            visible: true,
            responseSQL: response,
            onRefresh: prompt,
            content: crudoJSON.response,
          };

          await this.updateConversationHistory(id_user, currentChatId, [
            system0,
            user,
            system,
          ]);

          chatHistory = await this.historyService.loadData(currentChatId);

          return {
            history: chatHistory[0].history,
            id_chat: currentChatId,
          };

          break;
      }
    } catch (error) {
      console.log('soy un error');

      const system0 = {
        role: 'system',
        bot: 0,
        // visible: true,
        responseSQL: [],
        onRefresh: prompt,
        content:
          'Ocurrio un error al obtener la respuesta, puede intentar nuevamente más tarde',
      };

      user = {
        role: 'user',
        bot: 1,
        visible: true,
        content: prompt,
        files: documents || [],
      };

      system = {
        role: 'system',
        bot: 1,
        visible: true,
        responseSQL: [],
        onRefresh: prompt,
        content:
          'Ocurrio un error al obtener la respuesta, puede intentar nuevamente más tarde',
      };

      await this.updateConversationHistory(id_user, currentChatId, [
        system0,
        user,
        system,
      ]);

      chatHistory = await this.historyService.loadData(currentChatId);

      return {
        history: chatHistory[0].history,
        id_chat: currentChatId,
      };
    }
  }
}
