import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { TodoModule } from './todo/todo.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { OrganisationsModule } from './organisations/organisations.module';
import { MembersResolver } from './members/members.resolver';
import { MembersModule } from './members/members.module';
import { DepartmentsModule } from './departments/departments.module';
import { EventsModule } from './events/events.module';
import { ItemsModule } from './items/items.module';
import { ItemLogsModule } from './item-logs/item-logs.module';
import { DateResolver } from 'graphql-scalars';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      typePaths: ['./**/*.graphql'],
      context: ({ req, res }) => ({ req, res }),
    }),
    TodoModule,
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OrganisationsModule,
    MembersModule,
    DepartmentsModule,
    EventsModule,
    ItemsModule,
    ItemLogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'DateResolver',
      useValue: DateResolver,
    },
  ],
})
export class AppModule {}
