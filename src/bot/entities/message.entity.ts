import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chat } from './chat.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Indica quién envió el mensaje, por ejemplo, usuario o sistema',
  })
  sender: string;

  @Column({ type: 'text', comment: 'Contenido del mensaje' })
  content: string;

  @Column({
    type: 'int',
    comment:
      'Indica si el mensaje fue generado por un bot (1 = bot, 0 = usuario)',
  })
  bot: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Respuesta SQL asociada al mensaje, almacenada como JSON',
  })
  responseSQL: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Contenido que debe usarse para actualizar el chat en el cliente',
  })
  onRefresh: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Indica si el mensaje es visible para el cliente',
  })
  visible: boolean;

  @Column({ type: 'text', nullable: true, comment: 'Archivos asociados al mensaje' })
  files: string;
  
  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Fecha y hora personalizada del chat',
  })
  created_at: Date;
}
