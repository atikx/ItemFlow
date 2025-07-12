import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsResolver } from './organisations.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [OrganisationsResolver, OrganisationsService],
  imports: [DrizzleModule],
})
export class OrganisationsModule {}
