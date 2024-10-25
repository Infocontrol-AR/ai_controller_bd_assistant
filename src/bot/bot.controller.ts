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
import { BotService } from './bot.service';
import { QueryService } from './query.service';
import { ChatBotDto } from './dto/chat-bot.dot';
import { DatabaseService } from 'src/database.service';

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

    try {
      const getTableStructure =
        await this.queryService.getTableStructure(tables);

      systemContent = `
        ### CONTEXTO:
        **Estructura del JSON**
        El contexto que se proporcionará está en formato JSON y representa la estructura de una tabla de MySQL. Cada objeto dentro de la lista representa una columna de la tabla con sus atributos. Aquí está la explicación de la estructura:
        
        **JSON**
        ${JSON.stringify(getTableStructure)}
        
        **Descripción de los campos:**
        - 'column': Nombre de la columna en la tabla.
        - 'type': Tipo de datos que se almacenan en la columna.
        - 'default': Valor por defecto que tendrá la columna si no se especifica otro.
        - 'comment': Comentarios adicionales sobre el uso de la columna.
        - 'notNull': Indica si la columna puede contener valores nulos.
        - 'autoIncrement': Indica si el valor de esta columna se incrementa automáticamente.
        - 'characterSet': Conjunto de caracteres utilizado para la columna.
        - 'collation': Regla de comparación utilizada para la columna.
        - 'isForeignKey': Indica si la columna es una clave foránea.
        - 'referenced_table': Nombre de la tabla referenciada (si aplica).
        - 'referenced_column': Nombre de la columna referenciada (si aplica).
        - 'isPrimaryKey': Indica si la columna es una clave primaria.
        
        ### INSTRUCCIONES

        Con base en la estructura proporcionada en formato JSON, cuando me proporciones una solicitud específica, generaré **una consulta SQL tipo SELECT** correspondiente. La consulta será:

        - **Sintácticamente correcta**: Se validará la estructura SQL para asegurar que cumpla con la sintaxis de MySQL.
        - **Lógica**: Se basará únicamente en el contexto de la estructura de las tablas proporcionadas, respetando tipos de datos y restricciones.

        ### Generación de la consulta

        **Retornaré solo la consulta SQL** sin ninguna otra información adicional, comentarios, o explicaciones. Si tu solicitud está fuera del contexto proporcionado o no tiene sentido, responderé exclusivamente con el número **0**. 

        Asegúrate de que tu solicitud esté claramente formulada para que pueda interpretarla correctamente. Por favor, proporciona tu solicitud para generar la consulta SQL.
        `;
      // console.log(systemContent);

      let sqlResponseIa = await this.botService.useGpt4ModelV2(
        prompt,
        model,
        systemContent,
      );

      console.log(sqlResponseIa);

      // return res.status(HttpStatus.OK).json(sqlResponseIa);

      const extractedSql =
        await this.queryService.extractAndSanitizeQuery(sqlResponseIa);
      if (!extractedSql || extractedSql == '0') throw new Error('No se pudo obtener la query SQL. Verifique la logica de su consulta e intente nuevamente');

      console.log(extractedSql);

      const response = await this.databaseService.executeQuery(extractedSql);

      console.log(response);

      return res.status(HttpStatus.OK).json({
        message: 'Success',
        data: { prompt, sqlResponseIa: extractedSql, response },
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error',
        error: error.message,
      });
    }
  }
}
