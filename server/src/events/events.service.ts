import { Inject, Injectable } from '@nestjs/common';
import { CreateEventInput } from './dto/create-event.input';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { events } from 'src/drizzle/schema/events.schema';
import { throwGraphQLError } from 'src/functions/throwGraphQLError';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class EventsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(org_id: string, createEventInput: CreateEventInput) {
    try {
      const { name, year } = createEventInput;
      const result = await this.db
        .insert(events)
        .values({
          organisationId: org_id,
          name,
          year,
        })
        .returning();

      if (result.length === 0) {
        throwGraphQLError(
          'Failed to create event',
          'EVENT_CREATION_FAILED',
          400,
        );
      }

      return result[0]; // Return the created event
    } catch (error) {
      console.log('Error creating event:', error);
      throw new Error('Internal server error while creating event');
    }
  }

  async findAll(org_id: string) {
    try {
      const result = await this.db
        .select()
        .from(events)
        .where(eq(events.organisationId, org_id));

      return result;
    } catch (error) {
      console.log('Error fetching events:', error);
      throw new Error('Internal server error while fetching events');
    }
  }

  async findOne(org_id: string, id: string) {
    return `This action returns a #${id} event`;
  }

  async remove(org_id: string, id: string) {
    try {
      const result = await this.db
        .delete(events)
        .where(and(eq(events.id, id), eq(events.organisationId, org_id)))
        .returning();

      if (result.length === 0) {
        throwGraphQLError(
          'Event not found or does not belong to the organisation',
          'EVENT_NOT_FOUND',
          404,
        );
      }

      return true;
    } catch (error) {
      console.log('Error deleting event:', error);
      throw new Error('Internal server error while deleting event');
    }
  }
}
