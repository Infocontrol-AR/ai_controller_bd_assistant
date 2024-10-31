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
        'campo_extra1',
        'campo_extra2',
        'campo_extra3',
        'campo_extra4',
        'campo_extra5',
        'estado_baja',
        'tipo_baja',
        'motivo_baja',
        'id_usuarios_revisa1',
        'fecha_revision1',
        'resultado_revision1',
        'id_usuarios_revisa2',
        'fecha_revision2',
        'resultado_revision2',
        'observacion_revision',
        'observacion_interna',
        'fecha_hora_modifica',
        'tarea_proveedor',
        'riesgos_proveedor',
        'rs_asistencia',
        'rs_dias_falto',
        'rs_horas_trabajadas',
        'rs_sueldo_neto',
        'rs_incluye_vacaciones',
        'rs_control_descarga_dias',
        'rs_km_recorridos',
        'rs_km_50_recorridos',
        'rs_km_100_recorridos',
        'rs_horas_nocturnas',
        'rs_50_horas',
        'rs_100_horas',
        'id_aptos_medicos_tipos',
        'id_obras',
        'obs_controlador',
        'obs_controlador_fecha_hora',
        'obs_controlador_id_usuarios',
        'obs_contratista',
        'rechazo_detalle_menor',
        'se_pide',
        'se_pide_obligatorio',
        'id_empresas',
        'control_automatico_estado',
        'fecha_cambio_estado',
        'estado_proceso_aprob',
        'notificacion_enviada',
        'fecha_rechazo',
        'id_transaccion',
        'can_controller_audit',
        'status_api_iacontroller',
        'status_api',
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
    };

    let sqlResponseIa;

    let extractedSql;

    let response;

    let processResponse;

    try {
      const getTableStructure =
        await this.queryService.getTableStructure(tables);

      systemContent = `### CONTEXTO:

        **Estructura de la Tabla (Formato JSON)**  
        A continuación, recibiré un JSON que describe la estructura de una tabla MySQL, en la que cada objeto representa una columna y contiene los siguientes atributos:
        
        ${JSON.stringify(getTableStructure)}
        
        **Atributos de las Columnas**
        - 'column': Nombre de la columna.
        - 'type': Tipo de dato.
        - 'default': Valor por defecto.
        - 'comment': Descripción de la columna.
        - 'notNull': Restricción de no permitir valores nulos.
        - 'autoIncrement': Indica si la columna se incrementará automáticamente.
        - 'characterSet': Conjunto de caracteres utilizado.
        - 'collation': Reglas de ordenación.
        - 'isForeignKey': Indicador de clave foránea.
        - 'referenced_table': Tabla referenciada.
        - 'referenced_column': Columna referenciada.
        - 'isPrimaryKey': Indicador de clave primaria.
        
        ### INSTRUCCIONES
        
        Con base en este JSON, generaré una **consulta SQL SELECT** que cumplirá con las siguientes especificaciones:
        
        - **Sintaxis SQL**: Me aseguraré de que la consulta sea compatible con MySQL.
        - **Estructura Lógica**: La consulta reflejará la estructura de la tabla, respetando tipos de datos y restricciones.
        - **Límite de Resultados**: Si no se especifica un límite, la consulta devolverá solo 10 filas.
        - **Límite en Subconsultas**: Limitaré el resultado a una fila en subconsultas para evitar errores.
        - **Requisitos de JOIN**: Para múltiples tablas, incluiré al menos 5 columnas relacionadas y utilizaré alias para mejorar la legibilidad.
        - **Filtrado**: Agregaré cláusulas WHERE relevantes para refinar los resultados según la solicitud.
        - **Ordenamiento**: Usaré ORDER BY cuando sea adecuado, priorizando columnas lógicas para el orden.
        - **Agregación**: Si se utilizan funciones como COUNT o SUM, incluiré un GROUP BY si es necesario.
        - **Selección de Columnas**: Seleccionaré al menos cinco columnas relevantes; en caso de JOIN, incluiré las más lógicas.
        - **Coincidencia de Texto**: Utilizaré 'LIKE' con comodines '%' para coincidencias aproximadas en nombres y palabras clave.
        
        ### GENERACIÓN DE CONSULTA
        
        **Salida**: Solo entregaré la consulta SQL sin explicaciones adicionales ni comentarios. **Solo se permitirán consultas tipo SELECT**. Si la solicitud no es coherente, responderé con **0**.
        
        Asegúrate de que tu solicitud sea clara para una generación precisa de la consulta SQL.
        `;

      // console.log(systemContent);

      sqlResponseIa = await this.botService.useGpt4ModelV2(
        prompt,
        model,
        systemContent,
        0.12,
        500
      );

      //console.log(sqlResponseIa);

      // return res.status(HttpStatus.OK).json(sqlResponseIa);

      extractedSql =
        await this.queryService.extractAndSanitizeQuery(sqlResponseIa);
      if (!extractedSql || extractedSql == '0')
        throw new Error(
          'Verifique la logica de su consulta e intente nuevamente',
        );

      response = await this.databaseService.executeQuery(extractedSql);

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
      ${JSON.stringify(response)}
      
      Recuerda que tu respuesta debe ser amigable y clara, sin mencionar en ningún momento la existencia de un JSON o contexto.
      `;

      // console.log('0: ', systemContent);

      processResponse = await this.botService.useGpt4ModelV2(
        prompt,
        model,
        systemContent,
        0.8,
      );

      console.log('1: ', prompt);

      console.log('2: ', extractedSql);

      console.log('3: ', response);

      console.log('4: ', processResponse.choices[0].message.content);

      return res.status(HttpStatus.OK).json({
        message: 'Success',
        responseIA: processResponse.choices[0].message.content,
        querySQL: extractedSql,
        responseSQL: response,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error',
        error: error?.message || 'Error no especificado',
        responseIA:
          processResponse?.choices?.[0]?.message?.content ||
          'Verifique la logica de su consulta e intente nuevamente',
        querySQL: extractedSql || 'Consulta SQL no disponible',
        responseSQL: response || [],
      });
    }
  }
}
