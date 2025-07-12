import { Inject, Injectable } from '@nestjs/common';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { items } from 'src/drizzle/schema/items.schema';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class ItemsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(org_id: string, createItemInput: CreateItemInput) {
    try {
      const [newItem] = await this.db
        .insert(items)
        .values({
          name: createItemInput.name.trim(),
          quantityTotal: createItemInput.quantityTotal,
          quantityAvailable: createItemInput.quantityTotal,
          organisationId: org_id,
        })
        .returning();

      if (!newItem) {
        throw new Error('Failed to create item');
      }
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error('internal server error');
    }
  }

  async findAll(org_id: string) {
    try {
      const allItems = await this.db
        .select()
        .from(items)
        .where(eq(items.organisationId, org_id));

      return allItems;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw new Error('internal server error');
    }
  }

  async findOne(org_id: string, id: number) {
    return `This action returns a #${id} item`;
  }

  async update(org_id: string, updateItemInput: UpdateItemInput) {
    try {
      const { id, name, quantityTotal } = updateItemInput;

      const updateData: Record<string, any> = {};

      // 1. Fetch existing item
      const existing = await this.db.query.items.findFirst({
        where: and(eq(items.id, id), eq(items.organisationId, org_id)),
      });

      if (!existing) throw new Error('Item not found');

      if (typeof name === 'string') {
        updateData.name = name.trim();
      }

      if (typeof quantityTotal === 'number') {
        const delta = quantityTotal - existing.quantityTotal;

        updateData.quantityTotal = quantityTotal;
        updateData.quantityAvailable = sql`${items.quantityAvailable} + ${delta}`;
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields to update');
      }

      const updatedItem = await this.db
        .update(items)
        .set(updateData)
        .where(and(eq(items.id, id), eq(items.organisationId, org_id)))
        .returning();

      if (!updatedItem || updatedItem.length === 0) {
        throw new Error('Item not found or already updated');
      }
      return updatedItem[0];
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error('internal server error');
    }
  }

  async remove(org_id: string, id: string) {
    try {
      const deletedItem = await this.db
        .delete(items)
        .where(and(eq(items.id, id), eq(items.organisationId, org_id)))
        .returning();

      if (!deletedItem || deletedItem.length === 0) {
        throw new Error('Item not found or already deleted');
      }
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      throw new Error('internal server error');
    }
  }
}
