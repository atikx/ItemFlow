import { Inject, Injectable } from '@nestjs/common';
import { CreateDepartmentInput } from './dto/create-department.input';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { departments } from 'src/drizzle/schema/departments.schema';
import { and, eq } from 'drizzle-orm';
import { throwGraphQLError } from 'src/functions/throwGraphQLError';

@Injectable()
export class DepartmentsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(org_id: string, createDepartmentInput: CreateDepartmentInput) {
    try {
      const { name, email } = createDepartmentInput;

      // Validate input
      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      // Insert new department into the database
      const newDepartment = await this.db
        .insert(departments)
        .values({
          name: name.trim(),
          email: email.trim(),
          organisationId: org_id,
        })
        .returning();

      if (newDepartment.length === 0) {
        throw new Error('Failed to create department');
      }

      return newDepartment[0];
    } catch (error) {
      console.error('Error creating department:', error);
      throw new Error('internal server error');
    }
  }

  async findAll(org_id: string) {
    try {
      // Fetch all departments for the given organisation
      const allDepartments = await this.db
        .select({
          id: departments.id,
          name: departments.name,
          email: departments.email,
        })
        .from(departments)
        .where(eq(departments.organisationId, org_id));

      

      return allDepartments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw new Error('internal server error');
    }
  }

  async remove(org_id: string, id: string) {
    try {
      // Validate input
      if (!id) {
        throw new Error('Department ID is required');
      }

      // Delete the department with the given ID
      const result = await this.db
        .delete(departments)
        .where(
          and(eq(departments.id, id), eq(departments.organisationId, org_id)),
        )
        .returning();

      if (result.length === 0) {
        throwGraphQLError('Department not found', 'NOT_FOUND', 404);
      }

      return true;
    } catch (error) {
      console.error('Error removing department:', error);
      throw new Error('internal server error');
    }
  }
}
