import { Module } from '@nestjs/common';
import { InductionQuantitiesService } from './induction-quantities.service';
import { InductionQuantitiesResolver } from './induction-quantities.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [InductionQuantitiesResolver, InductionQuantitiesService],
  imports: [DrizzleModule],
})
export class InductionQuantitiesModule {}
