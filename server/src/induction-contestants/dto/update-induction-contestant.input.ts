import { CreateInductionContestantInput } from './create-induction-contestant.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInductionContestantInput  {
  id: string;
  name?: string;
  email?: string;
}
