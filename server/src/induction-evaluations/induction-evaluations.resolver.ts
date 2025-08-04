import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InductionEvaluationsService } from './induction-evaluations.service';
import { CreateInductionEvaluationInput } from './dto/create-induction-evaluation.input';
import { UpdateInductionEvaluationInput } from './dto/update-induction-evaluation.input';

@Resolver('InductionEvaluation')
export class InductionEvaluationsResolver {
  constructor(private readonly inductionEvaluationsService: InductionEvaluationsService) {}

  @Mutation('createInductionEvaluation')
  create(@Args('createInductionEvaluationInput') createInductionEvaluationInput: CreateInductionEvaluationInput) {
    return this.inductionEvaluationsService.create(createInductionEvaluationInput);
  }

  @Query('inductionEvaluations')
  findAll() {
    return this.inductionEvaluationsService.findAll();
  }

  @Query('inductionEvaluation')
  findOne(@Args('id') id: number) {
    return this.inductionEvaluationsService.findOne(id);
  }

  @Mutation('updateInductionEvaluation')
  update(@Args('updateInductionEvaluationInput') updateInductionEvaluationInput: UpdateInductionEvaluationInput) {
    return this.inductionEvaluationsService.update(updateInductionEvaluationInput.id, updateInductionEvaluationInput);
  }

  @Mutation('removeInductionEvaluation')
  remove(@Args('id') id: number) {
    return this.inductionEvaluationsService.remove(id);
  }
}
