import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DatabaseModule } from '../database/database.module';
import { MyLoggerModule } from './my-logger/my-logger.module';

@Module({
  imports: [DatabaseModule, MyLoggerModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
