import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { MembersService } from './members.service';
import { CreateMemberInput } from './dto/create-member.input';
import { UpdateMemberInput } from './dto/update-member.input';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver('Member')
@UseGuards(AuthGuard)
export class MembersResolver {
  constructor(private readonly membersService: MembersService) {}
  @Mutation('createMember')
  create(
    @Args('createMemberInput') createMemberInput: CreateMemberInput,
    @Context() context: { req: any },
  ) {
    return this.membersService.create(
      context.req.organisation.id,
      createMemberInput,
    );
  }

  @Query('members')
  findAll(@Context() context: { req: any }) {
    return this.membersService.findAll(context.req.organisation.id);
  }

  @Query('member')
  findOne(@Args('id') id: number) {
    return this.membersService.findOne(id);
  }

  @Mutation('updateMember')
  update(
    @Args('updateMemberInput') updateMemberInput: UpdateMemberInput,
    @Context() context: { req: any },
  ) {
    return this.membersService.update(
      context.req.organisation.id,
      updateMemberInput,
    );
  }

  @Mutation('removeMember')
  remove(@Args('id') id: string, @Context() context: { req: any }) {
    return this.membersService.remove(context.req.organisation.id, id);
  }
}
