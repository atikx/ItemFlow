import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import axios from 'axios';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';

@Resolver('todo')
export class TodoResolver {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}
  @Query('todos')
  async getAllTodos() {
    const todos = await axios.get('https://jsonplaceholder.typicode.com/todos');
    return todos.data;
  }
}
