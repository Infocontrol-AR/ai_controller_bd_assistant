import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('model')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: 'Nombre o identificador del modelo de IA' })
  model_name: string;

  @Column({ type: 'varchar', length: 255, comment: 'Versión del modelo de IA' })
  model_version: string;

  @Column({ type: 'int', comment: 'Número máximo de tokens que el modelo puede generar' })
  max_tokens: number;

  @Column({ type: 'float', comment: 'Parámetro de temperatura para controlar la aleatoriedad de la salida' })
  temperature: number;

}
