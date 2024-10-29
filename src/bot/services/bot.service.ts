import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class BotService {
  public model = 'ft:gpt-4o-mini-2024-07-18:personal::ALBi0URn';
  private client = new OpenAI({
    // apiKey:
    //   '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',
    apiKey:
      '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',
  });

  async useFineTunedModel(prompt: string) {
    const query = prompt;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'user',
          content: `Please provide only SQL code for the following query: ${query}`,
          name: 'prompt',
        },
      ],
      temperature: 0.1,
    });

    console.log(response.choices);

    return response.choices[0].message.content;
  }

  async useGpt4Model(prompt: string) {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: "dadas las sigientes tablas de la base de datos realiza consultas y retoran solo el sql \"CREATE TABLE `empresas` (\n  `id_empresas` char(36) NOT NULL,\n  `nombre` varchar(200) NOT NULL,\n  `razon_social_cliente` varchar(200) DEFAULT NULL,\n  `cuit_cliente` char(200) DEFAULT NULL,\n  `activa` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0:no; 1:si; si esta usando el sistema',\n  `nacionalidad` enum('argentina','chilena','bolivia','brasil','colombia','ecuador','paraguay','peru','uruguay','venezuela','canada','suecia','singapur','mexico') DEFAULT NULL,\n  `id_grupos` char(36) DEFAULT NULL COMMENT 'si pertenece a algun grupo',\n  `periodo_inicio_proceso` date DEFAULT NULL,\n  `codigo` varchar(150) DEFAULT NULL,\n  `fecha_hora_carga` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  `eliminado` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:no;1:si',\n  `zendesk_chat` tinyint(1) DEFAULT '0',\n  PRIMARY KEY (`id_empresas`),\n  KEY `idx_empresas_id_empresas` (`id_empresas`),\n  KEY `idx_empresas_id_grupos` (`id_grupos`),\n  KEY `idx_empresas_cuit_cliente` (`cuit_cliente`),\n  KEY `idx_empresas_eliminado` (`eliminado`),\n) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='guardo las empresas (clientes) que utilizan el sistema'\n\nCREATE TABLE `proveedores` (\n  `id_proveedores` char(36) NOT NULL,\n  `cuit` char(20) NOT NULL,\n  `id_empresas` char(36) NOT NULL,\n  `activo_empresa` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0:no; 1:si; si esta activo para la empresa',\n  `nombre_razon_social` varchar(255) NOT NULL,\n  `nombre_comercial` varchar(255) NOT NULL,\n  `domicilio_legal` varchar(255) NOT NULL,\n  `email` varchar(255) NOT NULL,\n  PRIMARY KEY (`id_proveedores`),\n  KEY `id_empresas` (`id_empresas`),\n  KEY `cuit` (`cuit`),\n  KEY `proveedores_aribaProveedoresId_fk` (`aribaProveedoresId`),\n  KEY `idxProvDat` (`id_proveedores_datos`),\n  KEY `idxGrupoEmp` (`id_grupo_en_empresa`),\n  CONSTRAINT `proveedores_aribaProveedoresId_fk` FOREIGN KEY (`aribaProveedoresId`) REFERENCES `integracion_ariba_proveedores` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,\n  CONSTRAINT `proveedores_ibfk_1` FOREIGN KEY (`id_empresas`) REFERENCES `empresas` (`id_empresas`) ON UPDATE CASCADE,\n) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='guarda los datos de los proveedores'\n\nCREATE TABLE `empleados` (\n  `id_empleados` char(36) NOT NULL,\n  `id_proveedores` char(36) NOT NULL,\n  `apellido` varchar(50) NOT NULL,\n  `nombre` varchar(50) NOT NULL,\n  `dni` char(20) NOT NULL,\n  `cuil` char(20) NOT NULL,\n  `estado` bigint(1) NOT NULL DEFAULT '1' COMMENT 'ver tabla estados',\n  `anulado` bigint(1) NOT NULL COMMENT '0:no;1:si',\n  `eliminado` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:no; 1:si; indica si fue eliminado',\n  `baja_afip` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:no;1:si; indica si se dio de baja definitiva',\n  `id_motivos_baja_afip` int(1) DEFAULT NULL,\n  `fecha_baja_afip` date DEFAULT NULL COMMENT 'para calcular las 48hs ',\n  `estado_doc_baja` bigint(1) NOT NULL DEFAULT '1' COMMENT 'campo que indica el estado de los documentos que tiene que presentar cuando está de baja',\n  `sexo` bigint(1) DEFAULT NULL COMMENT '1:M;2:F',\n  `fecha_nacimiento` date DEFAULT NULL,\n  PRIMARY KEY (`id_empleados`),\n  KEY `id_proveedores` (`id_proveedores`),\n  KEY `id_usuarios_carga` (`id_usuarios_carga`),\n  KEY `cuil` (`cuil`),\n  KEY `idx_baja` (`baja_afip`),\n  KEY `idxid_estado1` (`estado`),\n  CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`id_proveedores`) REFERENCES `proveedores` (`id_proveedores`) ON UPDATE CASCADE,\n  CONSTRAINT `empleados_ibfk_2` FOREIGN KEY (`id_usuarios_carga`) REFERENCES `usu_usuarios` (`id_usuarios`) ON UPDATE CASCADE,\n) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='guarda los datos de los empleados por proveedor'\n\nCREATE TABLE `documentos` (\n  `id` int(1) NOT NULL AUTO_INCREMENT,\n  `id_documentos` char(36) NOT NULL,\n  `id_usuarios_carga` char(36) NOT NULL,\n  `fecha_hora_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  `id_documentos_tipos` char(36) NOT NULL,\n  `id_documentos_reglas` int(1) DEFAULT NULL COMMENT 'id de la regla bajo la cual actualmente se pide un documento',\n  `tipo_entidad` enum('empleado','vehiculo','proveedor','socio','planes_pago','ordenes_compra') NOT NULL,\n  `modulo` enum('datos_especificos','datos_generales','datos_impositivos','datos_laborales','socios','trabajadores','transporte_internacional','vehiculos','planes_pago','datos_hys','ordenes_compra') DEFAULT NULL COMMENT 'usado para proveedores mas que nada',\n  `id_entidad` char(36) NOT NULL,\n  `estado` bigint(1) NOT NULL DEFAULT '1' COMMENT 'ver tabla estados',\n  `fecha_vencimiento` date DEFAULT NULL,\n  `estado_doc` bigint(1) NOT NULL DEFAULT '1' COMMENT 'guarda el estado del documento no aprobado',\n  `fecha_vencimiento_doc` date DEFAULT NULL COMMENT 'guarda la fecha de vto del doc no aprobado',\n  `nombre_archivo` varchar(100) DEFAULT NULL,\n  `fecha_inicio` date DEFAULT NULL,\n  `mes` int(1) DEFAULT NULL,\n  `anio` int(1) DEFAULT NULL,\n  `categoria` varchar(100) DEFAULT NULL,\n  `campo_extra1` varchar(250) DEFAULT NULL,\n  `campo_extra2` varchar(250) DEFAULT NULL,\n  `campo_extra3` varchar(250) DEFAULT NULL,\n  `campo_extra4` varchar(250) DEFAULT NULL,\n  `campo_extra5` varchar(250) DEFAULT NULL,\n  `estado_baja` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:no;1:si indica si se dio la baja',\n  `tipo_baja` enum('automatica','usuario_proveedor','usuario_sistema') DEFAULT NULL COMMENT 'quien da la baja',\n  `motivo_baja` varchar(255) DEFAULT NULL COMMENT 'solo si no es automatica',\n  `id_usuarios_revisa1` char(36) DEFAULT NULL,\n  `fecha_revision1` datetime DEFAULT NULL,\n  `resultado_revision1` bigint(1) NOT NULL DEFAULT '1' COMMENT '1,2,3:rechazado; 4:aprobado',\n  `id_usuarios_revisa2` char(36) DEFAULT NULL,\n  `fecha_revision2` datetime DEFAULT NULL,\n  `resultado_revision2` bigint(1) NOT NULL DEFAULT '1' COMMENT '1,2,3:rechazado; 4:aprobado',\n  `observacion_revision` varchar(500) DEFAULT NULL,\n  `observacion_interna` varchar(500) DEFAULT NULL,\n  `fecha_hora_modifica` datetime NOT NULL COMMENT 'se actualiza por trigger',\n  `tarea_proveedor` varchar(255) DEFAULT NULL,\n  `riesgos_proveedor` varchar(255) DEFAULT NULL COMMENT 'todos los ids de los riesgos del proveedor',\n  `rs_asistencia` tinyint(1) DEFAULT NULL COMMENT 'para recibo de sueldo profundo',\n  `rs_dias_falto` bigint(20) DEFAULT NULL COMMENT 'para recibo de sueldo profundo',\n  `rs_horas_trabajadas` int(1) DEFAULT NULL COMMENT 'para recibo de sueldo profundo',\n  `rs_sueldo_neto` double DEFAULT NULL COMMENT 'para recibo de sueldo profundo',\n  `rs_incluye_vacaciones` tinyint(1) DEFAULT NULL COMMENT 'para recibo de sueldo profundo',\n  `rs_control_descarga_dias` int(1) DEFAULT NULL COMMENT 'para recibo de sueldo profundo',\n  `rs_km_recorridos` int(1) DEFAULT NULL COMMENT 'para recibo de sueldo profundo',\n  `rs_km_50_recorridos` int(1) DEFAULT NULL COMMENT 'para recibo de sueldo profundo al 50%',\n  `rs_km_100_recorridos` int(1) DEFAULT NULL COMMENT 'para recibo de sueldo profundo al 100%',\n  `rs_horas_nocturnas` int(1) DEFAULT NULL COMMENT 'para recibo profundo, usado en convenio seguridad',\n  `rs_50_horas` int(1) DEFAULT NULL COMMENT 'para recibo profundo, usado en uocra al 50%',\n  `rs_100_horas` int(1) DEFAULT NULL COMMENT 'para recibo profundo, usado en uocra al 100%',\n  `id_aptos_medicos_tipos` int(11) DEFAULT NULL,\n  `id_obras` char(36) DEFAULT NULL,\n  `obs_controlador` text COMMENT 'si un doc pendiente no se debe controlar, en este campo se guarda la observación',\n  `obs_controlador_fecha_hora` datetime DEFAULT NULL,\n  `obs_controlador_id_usuarios` char(36) DEFAULT NULL,\n  `obs_contratista` text COMMENT 'campo para guardar las aclaraciones que quiera hacer la persona que carga un documento',\n  `rechazo_detalle_menor` int(1) DEFAULT NULL COMMENT '1: el doc ha sido rechazado por un detalle menor, 0: rechazo por detalle no menor',\n  `se_pide` int(1) NOT NULL DEFAULT '0' COMMENT 'indica si el documento actualmente se le pide. 1:si; 0: no ',\n  `se_pide_obligatorio` int(1) NOT NULL DEFAULT '0' COMMENT 'indica si el documento actualmente se le pide y es obligatorio. 1:si; 0: no',\n  `id_empresas` char(36) NOT NULL,\n  `control_automatico_estado` int(1) NOT NULL DEFAULT '0' COMMENT '0:no;1:procesando;2:rechazado;4:pre-aprobado;5:aprobado por api;6:rechazado por api',\n  `fecha_cambio_estado` date DEFAULT NULL COMMENT 'guardo la fecha de cuando cambia el estado de el documento',\n  `estado_proceso_aprob` tinyint(1) unsigned DEFAULT NULL COMMENT '0:no;1:procesando;2:rechazado;4:pre-aprobado;5:aprobado por api;6:rechazado por api',\n  `notificacion_enviada` int(1) DEFAULT '0' COMMENT 'Para Hemco Nicaragua - campo guarda estado de envio de notificacion para record de policia',\n  `fecha_rechazo` datetime DEFAULT NULL,\n  `id_transaccion` char(36) DEFAULT NULL,\n  `can_controller_audit` tinyint(1) DEFAULT '1',\n  `status_api_iacontroller` tinyint(4) DEFAULT NULL COMMENT '1: Pendiente, 2: Levantado, 3: Rechazado, 4: Aprobado',\n  `status_api` tinyint(4) DEFAULT NULL COMMENT '1: Pendiente, 2: Levantado, 3: Rechazado, 4: Aprobado',\n  PRIMARY KEY (`id`),\n  KEY `id_usuarios_carga` (`id_usuarios_carga`),\n  KEY `id_usuarios_revisa1` (`id_usuarios_revisa1`),\n  KEY `id_usuarios_revisa2` (`id_usuarios_revisa2`),\n  KEY `id_documentos_tipos` (`id_documentos_tipos`),\n  KEY `id_entidad` (`id_entidad`),\n  KEY `estado_baja` (`id_documentos`),\n  KEY `documentos_ibfk_5` (`id_aptos_medicos_tipos`),\n  KEY `idxmodulo_ide` (`modulo`,`id_entidad`),\n  KEY `idx_idempresas` (`id_empresas`),\n  KEY `documentos_ibfk_x` (`id_documentos_reglas`),\n  KEY `idxEstado` (`estado_doc`),\n  KEY `idxid_sepide` (`se_pide`),\n  KEY `idxPeriodo` (`mes`,`anio`),\n  KEY `idx_status_api_iacontroller` (`status_api_iacontroller`),\n  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`id_usuarios_carga`) REFERENCES `usu_usuarios` (`id_usuarios`) ON UPDATE CASCADE,\n  CONSTRAINT `documentos_ibfk_2` FOREIGN KEY (`id_usuarios_revisa1`) REFERENCES `usu_usuarios` (`id_usuarios`) ON DELETE SET NULL ON UPDATE CASCADE,\n  CONSTRAINT `documentos_ibfk_3` FOREIGN KEY (`id_usuarios_revisa2`) REFERENCES `usu_usuarios` (`id_usuarios`) ON DELETE SET NULL ON UPDATE CASCADE,\n  CONSTRAINT `documentos_ibfk_4` FOREIGN KEY (`id_documentos_tipos`) REFERENCES `documentos_tipos` (`id_documentos_tipos`) ON UPDATE CASCADE,\n  CONSTRAINT `documentos_ibfk_5` FOREIGN KEY (`id_aptos_medicos_tipos`) REFERENCES `aptos_medicos_tipos` (`id_aptos_medicos_tipos`) ON DELETE SET NULL ON UPDATE CASCADE,\n  CONSTRAINT `documentos_ibfk_x` FOREIGN KEY (`id_documentos_reglas`) REFERENCES `documentos_reglas` (`id_documentos_reglas`) ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE=InnoDB AUTO_INCREMENT=4159178 DEFAULT CHARSET=utf8 COMMENT='guarda los datos generales por documento'\n\nCREATE TABLE `documentos` (\n  `id` int(1) NOT NULL AUTO_INCREMENT,\n  `id_documentos` char(36) NOT NULL,\n  `id_usuarios_carga` char(36) NOT NULL,\n  `fecha_hora_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  `id_documentos_tipos` char(36) NOT NULL,\n  `id_documentos_reglas` int(1) DEFAULT NULL COMMENT 'id de la regla bajo la cual actualmente se pide un documento',\n  `tipo_entidad` enum('empleado','vehiculo','proveedor','socio','planes_pago','ordenes_compra') NOT NULL,\n  `modulo` enum('datos_especificos','datos_generales','datos_impositivos','datos_laborales','socios','trabajadores','transporte_internacional','vehiculos','planes_pago','datos_hys','ordenes_compra') DEFAULT NULL COMMENT 'usado para proveedores mas que nada',\n  `id_entidad` char(36) NOT NULL,\n  `estado` bigint(1) NOT NULL DEFAULT '1' COMMENT 'ver tabla estados',\n  `fecha_vencimiento` date DEFAULT NULL,\n  `estado_doc` bigint(1) NOT NULL DEFAULT '1' COMMENT 'guarda el estado del documento no aprobado',\n  `fecha_vencimiento_doc` date DEFAULT NULL COMMENT 'guarda la fecha de vto del doc no aprobado',\n  `nombre_archivo` varchar(100) DEFAULT NULL,\n  `fecha_inicio` date DEFAULT NULL,\n  `mes` int(1) DEFAULT NULL,\n  `anio` int(1) DEFAULT NULL,\n  `categoria` varchar(100) DEFAULT NULL,\n  PRIMARY KEY (`id`),\n  KEY `id_usuarios_carga` (`id_usuarios_carga`),\n  KEY `id_entidad` (`id_entidad`),\n  KEY `estado_baja` (`id_documentos`),\n  KEY `idxmodulo_ide` (`modulo`,`id_entidad`),\n  KEY `idx_idempresas` (`id_empresas`),\n  KEY `idxEstado` (`estado_doc`),\n  KEY `idxid_sepide` (`se_pide`),\n  KEY `idxPeriodo` (`mes`,`anio`),\n  KEY `idx_status_api_iacontroller` (`status_api_iacontroller`),\n  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`id_usuarios_carga`) REFERENCES `usu_usuarios` (`id_usuarios`) ON UPDATE CASCADE,\n) ENGINE=InnoDB AUTO_INCREMENT=4159178 DEFAULT CHARSET=utf8 COMMENT='guarda los datos generales por documento'\n\nCREATE TABLE `documentos_tipos` (\n  `id_documentos_tipos` char(36) NOT NULL,\n  `nombre` varchar(200) NOT NULL,\n  `tipo` enum('general','laboral') DEFAULT NULL COMMENT 'indica que tipo de documento es',\n  `tipos_entidad_mostrar` varchar(100) NOT NULL COMMENT 'empleado,vehiculo,proveedor,socio,planes_pago',\n  `fecha_vencimiento` tinyint(1) NOT NULL COMMENT '0:no;1:si',\n  `nombre_archivo` tinyint(1) NOT NULL COMMENT '0:no;1:si',\n  `fecha_inicio` tinyint(1) NOT NULL COMMENT '0:no;1:si',\n  `mes` tinyint(1) NOT NULL COMMENT '0:no;1:si',\n  `anio` tinyint(1) NOT NULL COMMENT '0:no;1:si',\n  PRIMARY KEY (`id_documentos_tipos`),\n  KEY `tipo_entidad` (`tipos_entidad_mostrar`),\n  KEY `custom_model_id_idx` (`custom_model_id`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='guardo los tipos de documentos que existen'\n\n1 es Incompleto\n2 es Rechazado\n3 es Pendiente de Control\n4 es Aprobado\n5 es Pendiente de Aprobación Externa\"",
            },
          ],
        },
        {
          role: 'user',
          content:
            prompt +
            'el documento tipo usando un like, evitando ambiguedad de campos',
        },
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: 'text',
      },
    });

    return response.choices[0].message.content;
  }

  async useGpt4ModelV2(
    prompt: string = 'Hola',
    model: string = 'gpt-4o',
    systemContent: string = 'Eres un chatbot actua como tal',
    client: any = this.client,
  ) {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
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
      ],
    });

    return response;
  }
}
