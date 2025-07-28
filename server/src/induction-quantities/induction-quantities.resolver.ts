import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { InductionQuantitiesService } from './induction-quantities.service';
import { CreateInductionQuantityInput } from './dto/create-induction-quantity.input';
import { UpdateInductionQuantityInput } from './dto/update-induction-quantity.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Resolver('InductionQuantity')
@UseGuards(AuthGuard)
export class InductionQuantitiesResolver {
  constructor(
    private readonly inductionQuantitiesService: InductionQuantitiesService,
  ) {}

  @Mutation('createInductionQuantity')
  create(
    @Context() context: { req: any },
    @Args('createInductionQuantityInput')
    createInductionQuantityInput: CreateInductionQuantityInput,
  ) {
    return this.inductionQuantitiesService.create(
      context.req.organisation.id,
      createInductionQuantityInput,
    );
  }

  @Query('inductionQuantities')
  findAll(@Context() context: { req: any }) {
    return this.inductionQuantitiesService.findAll(context.req.organisation.id);
  }

  @Query('inductionQuantity')
  findOne(@Context() context: { req: any }, @Args('id') id: number) {
    return this.inductionQuantitiesService.findOne(
      context.req.organisation.id,
      id,
    );
  }

  @Mutation('updateInductionQuantity')
  update(
    @Context() context: { req: any },
    @Args('updateInductionQuantityInput')
    updateInductionQuantityInput: UpdateInductionQuantityInput,
  ) {
    return this.inductionQuantitiesService.update(
      context.req.organisation.id,
      updateInductionQuantityInput,
    );
  }

  @Mutation('removeInductionQuantity')
  remove(@Context() context: { req: any }, @Args('id') id: string) {
    return this.inductionQuantitiesService.remove(
      context.req.organisation.id,
      id,
    );
  }
}
