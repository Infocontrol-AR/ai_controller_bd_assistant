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

  async getTableColumns(
    tableName: string,
    useMemory: boolean = true,
  ): Promise<string[]> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);

      console.log(this.memoryDB);

      const memoryTable = this.memoryDB[tableName];

      if (memoryTable.length === 0) {
        return [];
      }
      return Object.keys(memoryTable[0]);
    }

    try {
      const query = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = ? 
          AND TABLE_SCHEMA = DATABASE();
      `;
      const result = await this.dbService.executeQuery(query, [tableName]);

      return result.map((row: { COLUMN_NAME: string }) => row.COLUMN_NAME);
    } catch (error) {
      throw new Error(
        `No se pudieron obtener las columnas de la tabla '${tableName}': ${error.message}`,
      );
    }
  }

  async findAll(tableName: string, useMemory: boolean = true): Promise<any[]> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      return this.memoryDB[tableName];
    }
    return await this.dbService.executeQuery(`SELECT * FROM ${tableName}`);
  }

  async findOne(
    tableName: string,
    id: number,
    useMemory: boolean = true,
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
    useMemory: boolean = true,
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

    const result = await this.dbService.executeQuery(
      `INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`,
      values,
    );

    const generatedId =
      result.insertId || (Array.isArray(result) && result[0]?.id);

    if (!generatedId) {
      throw new Error('No se pudo obtener el ID generado en la base de datos.');
    }

    return { id: generatedId, ...data };
  }

  async update(
    tableName: string,
    id: number,
    data: Record<string, any>,
    useMemory: boolean = true,
  ): Promise<any> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      const index = this.memoryDB[tableName].findIndex((row) => row.id === id);
      if (index === -1) return null;
      this.memoryDB[tableName][index] = {
        ...this.memoryDB[tableName][index],
        ...data,
      };
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
    useMemory: boolean = true,
  ): Promise<boolean> {
    if (useMemory) {
      this.ensureMemoryTableExists(tableName);
      const initialLength = this.memoryDB[tableName].length;
      this.memoryDB[tableName] = this.memoryDB[tableName].filter(
        (row) => row.id !== id,
      );
      return this.memoryDB[tableName].length < initialLength;
    }
    await this.dbService.executeQuery(`DELETE FROM ${tableName} WHERE id = ?`, [
      id,
    ]);
    return true;
  }
}
