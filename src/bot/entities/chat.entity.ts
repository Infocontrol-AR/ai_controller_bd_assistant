import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './user.entity';
import { Setting } from './setting.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 255, comment: 'Etiqueta o nombre del chat' })
  label_chat: string;

  @Column({ type: 'varchar', length: 255, comment: 'Estado del chat, por ejemplo, activo, archivado' })
  status: string;

  @ManyToOne(() => Setting, (setting) => setting.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'setting_id' })
  setting: Setting;

}
