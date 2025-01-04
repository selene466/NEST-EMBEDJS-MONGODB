import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createEmployee: Prisma.EmployeeCreateInput) {
    return this.databaseService.employee.create({
      data: createEmployee,
    });
  }

  async findAll(role?: 'ADMIN' | 'ENGINEER' | 'INTERN') {
    if (role) {
      return this.databaseService.employee.findMany({
        where: { role },
      });
    }
    return this.databaseService.employee.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.employee.findUnique({
      where: { id: id.toString() },
    });
  }

  async update(id: string, updateEmployee: Prisma.EmployeeUpdateInput) {
    return this.databaseService.employee.update({
      where: { id: id.toString() },
      data: updateEmployee,
    });
  }

  async remove(id: string) {
    return this.databaseService.employee.delete({
      where: { id: id.toString() },
    });
  }
}
