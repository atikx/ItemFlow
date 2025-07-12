import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsResolver } from './items.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [ItemsResolver, ItemsService],
  imports: [DrizzleModule],
})
export class ItemsModule {}
