import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class QueryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getTableStructure(
    tables: Record<string, string[]>,
  ): Promise<Record<string, any[]>> {
    return {
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

    return query.trim();
  }
}
