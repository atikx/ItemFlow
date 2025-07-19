import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { OrganisationsService } from './organisations.service';
import { generateToken } from 'src/functions/tokenGenerator';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Resolver('Organisation')
export class OrganisationsResolver {
  constructor(private readonly service: OrganisationsService) {}

  @Query('organisation')
  getOne(@Args('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Query('checkOrganisationLogin')
  checkLogin(@Context() context: { req: any }) {
    const org = context.req.organisation;
    if (!org) {
      return null;
    }
    return {
      id: org.id,
      name: org.name,
    };
  }

  @Mutation('createOrganisation')
  async create(
    @Args('createOrganisationInput') input: any,
    @Context() context: { res: Response },
  ) {
    const newOrg = await this.service.create(input);
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(isProduction);
    context.res.cookie('org_id', generateToken(newOrg.id), {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return {
      id: newOrg.id,
      name: newOrg.name,
    };
  }

  @Mutation('updateOrganisation')
  update(@Args('updateOrganisationInput') input: any) {
    return this.service.update(input);
  }

  @Mutation('removeOrganisation')
  remove(@Args('id') id: string) {
    return this.service.remove(id);
  }

  @Mutation('loginOrganisation')
  async login(
    @Args('loginOrganisationInput')
    input: { name: string; passwordHash: string },
    @Context() context: { res: Response },
  ) {
    const org = await this.service.login(input);
    const isProduction = process.env.NODE_ENV === 'production';

    context.res.cookie('org_id', generateToken(org.id), {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return {
      id: org.id,
      name: org.name,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  logout(@Context() context: { res: Response }) {
    context.res.clearCookie('org_id');
    return true;
  }
}
