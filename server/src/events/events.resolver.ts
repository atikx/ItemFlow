import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { CreateEventInput } from './dto/create-event.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Resolver('Event')
@UseGuards(AuthGuard)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Mutation('createEvent')
  create(
    @Args('createEventInput') createEventInput: CreateEventInput,
    @Context() context: { req: any },
  ) {
    return this.eventsService.create(
      context.req.organisation.id,
      createEventInput,
    );
  }

  @Query('events')
  findAll(@Context() context: { req: any }) {
    return this.eventsService.findAll(context.req.organisation.id);
  }

  @Query('event')
  findOne(@Args('id') id: string, @Context() context: { req: any }) {
    return this.eventsService.findOne(context.req.organisation.id, id);
  }

  @Mutation('removeEvent')
  remove(@Args('id') id: string, @Context() context: { req: any }) {
    return this.eventsService.remove(context.req.organisation.id, id);
  }
}
