import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({ type: 'varchar', length: 255, comment: 'Indica quién envió el mensaje, por ejemplo, usuario o sistema' })
  sender: string;

  @Column({ type: 'text', comment: 'Contenido del mensaje' })
  content: string;

  @Column({ type: 'int', comment: 'Indica si el mensaje fue generado por un bot (1 = bot, 0 = usuario)' })
  bot: number;

  @Column({ type: 'json', nullable: true, comment: 'Respuesta SQL asociada al mensaje, almacenada como JSON' })
  responseSQL: object;

  @Column({ type: 'text', nullable: true, comment: 'Contenido que debe usarse para actualizar el chat en el cliente' })
  onRefresh: string;

  @CreateDateColumn({ comment: 'Fecha y hora en que se envió el mensaje' })
  created_at: Date;
}
