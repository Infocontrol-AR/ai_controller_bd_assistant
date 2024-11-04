import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class QueryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getTableStructure(
    tables: Record<string, string[]>,
  ): Promise<Record<string, any[]>> {
    return {
      empresas: [
        {
          column: 'id_empresas',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'nombre',
          type: 'varchar(200)',
          isForeignKey: false,
        },
        {
          column: 'razon_social_cliente',
          type: 'varchar(200)',
          isForeignKey: false,
        },
        {
          column: 'cuit_cliente',
          type: 'char(200)',
          isForeignKey: false,
        },
        {
          column: 'activa',
          type: 'tinyint(1)',
          comment: '0:no; 1:si; si esta usando el sistema',
          isForeignKey: false,
        },
        {
          column: 'nacionalidad',
          type: "enum('argentina','chilena','bolivia','brasil','colombia','ecuador','paraguay','peru','uruguay','venezuela','canada','suecia','singapur','mexico')",
          isForeignKey: false,
        },
        {
          column: 'id_grupos',
          type: 'char(36)',
          comment: 'si pertenece a algun grupo',
          isForeignKey: false,
        },
        {
          column: 'periodo_inicio_proceso',
          type: 'date',
          isForeignKey: false,
        },
        {
          column: 'codigo',
          type: 'varchar(150)',
          isForeignKey: false,
        },
        {
          column: 'fecha_hora_carga',
          type: 'timestamp',
          isForeignKey: false,
        },
        {
          column: 'eliminado',
          type: 'tinyint(1)',
          comment: '0:no;1:si',
          isForeignKey: false,
        },
        {
          column: 'zendesk_chat',
          type: 'tinyint(1)',
          isForeignKey: false,
        },
      ],
      proveedores: [
        {
          column: 'id_proveedores',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'cuit',
          type: 'char(20)',
          isForeignKey: false,
        },
        {
          column: 'id_empresas',
          type: 'char(36)',
          isForeignKey: true,
          referenced_table: 'empresas',
          referenced_column: 'id_empresas',
        },
        {
          column: 'activo_empresa',
          type: 'tinyint(1)',
          comment: '0:no; 1:si; si esta activo para la empresa',
          isForeignKey: false,
        },
        {
          column: 'nombre_razon_social',
          type: 'varchar(255)',
          isForeignKey: false,
        },
        {
          column: 'nombre_comercial',
          type: 'varchar(255)',
          isForeignKey: false,
        },
        {
          column: 'domicilio_legal',
          type: 'varchar(255)',
          isForeignKey: false,
        },
        {
          column: 'email',
          type: 'varchar(255)',
          isForeignKey: false,
        },
      ],
      empleados: [
        {
          column: 'id_empleados',
          type: 'char(36)',
          isForeignKey: false,
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
        },
        {
          column: 'nombre',
          type: 'varchar(50)',
          isForeignKey: false,
        },
        {
          column: 'dni',
          type: 'char(20)',
          isForeignKey: false,
        },
        {
          column: 'cuil',
          type: 'char(20)',
          isForeignKey: false,
        },
        {
          column: 'estado',
          type: 'bigint(1)',
          comment: 'ver tabla estados',
          isForeignKey: false,
        },
        {
          column: 'anulado',
          type: 'bigint(1)',
          comment: '0:no;1:si',
          isForeignKey: false,
        },
        {
          column: 'eliminado',
          type: 'tinyint(1)',
          comment: '0:no; 1:si; indica si fue eliminado',
          isForeignKey: false,
        },
        {
          column: 'baja_afip',
          type: 'tinyint(1)',
          comment: '0:no;1:si; indica si se dio de baja definitiva',
          isForeignKey: false,
        },
        {
          column: 'id_motivos_baja_afip',
          type: 'int(1)',
          isForeignKey: false,
        },
        {
          column: 'fecha_baja_afip',
          type: 'date',
          comment: 'para calcular las 48hs ',
          isForeignKey: false,
        },
        {
          column: 'estado_doc_baja',
          type: 'bigint(1)',
          comment:
            'campo que indica el estado de los documentos que tiene que presentar cuando está de baja',
          isForeignKey: false,
        },
        {
          column: 'sexo',
          type: 'bigint(1)',
          comment: '1:M;2:F',
          isForeignKey: false,
        },
        {
          column: 'fecha_nacimiento',
          type: 'date',
          isForeignKey: false,
        },
      ],
      documentos: [
        {
          column: 'id',
          type: 'int(1)',
          isForeignKey: false,
        },
        {
          column: 'id_documentos',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'id_usuarios_carga',
          type: 'char(36)',
          isForeignKey: true,
          referenced_table: 'usu_usuarios',
          referenced_column: 'id_usuarios',
        },
        {
          column: 'fecha_hora_creacion',
          type: 'timestamp',
          isForeignKey: false,
        },
        {
          column: 'id_documentos_tipos',
          type: 'char(36)',
          isForeignKey: true,
          referenced_table: 'documentos_tipos',
          referenced_column: 'id_documentos_tipos',
        },
        {
          column: 'id_documentos_reglas',
          type: 'int(1)',
          comment:
            'id de la regla bajo la cual actualmente se pide un documento',
          isForeignKey: true,
          referenced_table: 'documentos_reglas',
          referenced_column: 'id_documentos_reglas',
        },
        {
          column: 'tipo_entidad',
          type: "enum('empleado','vehiculo','proveedor','socio','planes_pago','ordenes_compra')",
          isForeignKey: false,
        },
        {
          column: 'modulo',
          type: "enum('datos_especificos','datos_generales','datos_impositivos','datos_laborales','socios','trabajadores','transporte_internacional','vehiculos','planes_pago','datos_hys','ordenes_compra')",
          comment: 'usado para proveedores mas que nada',
          isForeignKey: false,
        },
        {
          column: 'id_entidad',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'estado',
          type: 'bigint(1)',
          comment: 'ver tabla estados',
          isForeignKey: false,
        },
        {
          column: 'fecha_vencimiento',
          type: 'date',
          isForeignKey: false,
        },
        {
          column: 'estado_doc',
          type: 'bigint(1)',
          comment: 'guarda el estado del documento no aprobado',
          isForeignKey: false,
        },
        {
          column: 'fecha_vencimiento_doc',
          type: 'date',
          comment: 'guarda la fecha de vto del doc no aprobado',
          isForeignKey: false,
        },
        {
          column: 'nombre_archivo',
          type: 'varchar(100)',
          isForeignKey: false,
        },
        {
          column: 'fecha_inicio',
          type: 'date',
          isForeignKey: false,
        },
        {
          column: 'mes',
          type: 'int(1)',
          isForeignKey: false,
        },
        {
          column: 'anio',
          type: 'int(1)',
          isForeignKey: false,
        },
        {
          column: 'categoria',
          type: 'varchar(100)',
          isForeignKey: false,
        },
        {
          column: 'campo_extra1',
          type: 'varchar(250)',
          isForeignKey: false,
        },
        {
          column: 'campo_extra2',
          type: 'varchar(250)',
          isForeignKey: false,
        },
        {
          column: 'campo_extra3',
          type: 'varchar(250)',
          isForeignKey: false,
        },
        {
          column: 'campo_extra4',
          type: 'varchar(250)',
          isForeignKey: false,
        },
        {
          column: 'campo_extra5',
          type: 'varchar(250)',
          isForeignKey: false,
        },
        {
          column: 'estado_baja',
          type: 'tinyint(1)',
          comment: '0:no;1:si indica si se dio la baja',
          isForeignKey: false,
        },
        {
          column: 'tipo_baja',
          type: "enum('automatica','usuario_proveedor','usuario_sistema')",
          comment: 'quien da la baja',
          isForeignKey: false,
        },
        {
          column: 'motivo_baja',
          type: 'varchar(255)',
          comment: 'solo si no es automatica',
          isForeignKey: false,
        },
        {
          column: 'id_usuarios_revisa1',
          type: 'char(36)',
          isForeignKey: true,
          referenced_table: 'usu_usuarios',
          referenced_column: 'id_usuarios',
        },
        {
          column: 'fecha_revision1',
          type: 'datetime',
          isForeignKey: false,
        },
        {
          column: 'resultado_revision1',
          type: 'bigint(1)',
          comment: '1,2,3:rechazado; 4:aprobado',
          isForeignKey: false,
        },
        {
          column: 'id_usuarios_revisa2',
          type: 'char(36)',
          isForeignKey: true,
          referenced_table: 'usu_usuarios',
          referenced_column: 'id_usuarios',
        },
        {
          column: 'fecha_revision2',
          type: 'datetime',
          isForeignKey: false,
        },
        {
          column: 'resultado_revision2',
          type: 'bigint(1)',
          comment: '1,2,3:rechazado; 4:aprobado',
          isForeignKey: false,
        },
        {
          column: 'observacion_revision',
          type: 'varchar(500)',
          isForeignKey: false,
        },
        {
          column: 'observacion_interna',
          type: 'varchar(500)',
          isForeignKey: false,
        },
        {
          column: 'fecha_hora_modifica',
          type: 'datetime',
          comment: 'se actualiza por trigger',
          isForeignKey: false,
        },
        {
          column: 'tarea_proveedor',
          type: 'varchar(255)',
          isForeignKey: false,
        },
        {
          column: 'riesgos_proveedor',
          type: 'varchar(255)',
          comment: 'todos los ids de los riesgos del proveedor',
          isForeignKey: false,
        },
        {
          column: 'rs_asistencia',
          type: 'tinyint(1)',
          comment: 'para recibo de sueldo profundo',
          isForeignKey: false,
        },
        {
          column: 'rs_dias_falto',
          type: 'bigint(20)',
          comment: 'para recibo de sueldo profundo',
          isForeignKey: false,
        },
        {
          column: 'rs_horas_trabajadas',
          type: 'int(1)',
          comment: 'para recibo de sueldo profundo',
          isForeignKey: false,
        },
        {
          column: 'rs_sueldo_neto',
          type: 'double',
          comment: 'para recibo de sueldo profundo',
          isForeignKey: false,
        },
        {
          column: 'rs_incluye_vacaciones',
          type: 'tinyint(1)',
          comment: 'para recibo de sueldo profundo',
          isForeignKey: false,
        },
        {
          column: 'rs_control_descarga_dias',
          type: 'int(1)',
          comment: 'para recibo de sueldo profundo',
          isForeignKey: false,
        },
        {
          column: 'rs_km_recorridos',
          type: 'int(1)',
          comment: 'para recibo de sueldo profundo',
          isForeignKey: false,
        },
        {
          column: 'rs_km_50_recorridos',
          type: 'int(1)',
          comment: 'para recibo de sueldo profundo al 50%',
          isForeignKey: false,
        },
        {
          column: 'rs_km_100_recorridos',
          type: 'int(1)',
          comment: 'para recibo de sueldo profundo al 100%',
          isForeignKey: false,
        },
        {
          column: 'rs_horas_nocturnas',
          type: 'int(1)',
          comment: 'para recibo profundo, usado en convenio seguridad',
          isForeignKey: false,
        },
        {
          column: 'rs_50_horas',
          type: 'int(1)',
          comment: 'para recibo profundo, usado en uocra al 50%',
          isForeignKey: false,
        },
        {
          column: 'rs_100_horas',
          type: 'int(1)',
          comment: 'para recibo profundo, usado en uocra al 100%',
          isForeignKey: false,
        },
        {
          column: 'id_aptos_medicos_tipos',
          type: 'int(11)',
          isForeignKey: true,
          referenced_table: 'aptos_medicos_tipos',
          referenced_column: 'id_aptos_medicos_tipos',
        },
        {
          column: 'id_obras',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'obs_controlador',
          type: 'text',
          comment:
            'si un doc pendiente no se debe controlar, en este campo se guarda la observación',
          isForeignKey: false,
        },
        {
          column: 'obs_controlador_fecha_hora',
          type: 'datetime',
          isForeignKey: false,
        },
        {
          column: 'obs_controlador_id_usuarios',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'obs_contratista',
          type: 'text',
          comment:
            'campo para guardar las aclaraciones que quiera hacer la persona que carga un documento',
          isForeignKey: false,
        },
        {
          column: 'rechazo_detalle_menor',
          type: 'int(1)',
          comment:
            '1: el doc ha sido rechazado por un detalle menor, 0: rechazo por detalle no menor',
          isForeignKey: false,
        },
        {
          column: 'se_pide',
          type: 'int(1)',
          comment:
            'indica si el documento actualmente se le pide. 1:si; 0: no ',
          isForeignKey: false,
        },
        {
          column: 'se_pide_obligatorio',
          type: 'int(1)',
          comment:
            'indica si el documento actualmente se le pide y es obligatorio. 1:si; 0: no',
          isForeignKey: false,
        },
        {
          column: 'id_empresas',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'control_automatico_estado',
          type: 'int(1)',
          comment:
            '0:no;1:procesando;2:rechazado;4:pre-aprobado;5:aprobado por api;6:rechazado por api',
          isForeignKey: false,
        },
        {
          column: 'fecha_cambio_estado',
          type: 'date',
          comment: 'guardo la fecha de cuando cambia el estado de el documento',
          isForeignKey: false,
        },
        {
          column: 'estado_proceso_aprob',
          type: 'tinyint(1) unsigned',
          comment:
            '0:no;1:procesando;2:rechazado;4:pre-aprobado;5:aprobado por api;6:rechazado por api',
          isForeignKey: false,
        },
        {
          column: 'notificacion_enviada',
          type: 'int(1)',
          comment:
            'Para Hemco Nicaragua - campo guarda estado de envio de notificacion para record de policia',
          isForeignKey: false,
        },
        {
          column: 'fecha_rechazo',
          type: 'datetime',
          isForeignKey: false,
        },
        {
          column: 'id_transaccion',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'can_controller_audit',
          type: 'tinyint(1)',
          isForeignKey: false,
        },
        {
          column: 'status_api_iacontroller',
          type: 'tinyint(4)',
          comment: '1: Pendiente, 2: Levantado, 3: Rechazado, 4: Aprobado',
          isForeignKey: false,
        },
        {
          column: 'status_api',
          type: 'tinyint(4)',
          comment: '1: Pendiente, 2: Levantado, 3: Rechazado, 4: Aprobado',
          isForeignKey: false,
        },
      ],
      documentos_tipos: [
        {
          column: 'id_documentos_tipos',
          type: 'char(36)',
          isForeignKey: false,
        },
        {
          column: 'nombre',
          type: 'varchar(200)',
          isForeignKey: false,
        },
        {
          column: 'tipo',
          type: "enum('general','laboral')",
          comment: 'indica que tipo de documento es',
          isForeignKey: false,
        },
        {
          column: 'tipos_entidad_mostrar',
          type: 'varchar(100)',
          comment: 'empleado,vehiculo,proveedor,socio,planes_pago',
          isForeignKey: false,
        },
        {
          column: 'fecha_vencimiento',
          type: 'tinyint(1)',
          comment: '0:no;1:si',
          isForeignKey: false,
        },
        {
          column: 'nombre_archivo',
          type: 'tinyint(1)',
          comment: '0:no;1:si',
          isForeignKey: false,
        },
        {
          column: 'fecha_inicio',
          type: 'tinyint(1)',
          comment: '0:no;1:si',
          isForeignKey: false,
        },
        {
          column: 'mes',
          type: 'tinyint(1)',
          comment: '0:no;1:si',
          isForeignKey: false,
        },
        {
          column: 'anio',
          type: 'tinyint(1)',
          comment: '0:no;1:si',
          isForeignKey: false,
        },
      ],
    };

    const tableStructures: Record<string, any[]> = {};

    for (const [table, columnsToShow] of Object.entries(tables)) {
      const columnQuery = `
        SELECT 
          COLUMN_NAME,
          COLUMN_TYPE,
          COLUMN_COMMENT,
          COLUMN_KEY  
        FROM 
          INFORMATION_SCHEMA.COLUMNS 
        WHERE 
          TABLE_NAME = '${table}' 
          AND TABLE_SCHEMA = 'bd_infocontrol_desarrollo';`;

      const foreignKeyQuery = `
        SELECT 
          kcu.COLUMN_NAME,
          kcu.REFERENCED_TABLE_NAME,
          kcu.REFERENCED_COLUMN_NAME
        FROM 
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        JOIN 
          INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
        WHERE 
          tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
          AND kcu.TABLE_NAME = '${table}' 
          AND kcu.TABLE_SCHEMA = 'bd_infocontrol_desarrollo';`;

      const [columnsInfo, foreignKeys] = await Promise.all([
        this.databaseService.executeQuery(columnQuery),
        this.databaseService.executeQuery(foreignKeyQuery),
      ]);

      tableStructures[table] = this.parseAndSanitizeColumnInfo(
        columnsInfo,
        foreignKeys,
        columnsToShow,
      );
    }

    return tableStructures;
  }

  private parseAndSanitizeColumnInfo(
    columnsInfo: any[],
    foreignKeys: any[],
    columnsToShow: string[],
  ): any[] {
    const foreignKeyMap = new Map(
      foreignKeys.map(
        ({ COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME }) => [
          COLUMN_NAME,
          {
            referenced_table: REFERENCED_TABLE_NAME,
            referenced_column: REFERENCED_COLUMN_NAME,
          },
        ],
      ),
    );

    return columnsInfo
      .filter(({ COLUMN_NAME }) => columnsToShow.includes(COLUMN_NAME))
      .map(({ COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT, COLUMN_KEY }) => {
        const columnData: Record<string, any> = {
          column: COLUMN_NAME,
          type: COLUMN_TYPE,
          comment: COLUMN_COMMENT,
          isForeignKey: foreignKeyMap.has(COLUMN_NAME),
          referenced_table: foreignKeyMap.get(COLUMN_NAME)?.referenced_table,
          referenced_column: foreignKeyMap.get(COLUMN_NAME)?.referenced_column,
        };

        Object.keys(columnData).forEach((key) => {
          if (
            columnData[key] === null ||
            (key === 'comment' && columnData[key] === '')
          ) {
            delete columnData[key];
          }
        });

        return columnData;
      });
  }

  public async extractAndSanitizeQuery(data: any): Promise<string> {
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Content not found in the input data');
    }

    return this.sanitizeQuery(content);
  }

  private sanitizeQuery(query: string): string {
    query = query.replace(/```(sql)?\n?/g, '').replace(/```/g, '');

    query = query.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    const allowedCharsRegex = /[^a-zA-Z0-9\s.,*()_=%'`"<>+-]/g;

    return query.replace(allowedCharsRegex, '').trim();
  }
}
