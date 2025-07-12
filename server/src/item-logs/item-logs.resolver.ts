import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ItemLogsService } from './item-logs.service';
import { CreateItemLogInput } from './dto/create-item-log.input';
import { UpdateItemLogInput } from './dto/update-item-log.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Resolver('ItemLog')
@UseGuards(AuthGuard)
export class ItemLogsResolver {
  constructor(private readonly itemLogsService: ItemLogsService) {}

  @Mutation('createItemLog')
  create(
    @Args('createItemLogInput') createItemLogInput: CreateItemLogInput,
    @Context() context: { req: any },
  ) {
    return this.itemLogsService.create(
      context.req.organisation.id,
      createItemLogInput,
    );
  }

  @Query('itemLogs')
  findAll(
    @Context() context: { req: any },
    @Args('eventId', { nullable: false }) eventId: string,
  ) {
    return this.itemLogsService.findAll(context.req.organisation.id, eventId);
  }

  @Query('itemLog')
  findOne(@Args('id') id: string, @Context() context: { req: any }) {
    return this.itemLogsService.findOne(context.req.organisation.id, id);
  }

  @Mutation('updateItemLog')
  update(
    @Args('updateItemLogInput') updateItemLogInput: UpdateItemLogInput,
    @Context() context: { req: any },
  ) {
    return this.itemLogsService.update(
      context.req.organisation.id,
      updateItemLogInput,
    );
  }

  @Mutation('returnItemLog')
  return(@Args('id') id: string, @Context() context: { req: any }) {
    return this.itemLogsService.return(context.req.organisation.id, id);
  }
}
