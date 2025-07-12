import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { organisations } from 'src/drizzle/schema/schema';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { throwGraphQLError } from 'src/functions/throwGraphQLError';

@Injectable()
export class OrganisationsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  findOne(id: string) {
    return this.db.query.organisations.findFirst({
      where: eq(organisations.id, id),
    });
  }

  async create(data: { name: string; passwordHash: string }) {
    // Check if the organisation already exists
    const existingOrg = await this.db.query.organisations.findFirst({
      where: eq(organisations.name, data.name.trim()),
    });
    if (existingOrg) {
      throwGraphQLError(
        'Organisation with this name already exists',
        'ORGANISATION_EXISTS',
        400,
      );
    }
    const hashedPassword = await bcrypt.hash(data.passwordHash.trim(), 10);
    const [newOrg] = await this.db
      .insert(organisations)
      .values({
        name: data.name,
        passwordHash: hashedPassword,
      })
      .returning();
    return newOrg;
  }

  async login(data: { name: string; passwordHash: string }) {
    const org = await this.db.select({
      id: organisations.id,
      name: organisations.name,
      passwordHash: organisations.passwordHash,
    }).from(organisations).where(
      eq(organisations.name, data.name.trim()),
    )


    if (org.length == 0 || org == undefined) {
      throwGraphQLError(
        'Organisation not found',
        'ORGANISATION_NOT_FOUND',
        404,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      data.passwordHash,
      org[0].passwordHash,
    );
    if (!isPasswordValid) {
      throwGraphQLError('Invalid password', 'INVALID_PASSWORD', 420);
    }

    return org[0];
  }

  async chechLogin(data: {token: string}){}

  async update(data: any) {
    const [updated] = await this.db
      .update(organisations)
      .set(data)
      .where(eq(organisations.id, data.id))
      .returning();
    return updated;
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(organisations)
      .where(eq(organisations.id, id))
      .returning();
    return deleted;
  }
}
