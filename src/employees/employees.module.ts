import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';
import { EmployeesController } from './employees.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { MyLoggerModule } from './my-logger/my-logger.module.js';

@Module({
  imports: [DatabaseModule, MyLoggerModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
