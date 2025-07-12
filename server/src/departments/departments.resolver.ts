import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentInput } from './dto/create-department.input';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver('Department')
@UseGuards(AuthGuard)
export class DepartmentsResolver {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Mutation('createDepartment')
  create(
    @Args('createDepartmentInput') createDepartmentInput: CreateDepartmentInput,
    @Context() context: { req: any },
  ) {
    return this.departmentsService.create(
      context.req.organisation.id,
      createDepartmentInput,
    );
  }

  @Query('departments')
  findAll(@Context() context: { req: any }) {
    return this.departmentsService.findAll(context.req.organisation.id);
  }

  @Mutation('removeDepartment')
  remove(@Args('id') id: string, @Context() context: { req: any }) {
    return this.departmentsService.remove(context.req.organisation.id, id);
  }
}
