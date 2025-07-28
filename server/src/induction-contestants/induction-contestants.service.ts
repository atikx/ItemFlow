import { Inject, Injectable } from '@nestjs/common';
import { CreateInductionContestantInput } from './dto/create-induction-contestant.input';
import { UpdateInductionContestantInput } from './dto/update-induction-contestant.input';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { throwGraphQLError } from 'src/functions/throwGraphQLError';
import { inductionContestants } from 'src/drizzle/schema/inductionContestants.schema';
import { and, eq, sql } from 'drizzle-orm';
import { inductionEvaluations } from 'src/drizzle/schema/inductionEvaluations.schema';
import { inductionQualities } from 'src/drizzle/schema/inductionQuantities.schema';

@Injectable()
export class InductionContestantsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}
  async create(
    org_id: string,
    createInductionContestantInput: CreateInductionContestantInput,
  ) {
    try {
      const [newContestant] = await this.db
        .insert(inductionContestants)
        .values({
          name: createInductionContestantInput.name,
          email: createInductionContestantInput.email,
          organisationId: org_id,
        })
        .returning();
      if (!newContestant) {
        throwGraphQLError('Failed to create induction contestant');
      }
      return newContestant;
    } catch (error) {
      console.log(error);
      throwGraphQLError('Internal server error');
    }
  }

  async findAll(org_id: string) {
    try {
      const contestants = await this.db
        .select()
        .from(inductionContestants)
        .where(eq(inductionContestants.organisationId, org_id));
      return contestants;
    } catch (error) {
      console.error('Error fetching induction contestants:', error);
      throwGraphQLError('Internal server error');
    }
  }

  async getContestantEvaluationData(org_id: string, id: string) {
    try {
      const contestant = await this.db.query.inductionContestants.findFirst({
        where: (contestant, { eq, and }) =>
          and(eq(contestant.id, id), eq(contestant.organisationId, org_id)),

        with: {
          evaluations: {
            with: {
              quality: true,
            },
          },
        },
      });
      if (!contestant) {
        throwGraphQLError('Induction contestant not found');
      }
      return contestant;
    } catch (error) {
      console.error('Error fetching contestant evaluation data:', error);
      throwGraphQLError('Internal server error');
    }
  }

  async update(
    org_id: string,
    updateInductionContestantInput: UpdateInductionContestantInput,
  ) {
    try {
      const [updatedContestant] = await this.db
        .update(inductionContestants)
        .set({
          ...(updateInductionContestantInput.name !== undefined && {
            name: updateInductionContestantInput.name,
          }),
          ...(updateInductionContestantInput.email !== undefined && {
            email: updateInductionContestantInput.email,
          }),
        })
        .where(
          and(
            eq(inductionContestants.id, updateInductionContestantInput.id),
            eq(inductionContestants.organisationId, org_id),
          ),
        )
        .returning();

      if (!updatedContestant) {
        throwGraphQLError('Failed to update induction contestant');
      }
      return updatedContestant;
    } catch (error) {
      console.error('Error updating induction contestant:', error);
      throwGraphQLError('Internal server error');
    }
  }

  async remove(org_id: string, id: string) {
    try {
      const result = await this.db
        .delete(inductionContestants)
        .where(
          and(
            eq(inductionContestants.id, id),
            eq(inductionContestants.organisationId, org_id),
          ),
        );
      if (!result) {
        throwGraphQLError('Failed to remove induction contestant');
      }
      return true;
    } catch (error) {
      console.error('Error removing induction contestant:', error);
      throwGraphQLError('Internal server error');
    }
  }

  async evaluateContestant(org_id: string, evaluateContestantInput: any) {
    try {
      const { contestantId, totalScore, qualities } = evaluateContestantInput;

      if (
        !contestantId ||
        !Array.isArray(qualities) ||
        typeof totalScore !== 'number'
      ) {
        throwGraphQLError('Invalid evaluation input', 'Bad Request', 400);
      }

      // ✅ Check if total weightage is exactly 100
      const [{ total }] = await this.db
        .select({
          total: sql<number>`SUM(${inductionQualities.weightage})`,
        })
        .from(inductionQualities)
        .where(eq(inductionQualities.organisationId, org_id));

      if (total !== 100) {
        throwGraphQLError(
          `Total quality weightage must be exactly 100, found ${total}`,
          'Invalid weightage distribution',
          400,
        );
      }

      // ✅ Insert evaluations for each quality
      await Promise.all(
        qualities.map(async (quantity) => {
          if (!quantity.qualityId || !quantity.score) {
            throwGraphQLError(
              'Invalid quality data',
              'Invalid quality data',
              400,
            );
          }

          const [quantityScore] = await this.db
            .insert(inductionEvaluations)
            .values({
              contestantId,
              qualityId: quantity.qualityId,
              score: quantity.score,
              organisationId: org_id,
            })
            .returning();

          if (!quantityScore) {
            throwGraphQLError(
              'Failed to evaluate contestant',
              'Evaluation failed',
              500,
            );
          }
        }),
      );

      // ✅ Update final score
      const [updatedContestant] = await this.db
        .update(inductionContestants)
        .set({ finalScore: totalScore })
        .where(
          and(
            eq(inductionContestants.id, contestantId),
            eq(inductionContestants.organisationId, org_id),
          ),
        )
        .returning();

      if (!updatedContestant) {
        throwGraphQLError(
          'Failed to update contestant score',
          'Update failed',
          500,
        );
      }

      return updatedContestant;
    } catch (error) {
      console.error('Error evaluating contestant:', error);
      throwGraphQLError('Internal server error');
    }
  }
}
