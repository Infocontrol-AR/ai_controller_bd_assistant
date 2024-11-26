import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('context')
export class Context {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', comment: 'Información adicional de contexto para el prompt' })
  context_text: string;

}
