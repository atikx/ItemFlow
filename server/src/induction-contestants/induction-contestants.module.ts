import { Module } from '@nestjs/common';
import { InductionContestantsService } from './induction-contestants.service';
import { InductionContestantsResolver } from './induction-contestants.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [InductionContestantsResolver, InductionContestantsService],
  imports: [DrizzleModule],
})
export class InductionContestantsModule {}
