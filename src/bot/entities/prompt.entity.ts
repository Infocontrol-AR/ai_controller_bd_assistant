import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Model } from './model.entity';
import { Context } from './context.entity';

@Entity('prompt')
export class Prompt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Context, (context) => context.id, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_context' })
  context: Context;

  @Column({ type: 'text', comment: 'Contenido textual del prompt de IA' })
  prompt_text: string;

}
