import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import * as jwt from 'jsonwebtoken';
import { organisations } from 'src/drizzle/schema/organisations.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    console.log('AuthGuard: Checking authentication...');

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const token = req.cookies['org_id'];

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    } catch {
      throw new ForbiddenException('Invalid or expired token');
    }

    console.log(`AuthGuard: Verifying organisation with ID ${payload.org_id}`);

    const [org] = await this.db
      .select()
      .from(organisations)
      .where(eq(organisations.id, payload.org_id));

    console.log(`AuthGuard: Found organisation:`, org);

    if (!org) {
      throw new UnauthorizedException('Organisation not found');
    }

    req.organisation = org;

    return true;
  }
}
