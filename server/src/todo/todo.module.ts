import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoResolver } from './todo.resolver';
import { TodoController } from './todo.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [TodoService, TodoResolver],
  controllers: [TodoController],
  imports: [DrizzleModule],
})
export class TodoModule {}
