import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { InductionContestantsService } from './induction-contestants.service';
import { CreateInductionContestantInput } from './dto/create-induction-contestant.input';
import { UpdateInductionContestantInput } from './dto/update-induction-contestant.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Resolver('InductionContestant')
@UseGuards(AuthGuard)
export class InductionContestantsResolver {
  constructor(
    private readonly inductionContestantsService: InductionContestantsService,
  ) {}

  @Mutation('createInductionContestant')
  create(
    @Context() context: { req: any },
    @Args('createInductionContestantInput')
    createInductionContestantInput: CreateInductionContestantInput,
  ) {
    return this.inductionContestantsService.create(context.req.organisation.id,
      createInductionContestantInput,
    );
  }

  @Query('inductionContestants')
  findAll(@Context() context: { req: any }) {
    return this.inductionContestantsService.findAll(context.req.organisation.id,);
  }

  @Query('getContestantEvaluationData')
  getContestantEvaluationData(@Context() context: { req: any }, @Args('id') id: string) {
    return this.inductionContestantsService.getContestantEvaluationData(context.req.organisation.id,id);
  }

  @Mutation('updateInductionContestant')
  update(
    @Context() context: { req: any },
    @Args('updateInductionContestantInput')
    updateInductionContestantInput: UpdateInductionContestantInput,
  ) {
    return this.inductionContestantsService.update(
      context.req.organisation.id,
      updateInductionContestantInput,
    );
  }

  @Mutation('removeInductionContestant')
  remove(@Context() context: { req: any }, @Args('id') id: string) {
    return this.inductionContestantsService.remove(context.req.organisation.id,id);
  }

  @Mutation('evaluateContestant')
  evaluateContestant(
    @Context() context: { req: any },
    @Args('evaluateContestantInput') evaluateContestantInput: any,
  ) {
    return this.inductionContestantsService.evaluateContestant(
      context.req.organisation.id,
      evaluateContestantInput,
    );
  }
}
