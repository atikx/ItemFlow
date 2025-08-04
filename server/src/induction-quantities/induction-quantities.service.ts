import { Inject, Injectable } from '@nestjs/common';
import { CreateInductionQuantityInput } from './dto/create-induction-quantity.input';
import { UpdateInductionQuantityInput } from './dto/update-induction-quantity.input';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { inductionQualities } from 'src/drizzle/schema/inductionQuantities.schema';
import { throwGraphQLError } from 'src/functions/throwGraphQLError';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class InductionQuantitiesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(
    org_id: string,
    createInductionQuantityInput: CreateInductionQuantityInput,
  ) {
    try {
      // 1. Get current sum of weightages for the organisation
      const [{ total }] = await this.db
        .select({
          total: sql<number>`SUM(${inductionQualities.weightage})`,
        })
        .from(inductionQualities)
        .where(eq(inductionQualities.organisationId, org_id));

      const newWeightage = createInductionQuantityInput.weightage;

      if ((total ?? 0) + newWeightage > 100) {
        throwGraphQLError(
          'Total weightage cannot exceed 100 for this organisation',
        );
      }

      // 2. Proceed with insert if valid
      const [newInductionQuantity] = await this.db
        .insert(inductionQualities)
        .values({
          name: createInductionQuantityInput.name.trim(),
          weightage: newWeightage,
          organisationId: org_id,
        })
        .returning();

      if (!newInductionQuantity) {
        throwGraphQLError('Failed to create induction quantity');
      }

      return newInductionQuantity;
    } catch (error) {
      console.error('Error creating induction quantity:', error);
      throwGraphQLError('Internal server error');
    }
  }

  async findAll(org_id: string) {
    try {
      const inductionQuantities = await this.db
        .select()
        .from(inductionQualities)
        .where(eq(inductionQualities.organisationId, org_id));
      return inductionQuantities;
    } catch (error) {
      console.error('Error fetching induction quantities:', error);
      throw new Error('internal server error');
    }
  }

  async findOne(org_id: string, id: number) {
    return `This action returns a #${id} inductionQuantity`;
  }

  async update(
    org_id: string,
    updateInductionQuantityInput: UpdateInductionQuantityInput,
  ) {
    try {
      const updatedFields: Partial<typeof inductionQualities.$inferInsert> = {};

      if (updateInductionQuantityInput.name !== undefined) {
        updatedFields.name = updateInductionQuantityInput.name.trim();
      }

      if (updateInductionQuantityInput.weightage !== undefined) {
        updatedFields.weightage = updateInductionQuantityInput.weightage;
      }

      if (Object.keys(updatedFields).length === 0) {
        throwGraphQLError('No fields provided for update');
      }

      const [updatedInductionQuantity] = await this.db
        .update(inductionQualities)
        .set(updatedFields)
        .where(
          and(
            eq(inductionQualities.id, updateInductionQuantityInput.id),
            eq(inductionQualities.organisationId, org_id),
          ),
        )
        .returning();

      if (!updatedInductionQuantity) {
        throwGraphQLError('Failed to update induction quantity');
      }

      return updatedInductionQuantity;
    } catch (error) {
      console.error('Error updating induction quantity:', error);
      throwGraphQLError('Internal server error');
    }
  }

  async remove(org_id: string, id: string) {
    try {
      const [deletedInductionQuantity] = await this.db
        .delete(inductionQualities)
        .where(
          and(
            eq(inductionQualities.id, id),
            eq(inductionQualities.organisationId, org_id),
          ),
        )
        .returning();

      if (!deletedInductionQuantity) {
        throwGraphQLError('Induction quantity not found', 'NOT_FOUND', 404);
      }
      return true;
    } catch (error) {
      console.error('Error removing induction quantity:', error);
      throwGraphQLError('Internal server error');
    }
  }
}
