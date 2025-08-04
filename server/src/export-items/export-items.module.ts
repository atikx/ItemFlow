import { Module } from '@nestjs/common';
import { ExportItemsController } from './export-items.controller';
import { ExportItemsService } from './export-items.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [ExportItemsController],
  providers: [ExportItemsService]
})
export class ExportItemsModule {}
