import { Injectable } from '@nestjs/common';
import { CreateInductionEvaluationInput } from './dto/create-induction-evaluation.input';
import { UpdateInductionEvaluationInput } from './dto/update-induction-evaluation.input';

@Injectable()
export class InductionEvaluationsService {
  create(createInductionEvaluationInput: CreateInductionEvaluationInput) {
    return 'This action adds a new inductionEvaluation';
  }

  findAll() {
    return `This action returns all inductionEvaluations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inductionEvaluation`;
  }

  update(id: number, updateInductionEvaluationInput: UpdateInductionEvaluationInput) {
    return `This action updates a #${id} inductionEvaluation`;
  }

  remove(id: number) {
    return `This action removes a #${id} inductionEvaluation`;
  }
}
