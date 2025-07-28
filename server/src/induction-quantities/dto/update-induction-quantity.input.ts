import { CreateInductionQuantityInput } from './create-induction-quantity.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInductionQuantityInput  {
  id: string;
  name?: string;
  weightage?: number;
}
