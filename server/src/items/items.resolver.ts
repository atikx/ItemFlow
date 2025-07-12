import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Resolver('Item')
@UseGuards(AuthGuard)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Mutation('createItem')
  create(
    @Args('createItemInput') createItemInput: CreateItemInput,
    @Context() context: { req: any },
  ) {
    return this.itemsService.create(
      context.req.organisation.id,
      createItemInput,
    );
  }

  @Query('items')
  findAll(@Context() context: { req: any }) {
    return this.itemsService.findAll(context.req.organisation.id);
  }

  @Query('item')
  findOne(@Args('id') id: number, @Context() context: { req: any }) {
    return this.itemsService.findOne(context.req.organisation.id, id);
  }

  @Mutation('updateItem')
  update(
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
    @Context() context: { req: any },
  ) {
    return this.itemsService.update(
      context.req.organisation.id,
      updateItemInput,
    );
  }

  @Mutation('removeItem')
  remove(@Args('id') id: string, @Context() context: { req: any }) {
    return this.itemsService.remove(context.req.organisation.id, id);
  }
}
