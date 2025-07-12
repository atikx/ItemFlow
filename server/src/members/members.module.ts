import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersResolver } from './members.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [MembersResolver, MembersService],
  imports: [DrizzleModule],
})
export class MembersModule {}
