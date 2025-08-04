import { Module } from '@nestjs/common';
import { InductionEvaluationsService } from './induction-evaluations.service';
import { InductionEvaluationsResolver } from './induction-evaluations.resolver';

@Module({
  providers: [InductionEvaluationsResolver, InductionEvaluationsService],
})
export class InductionEvaluationsModule {}
