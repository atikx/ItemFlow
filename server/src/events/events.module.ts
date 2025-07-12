import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [EventsResolver, EventsService],
  imports: [DrizzleModule],
})
export class EventsModule {}
