import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../libs/database/database.service';
import { QueryService } from '../libs/query/query.service';
import { OpenAIService } from '../libs/openai/openai.service';

@Injectable()
export class ChatService {
  private history: { role: string; content: any }[] = [];
  private response: any[] = [];

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly queryService: QueryService,
    private readonly openAIService: OpenAIService,
  ) {}

  public async chatV3(prompt: any): Promise<any> {
    let systemContent = ``;
    let model = 'gpt-4o';

    const tables = {
      empresas: [
        'id_empresas',
        'nombre',
        'razon_social_cliente',
        'cuit_cliente',
        'activa',
        'nacionalidad',
        'id_grupos',
        'periodo_inicio_proceso',
        'codigo',
        'fecha_hora_carga',
        'eliminado',
        'zendesk_chat',
      ],
      proveedores: [
        'id_proveedores',
        'cuit',
        'id_empresas',
        'activo_empresa',
        'nombre_razon_social',
        'nombre_comercial',
        'domicilio_legal',
        'email',
      ],
      empleados: [
        'id_empleados',
        'id_proveedores',
        'apellido',
        'nombre',
        'dni',
        'cuil',
        'estado',
        'anulado',
        'eliminado',
        'baja_afip',
        'id_motivos_baja_afip',
        'fecha_baja_afip',
        'estado_doc_baja',
        'sexo',
        'fecha_nacimiento',
      ],
      documentos: [
        'id',
        'id_documentos',
        'id_usuarios_carga',
        'fecha_hora_creacion',
        'id_documentos_tipos',
        'id_documentos_reglas',
        'tipo_entidad',
        'modulo',
        'id_entidad',
        'estado',
        'fecha_vencimiento',
        'estado_doc',
        'fecha_vencimiento_doc',
        'nombre_archivo',
        'fecha_inicio',
        'mes',
        'anio',
        'categoria',
        'estado_baja',
        'tipo_baja',
        'motivo_baja',
        'fecha_hora_modifica',
        'id_empresas',
        'fecha_rechazo',
      ],
      documentos_tipos: [
        'id_documentos_tipos',
        'nombre',
        'tipo',
        'tipos_entidad_mostrar',
        'fecha_vencimiento',
        'nombre_archivo',
        'fecha_inicio',
        'mes',
        'anio',
      ],
      empresas_grupos: [
        'id_grupos',
        'nombre',
        'tipo_cliente',
        'oc_modalidad_carga',
      ],
    };

    let sqlResponseIa;

    let extractedSql;

    let processResponse;

    let system;

    let user;

    let promptUser = {};

    const getTableStructure = await this.queryService.getTableStructure(tables);

    promptUser = {
      prompt: prompt,
      // contexto_adicional: this.response,
    };

    systemContent = `
    Dada la siguiente estructura de tablas:
    ${JSON.stringify(getTableStructure)}
    
    Genera una consulta SELECT en MariaDB basada en la solicitud del usuario, siguiendo estas pautas:
    - Respetar la estructura de las tablas (columnas y tablas existentes).
    - Asegurar que la consulta sea eficiente, robusta y limitada a 5 filas.
    - Incluir subconsultas con un máximo de una fila.
    - Utilizar JOINS con al menos 5 columnas de la tabla referenciada.
    - Aplicar condiciones WHERE y AND.
    - Incluir un criterio de ordenación (ORDER BY).
    - Usar GROUP BY cuando sea necesario.
    - Seleccionar al menos 5 columnas.
    - Emplear LIKE y % para nombres o nombres propios cuando sea pertinente.
    - Contextualizar con consultas anteriores o resultados de las mismas si el usuario lo requiere directa o indirectamente.
    
    Retorna solo la consulta MariaDB en formato válido, sin comentarios ni texto adicional.
    El usuario proporcionará su solicitud a continuación.
    `;    

    system = {
      role: 'system',
      content: [
        {
          type: 'text',
          text: systemContent,
        },
      ],
    };

    user = {
      role: 'user',
      content: JSON.stringify(promptUser),
    };

    this.history.push(system, user);

    sqlResponseIa = await this.openAIService.useGpt4ModelV2(
      model,
      0.8,
      200,
      this.history,
    );

    extractedSql =
      await this.queryService.extractAndSanitizeQuery(sqlResponseIa);
    if (!extractedSql)
      throw new Error(
        'Verifique la logica de su consulta e intente nuevamente',
      );

    this.response = await this.databaseService.executeQuery(extractedSql);

    system = {
      role: 'system',
      content: [
        {
          type: 'text',
          text: JSON.stringify(sqlResponseIa.choices[0].message.content),
        },
      ],
    };

    let resultSQL = {
      role: 'system',
      content: [
        {
          type: 'text',
          text: JSON.stringify(this.response),
        },
      ],
    };

    this.history.push(system, resultSQL);

    systemContent = `Eres un asistente amigable y eficiente. Cuando un usuario realiza una solicitud, primero verifica si el contexto proporcionado contiene información relevante en el JSON. 

      - **Si el JSON está vacío** (por ejemplo, "[]"), responde a la solicitud del usuario indicando de forma clara y amable que no hay registros disponibles o que no hay información para responder su pregunta.
      - **Si el JSON contiene datos**, responde a la solicitud del usuario usando esta información, asegurándote de que el informe sea útil.
      
      Cuando el contexto tiene datos:
      - Responde de manera clara y amigable, resaltando palabras o frases importantes con **negritas**.
      - Interpreta el “estado” o “estado de documento” con las siguientes traducciones:
        - **ESTADO 1**: INCOMPLETO
        - **ESTADO 2**: RECHAZADO
        - **ESTADO 3**: PENDIENTE
        - **ESTADO 4**: APROBADO
      - Si encuentras valores booleanos, reemplázalos por "SI" o "NO".
      - Asegúrate de que la respuesta sea concisa y directa, presentando la información en un formato de párrafo.
      
      El contexto proporcionado es: 
      ${JSON.stringify(this.response)}
      
      Recuerda que tu respuesta debe ser amigable y clara, sin mencionar en ningún momento la existencia de un JSON o contexto.
      `;

    let messages = [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: systemContent,
          },
        ],
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    processResponse = await this.openAIService.useGpt4ModelV2(
      model,
      0.8,
      null,
      messages,
    );

    return {
      message: 'Success',
      responseIA: processResponse.choices[0].message.content,
      querySQL: extractedSql,
      responseSQL: this.response,
      history: this.history,
      promptUser,
    };
  }
}
