import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  async executeQuery(query: string, params?: any[]): Promise<any> {
    return await this.dataSource.query(query, params);
  }
}