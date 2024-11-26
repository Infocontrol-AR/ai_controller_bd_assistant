-- Tabla usuario
CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) COMMENT 'Nombre del usuario',
    surname VARCHAR(255) COMMENT 'Apellido del usuario',
    email VARCHAR(255) UNIQUE COMMENT 'Correo electrónico del usuario (único)',
    role VARCHAR(255) COMMENT 'Rol del usuario, por ejemplo, usuario, administrador',
    id_empresas INT COMMENT 'Referencia de clave externa a la empresa a la que pertenece el usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se creó el usuario',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se actualizó la información del usuario'
);

-- Tabla chat
CREATE TABLE chat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT COMMENT 'Referencia de clave externa al usuario que creó el chat',
    label_chat VARCHAR(255) COMMENT 'Etiqueta o nombre del chat',
    status VARCHAR(255) COMMENT 'Estado del chat, por ejemplo, activo, archivado',
    setting_id INT COMMENT 'Referencia de clave externa a la configuración del chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se creó el chat',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se actualizó el chat',
    FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    FOREIGN KEY (setting_id) REFERENCES setting(id)
);

-- Tabla message
CREATE TABLE message (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT COMMENT 'Referencia de clave externa al chat al que pertenece el mensaje',
    sender VARCHAR(255) COMMENT 'Indica quién envió el mensaje, por ejemplo, usuario o sistema',
    content TEXT COMMENT 'Contenido del mensaje',
    bot INT COMMENT 'Indica si el mensaje fue generado por un bot (1 = bot, 0 = usuario)',
    responseSQL JSON COMMENT 'Respuesta SQL asociada al mensaje, almacenada como JSON',
    onRefresh TEXT COMMENT 'Contenido que debe usarse para actualizar el chat en el cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se envió el mensaje',
    FOREIGN KEY (chat_id) REFERENCES chat(id)
);

-- Tabla model
CREATE TABLE model (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_name VARCHAR(255) COMMENT 'Nombre o identificador del modelo de IA',
    model_version VARCHAR(255) COMMENT 'Versión del modelo de IA',
    max_tokens INT COMMENT 'Número máximo de tokens que el modelo puede generar',
    temperature FLOAT COMMENT 'Parámetro de temperatura para controlar la aleatoriedad de la salida',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se creó el modelo',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se actualizó el modelo'
);

-- Tabla prompt
CREATE TABLE prompt (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_model INT COMMENT 'Referencia de clave externa al modelo de IA al que está asociado el prompt',
    id_context INT COMMENT 'Referencia de clave externa al contexto asociado con el prompt (opcional)',
    prompt_text TEXT COMMENT 'Contenido textual del prompt de IA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se creó el prompt',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se actualizó el prompt',
    FOREIGN KEY (id_model) REFERENCES model(id),
    FOREIGN KEY (id_context) REFERENCES context(id)
);

-- Tabla setting
CREATE TABLE setting (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_model INT COMMENT 'Referencia de clave externa al modelo de IA para esta configuración',
    id_prompt INT COMMENT 'Referencia de clave externa al prompt para esta configuración',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se creó la configuración',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se actualizó la configuración',
    FOREIGN KEY (id_model) REFERENCES model(id),
    FOREIGN KEY (id_prompt) REFERENCES prompt(id)
);

-- Tabla context
CREATE TABLE context (
    id INT PRIMARY KEY AUTO_INCREMENT,
    context_text TEXT COMMENT 'Información adicional de contexto para el prompt',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se creó el contexto',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se actualizó el contexto'
);
