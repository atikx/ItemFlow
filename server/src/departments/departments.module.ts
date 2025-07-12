import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsResolver } from './departments.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [DepartmentsResolver, DepartmentsService],
  imports: [DrizzleModule],
})
export class DepartmentsModule {}
