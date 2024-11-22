import { Injectable } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly realDataSource: DataSource;
  private readonly memoryDataSource: DataSource;

  constructor() {
    const realConfig: DataSourceOptions = {
      type: 'mysql',
      host: '181.119.169.180',
      port: 3306,
      username: 'admin_remoto',
      password: 'Y$47sdy70',
      database: 'bd_infocontrol_desarrollo',
      synchronize: true,
      entities: ['dist/**/*.entity.js'],
    };

    const memoryConfig: DataSourceOptions = {
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: ['dist/**/*.entity.js'],
    };

    this.realDataSource = new DataSource(realConfig);
    this.memoryDataSource = new DataSource(memoryConfig);
  }

  async initialize(): Promise<void> {
    if (!this.realDataSource.isInitialized) {
      await this.realDataSource.initialize();
    }
    if (!this.memoryDataSource.isInitialized) {
      await this.memoryDataSource.initialize();
    }
  }

  getDataSource(useMemory: boolean): DataSource {
    return useMemory ? this.memoryDataSource : this.realDataSource;
  }

  async executeQuery(query: string, params?: any[], useMemory = false): Promise<any> {
    const dataSource = this.getDataSource(useMemory);
    return await dataSource.query(query, params);
  }

  getRepository(entity: any, useMemory = false) {
    const dataSource = this.getDataSource(useMemory);
    return dataSource.getRepository(entity);
  }
}
