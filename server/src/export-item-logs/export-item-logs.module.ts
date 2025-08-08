import { Module } from '@nestjs/common';
import { ExportItemLogsController } from './export-item-logs.controller';
import { ExportItemLogsService } from './export-item-logs.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [ExportItemLogsController],
  providers: [ExportItemLogsService]
})
export class ExportItemLogsModule {}
