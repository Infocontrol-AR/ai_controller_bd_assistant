import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Model } from './model.entity';
import { Prompt } from './prompt.entity';

@Entity('setting')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Model, (model) => model.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_model' })
  model: Model;

  @ManyToOne(() => Prompt, (prompt) => prompt.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_prompt' })
  prompt: Prompt;

  @CreateDateColumn({ comment: 'Fecha y hora en que se creó la configuración' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Fecha y hora en que se actualizó la configuración' })
  updated_at: Date;
}


