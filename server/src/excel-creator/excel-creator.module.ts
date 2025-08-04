// excel.module.ts
import { Module } from '@nestjs/common';
import { ExcelCreatorController } from './excel-creator.controller'; 
import { ExcelCreatorService } from './excel-creator.service'; 
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule], 
  controllers: [ExcelCreatorController],
  providers: [ExcelCreatorService],
})
export class ExcelCreatorModule {}