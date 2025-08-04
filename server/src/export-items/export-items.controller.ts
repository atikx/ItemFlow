// excel.controller.ts
import {
  Controller,
  Get,
  Res,
  Header,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportItemsService } from './export-items.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Context } from '@nestjs/graphql';

@UseGuards(AuthGuard)
@Controller('export-items')
export class ExportItemsController {
  constructor(private readonly excelService: ExportItemsService) {}

  @Get('download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=items-list.xlsx')
  async downloadExcelFile(
    @Res() res: Response,
    @Context() context: { req: any },
  ) {
    try {
     

      // 2. Use the service to generate the Excel file buffer
      const excelBuffer = await this.excelService.generateExcelFile(
        context.req.organisation.id,
      );

      // 3. Set the response status and headers
      res.status(HttpStatus.OK);
      res.send(excelBuffer);
    } catch (error) {
      // 4. Handle any errors during file generation
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Could not generate the Excel file.');
    }
  }
}
