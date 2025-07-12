import { Inject, Injectable } from '@nestjs/common';
import { CreateMemberInput } from './dto/create-member.input';
import { UpdateMemberInput } from './dto/update-member.input';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { members } from 'src/drizzle/schema/members.schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class MembersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(org_id: string, createMemberInput: CreateMemberInput) {
    try {
      const newMember = await this.db
        .insert(members)
        .values({
          name: createMemberInput.name.trim(),
          batch: createMemberInput.batch,
          organisationId: org_id,
        })
        .returning();
      if (newMember.length === 0) {
        throw new Error('Failed to create member');
      }
      return newMember[0];
    } catch (error) {
      console.error('Error creating member:', error);
      throw new Error('internal server error');
    }
  }

  async findAll(org_id: string) {
    try {
      const allMembers = await this.db
        .select({
          id: members.id,
          name: members.name,
          batch: members.batch,
        })
        .from(members)
        .where(eq(members.organisationId, org_id));
      return allMembers;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error('internal server error');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} member`;
  }

  async update(org_id: string, updateMemberInput: UpdateMemberInput) {
    try {
      const { id, name, batch } = updateMemberInput;

      const updateData: any = {};
      if (name !== undefined) {
        updateData.name = name.trim();
      }
      if (batch !== undefined) {
        updateData.batch = batch;
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields to update');
      }

      const [updatedMember] = await this.db
        .update(members)
        .set(updateData)
        .where(and(eq(members.id, id), eq(members.organisationId, org_id)))
        .returning();


      return updatedMember;
    } catch (error) {
      console.log('error in update member service:', error);
      throw new Error('internal server error');
    }
  }

  async remove(org_id: string, id: string) {
    console.log('Removing member with ID:', id, 'from organisation:', org_id);
    try {
      const deletedMember = await this.db
        .delete(members)
        .where(and(eq(members.id, id), eq(members.organisationId, org_id)))
        .returning();

      if (deletedMember.length === 0) {
        throw new Error('Member not found or already deleted');
      }
      console.log('Deleted member:', deletedMember);
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      throw new Error('internal server error');
      return false;
    }
  }
}
