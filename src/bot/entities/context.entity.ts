import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('context')
export class Context {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', comment: 'Información adicional de contexto para el prompt' })
  context_text: string;

  @CreateDateColumn({ comment: 'Fecha y hora en que se creó el contexto' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Fecha y hora en que se actualizó el contexto' })
  updated_at: Date;
}
