import { Module } from '@nestjs/common';
import { ItemLogsService } from './item-logs.service';
import { ItemLogsResolver } from './item-logs.resolver';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [ItemLogsResolver, ItemLogsService],
  imports: [DrizzleModule],
})
export class ItemLogsModule {}
