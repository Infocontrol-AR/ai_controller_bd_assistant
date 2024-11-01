import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { BotService } from '../services/bot.service';
import { QueryService } from '../services/query.service';
import { ChatBotDto } from '../dto/chat-bot.dot';
import { DatabaseService } from '../services/database.service';

@Controller('bot')
export class BotController {
  private history: { role: string; content: any }[] = [];
  private response: any[] = [];
  constructor(
    private readonly botService: BotService,
    private readonly queryService: QueryService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('chat')
  async chat(@Body() chatBotDto: ChatBotDto, @Res() res) {
    let sqlResponseIa = await this.botService.useFineTunedModel(
      chatBotDto.prompt,
    );
    sqlResponseIa = this.queryService.cleanSQLQueryResponse(sqlResponseIa);
    let response: Promise<any>;
    try {
      response = await this.databaseService.executeQuery(sqlResponseIa);
    } catch (error) {
      return res.status(400).json({ message: 'Error', data: error });
    }

    // ! TODO // pasar el json de respuesta de la base de datos a gpt para que la formate

    return res.status(200).json({
      message: 'Success',
      data: {
        chatBotDto,
        sqlResponseIa,
        response,
      },
    });
  }

  @Post('chat_v2')
  async chat_v2(@Body() chatBotDto: ChatBotDto, @Res() res) {
    let sqlResponseIa = await this.botService.useGpt4Model(chatBotDto.prompt);

    sqlResponseIa = this.queryService.extractSqlQuery(sqlResponseIa);
    let response: Promise<any>;
    try {
      response = await this.databaseService.executeQuery(sqlResponseIa);
    } catch (error) {
      return res.status(400).json({ message: 'Error', data: error });
    }

    // ! TODO // pasar el json de respuesta de la base de datos a gpt para que la formate

    return res.status(200).json({
      message: 'Success',
      data: {
        chatBotDto,
        sqlResponseIa,
        response,
      },
    });
  }

  @Post('chat_v3')
  async chat_v3(@Body() chatBotDto: ChatBotDto, @Res() res) {
    const { prompt } = chatBotDto;
    const model = 'gpt-4o';
    const role = 'system';
    let systemContent = ``;

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

      sqlResponseIa = await this.botService.useGpt4ModelV2(
        prompt,
        model,
        systemContent,
        0.7,
        300,
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

      processResponse = await this.botService.useGpt4ModelV2(
        prompt,
        model,
        systemContent,
        0.8,
      );

      // console.log('1: ', promptUser);

      // console.log('2: ', extractedSql);

      // console.log('3: ', this.response);

      // console.log('4: ', processResponse.choices[0].message.content);

      return res.status(HttpStatus.OK).json({
        message: 'Success',
        responseIA: processResponse.choices[0].message.content,
        querySQL: extractedSql,
        responseSQL: this.response,
        history: this.history,
        promptUser,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error',
        error: error?.message || 'Error no especificado',
        responseIA:
          processResponse?.choices?.[0]?.message?.content ||
          'Verifique la logica de su consulta e intente nuevamente',
        querySQL: extractedSql || 'Consulta SQL no disponible',
        responseSQL: this.response || [],
        history: this.history || [],
        promptUser: promptUser || [],
      });
    }
  }
}
