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

    try {
      const getTableStructure =
        await this.queryService.getTableStructure(tables);

      // return res.status(HttpStatus.OK).json({
      //   getTableStructure,
      // });

      promptUser = {
        prompt: prompt,
        contexto_adicional: this.response,
      };

      systemContent = `### CONTEXTO:

**ESTRUCTURA DE TABLA (JSON)**  
La estructura incluye varias tablas y sus columnas, cada una representada como un objeto con los siguientes atributos:

${JSON.stringify(getTableStructure)}

**Atributos**:
- 'column': Nombre de la columna.
- 'type': Tipo de dato de la columna.
- 'comment': Descripción de la columna.
- 'isForeignKey': Indica si es una clave foránea.
- 'referenced_table': Tabla referenciada si es clave foránea.
- 'referenced_column': Columna de la tabla referenciada.

**IMPORTANCIA DEL CONTEXTO ADICIONAL**  
El usuario puede proporcionar contexto adicional que enriquecerá su solicitud y permitirá generar una consulta MySQL más precisa. Por favor, asegúrate de incluir información relevante que se utilizará para filtrar o detallar los criterios de búsqueda.

Ejemplo de contexto adicional:

{
  "prompt": "A qué empresa pertenece?",
  "contexto_adicional": [
    {
      "Nombre": "Juan",
      "Apellido": "Pérez",
      "id": 1
    }
  ]
}

Este contexto se interpretará junto con el prompt, mejorando la precisión de la consulta SQL generada.

INSTRUCCIONES
Generaré una consulta SQL SELECT basada en la estructura de las tablas y columnas, el contexto adicional y el prompt recibido. Cumpliré con lo siguiente:

Sintaxis: Consulta compatible con MySQL.
Lógica: Respetaré la estructura de la tabla y los tipos de datos.
Límite: Devolveré hasta 10 filas si no se especifica lo contrario.
Subconsultas: Limitaré a 1 fila para evitar errores o cargas innecesarias.
JOINs: Incluiré al menos 5 columnas relevantes y alias para mejorar la legibilidad en consultas que involucren múltiples tablas.
Filtrado: Aplicaré cláusulas WHERE relevantes usando el contexto adicional.
Ordenamiento: Incluiré ORDER BY si la consulta lo requiere.
Agregación: Usaré GROUP BY si el prompt lo necesita.
Selección de Columnas: Elegiré un mínimo de 5 columnas de interés, considerando JOINs.
Coincidencias Aproximadas: Utilizaré LIKE con '%' para coincidencias aproximadas si es pertinente.
GENERACIÓN DE CONSULTA
Basaré la consulta en el JSON de la estructura de las tablas y en el contexto adicional ("contexto_adicional") para aclarar ambigüedades y asegurar precisión.

Si la solicitud del usuario es poco clara o incoherente, utilizaré el contexto adicional para construir una consulta MySQL adecuada.

Salida: Produciré solo la consulta SQL, sin explicaciones ni comentarios. Solo generaré consultas de tipo SELECT y devolveré 0 si la solicitud no se relaciona con el contexto.

Por favor, asegúrate de que tu solicitud sea clara para facilitar una generación precisa de la consulta SQL.`;

      // console.log(systemContent);

      // console.log(history);

      // return;

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
        0.7,
        500,
        this.history,
      );

      //console.log(sqlResponseIa);

      // return res.status(HttpStatus.OK).json(sqlResponseIa);

      extractedSql =
        await this.queryService.extractAndSanitizeQuery(sqlResponseIa);
      if (!extractedSql || extractedSql == '0')
        throw new Error(
          'Verifique la logica de su consulta e intente nuevamente',
        );

      this.response = await this.databaseService.executeQuery(extractedSql);

      // system = {
      //   role: 'system',
      //   content: [
      //     {
      //       type: 'text',
      //       text: JSON.stringify(this.response),
      //     },
      //   ],
      // };

      // this.history.push(system);

      //console.log(response);

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

      // console.log('0: ', systemContent);

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
        messages
      );

      // console.log('1: ', promptUser);

      // console.log('2: ', extractedSql);

      // console.log('3: ', this.response);

      // console.log('4: ', processResponse.choices[0].message.content);

      return {
        message: 'Success',
        responseIA: processResponse.choices[0].message.content,
        querySQL: extractedSql,
        responseSQL: this.response,
        history: this.history,
        promptUser,
      };
    } catch (e) {
      return {
        message: e.message || 'Error desconocido',
        responseIA:
          processResponse.choices[0].message.content ||
          'Sin respuesta textual de la IA',
        querySQL: extractedSql || 'La IA no genero la query MYSQL',
        responseSQL: this.response || 'No se ejecuto la Query MYSQL',
        history: this.history || 'No hay un historial de conversación',
        promptUser: promptUser || 'No hay solicitud del Usuario',
      };
    }
  }
}
