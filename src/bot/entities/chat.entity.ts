import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Setting } from './setting.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, comment: 'ID del usuario asociado al chat' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 255, comment: 'Etiqueta o nombre del chat' })
  label_chat: string;

  @Column({ type: 'varchar', length: 255, comment: 'Estado del chat, por ejemplo, activo, archivado' })
  status: string;
}
