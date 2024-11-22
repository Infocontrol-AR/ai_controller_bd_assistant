import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: 'Nombre del usuario' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: 'Apellido del usuario' })
  surname: string;

  @Column({ type: 'varchar', length: 255, unique: true, comment: 'Correo electrónico del usuario (único)' })
  email: string;

  @Column({ type: 'varchar', length: 255, comment: 'Rol del usuario, por ejemplo, usuario, administrador' })
  role: string;

  @Column({ type: 'int', comment: 'Referencia de clave externa a la empresa a la que pertenece el usuario' })
  id_empresas: number;

  @CreateDateColumn({ comment: 'Fecha y hora en que se creó el usuario' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Fecha y hora en que se actualizó la información del usuario' })
  updated_at: Date;
}
