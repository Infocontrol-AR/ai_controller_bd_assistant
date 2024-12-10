import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: false,
    comment: 'ID del usuario asociado al chat',
  })
  id_usuario: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Etiqueta o nombre del chat',
  })
  label_chat: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Estado del chat, por ejemplo, activo, archivado',
  })
  status: string;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Fecha y hora personalizada del chat',
  })
  created_at: Date;
}
