import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../libs/database/database.service';

@Injectable()
export class CrudService {
  constructor(private readonly dbService: DatabaseService) {}

  private memoryDB: Record<string, any[]> = {};

  private ensureMemoryTableExists(tableName: string) {
    if (!this.memoryDB[tableName]) {
      this.memoryDB[tableName] = [];
    }
  }

  async findAll(
    tableName: string,
    useMemory: boolean = false,
  ): Promise<any[]> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      return this.memoryDB[tableName];
    }
    return await this.dbService.executeQuery(`SELECT * FROM ${tableName}`);
  }

  async findOne(
    tableName: string,
    id: number,
    useMemory: boolean = false,
  ): Promise<any> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      return this.memoryDB[tableName].find((row) => row.id === id);
    }
    return await this.dbService.executeQuery(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id],
    );
  }

  async create(
    tableName: string,
    data: Record<string, any>,
    useMemory: boolean = false,
  ): Promise<any> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      const id = this.memoryDB[tableName].length
        ? Math.max(...this.memoryDB[tableName].map((row) => row.id)) + 1
        : 1;
      const newRow = { id, ...data };
      this.memoryDB[tableName].push(newRow);
      return newRow;
    }
    const keys = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');
    await this.dbService.executeQuery(
      `INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`,
      values,
    );
    return { id: 'Generated in DB', ...data };
  }

  async update(
    tableName: string,
    id: number,
    data: Record<string, any>,
    useMemory: boolean = false,
  ): Promise<any> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      const index = this.memoryDB[tableName].findIndex((row) => row.id === id);
      if (index === -1) return null;
      this.memoryDB[tableName][index] = { ...this.memoryDB[tableName][index], ...data };
      return this.memoryDB[tableName][index];
    }
    const updates = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(data), id];
    await this.dbService.executeQuery(
      `UPDATE ${tableName} SET ${updates} WHERE id = ?`,
      values,
    );
    return { id, ...data };
  }

  async delete(
    tableName: string,
    id: number,
    useMemory: boolean = false,
  ): Promise<boolean> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      const initialLength = this.memoryDB[tableName].length;
      this.memoryDB[tableName] = this.memoryDB[tableName].filter((row) => row.id !== id);
      return this.memoryDB[tableName].length < initialLength;
    }
    await this.dbService.executeQuery(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    return true;
  }
}
