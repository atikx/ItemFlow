import { CreateInductionEvaluationInput } from './create-induction-evaluation.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInductionEvaluationInput extends PartialType(CreateInductionEvaluationInput) {
  id: number;
}
