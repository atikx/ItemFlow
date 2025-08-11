import { Inject, Injectable } from '@nestjs/common';
import { CreateItemLogInput } from './dto/create-item-log.input';
import { UpdateItemLogInput } from './dto/update-item-log.input';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { itemLogs } from 'src/drizzle/schema/itemLogs.schema';
import { throwGraphQLError } from 'src/functions/throwGraphQLError';
import { and, eq, sql } from 'drizzle-orm';
import { items } from 'src/drizzle/schema/items.schema';

@Injectable()
export class ItemLogsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(org_id: string, createItemLogInput: CreateItemLogInput) {
    // check if the issued quantity is smaller than the available quantity
    const [item] = await this.db
      .select({
        quantityAvailable: items.quantityAvailable,
      })
      .from(items)
      .where(
        and(
          eq(items.id, createItemLogInput.itemId),
          eq(items.organisationId, org_id),
        ),
      );

    if (item.quantityAvailable < createItemLogInput.quantityIssued) {
      throwGraphQLError(
        'Insufficient item quantity available',
        'ITEM_QUANTITY_INSUFFICIENT',
      );
    }
    // decrease the quantity of the item
    const [decreasedItem] = await this.db
      .update(items)
      .set({
        quantityAvailable: sql`${items.quantityAvailable} - ${createItemLogInput.quantityIssued}`,
      })
      .where(
        and(
          eq(items.id, createItemLogInput.itemId),
          eq(items.organisationId, org_id),
        ),
      )
      .returning();

    if (!decreasedItem) {
      throwGraphQLError(
        'Failed to update item quantity',
        'ITEM_QUANTITY_UPDATE_FAILED',
      );
    }

    try {
      const [newItemLog] = await this.db
        .insert(itemLogs)
        .values({
          itemId: createItemLogInput.itemId,
          eventId: createItemLogInput.eventId,
          issuedBy: createItemLogInput.issuedBy,
          phone: createItemLogInput.phone,
          quantityIssued: createItemLogInput.quantityIssued,
          expectedReturnDate: new Date(createItemLogInput.expectedReturnDate),
          organisationId: org_id,
          departmentId: createItemLogInput.departmentId,
        })
        .returning();

      if (!newItemLog) {
        throwGraphQLError(
          'Failed to create item log',
          'ITEM_LOG_CREATION_FAILED',
        );
      }
      return newItemLog;
    } catch (error) {
      console.error('Error creating item log:', error);
      throw new Error('Failed to create item log');
    }
  }

  async findAll(org_id: string, eventId: string) {
    try {
      const logs = await this.db
        .select()
        .from(itemLogs)
        .where(
          and(
            eq(itemLogs.eventId, eventId),
            eq(itemLogs.organisationId, org_id),
          ),
        );

      return logs;
    } catch (error) {
      console.error('Error fetching item logs:', error);
      throw new Error('Failed to fetch item logs');
    }
  }

  async findOne(org_id: string, id: string) {
    return `This action returns a #${id} itemLog`;
  }

  async update(org_id: string, updateItemLogInput: UpdateItemLogInput) {
    return `This action updates an itemLog`;
  }

  async return(org_id: string, id: string) {
    try {
      // firstly find the item log
      const [itemLog] = await this.db
        .select({
          itemId: itemLogs.itemId,
          quantityIssued: itemLogs.quantityIssued,
        })
        .from(itemLogs)
        .where(and(eq(itemLogs.id, id), eq(itemLogs.organisationId, org_id)));

      if (!itemLog) {
        throwGraphQLError('Item log not found', 'ITEM_LOG_NOT_FOUND', 404);
      }

      // increase the quantity of the item
      const [increasedItem] = await this.db
        .update(items)
        .set({
          quantityAvailable: sql`${items.quantityAvailable} + ${itemLog.quantityIssued}`,
        })
        .where(
          and(eq(items.id, itemLog.itemId), eq(items.organisationId, org_id)),
        )
        .returning();

      if (!increasedItem) {
        throwGraphQLError(
          'Failed to update item quantity',
          'ITEM_QUANTITY_UPDATE_FAILED',
        );
      }

      // return the item
      const [returnedItemLog] = await this.db
        .update(itemLogs)
        .set({
          returnedAt: new Date(),
        })
        .where(and(eq(itemLogs.id, id), eq(itemLogs.organisationId, org_id)))
        .returning();

      if (!returnedItemLog) {
        throwGraphQLError('Failed to return item', 'ITEM_LOG_DELETION_FAILED');
      }

      return true;
    } catch (error) {
      console.error('Error removing item log:', error);
      throw new Error('Failed to remove item log');
    }
  }
}
