// excel.controller.ts
import { Controller, Get, Res, Header, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExcelCreatorService } from './excel-creator.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Context } from '@nestjs/graphql';

@UseGuards(AuthGuard)
@Controller('excel')
export class ExcelCreatorController {
  constructor(private readonly excelService: ExcelCreatorService) {}

  @Get('download')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=users.xlsx')
  async downloadExcelFile(@Res() res: Response, @Context() context: { req: any }) {
    try {
      // 1. Prepare some mock data (in a real application, this would come from a database)
      const mockData = [
        { id: 1, name: 'John Doe', age: 30 },
        { id: 2, name: 'Jane Smith', age: 25 },
        { id: 3, name: 'Peter Jones', age: 40 },
      ];

      // 2. Use the service to generate the Excel file buffer
      const excelBuffer = await this.excelService.generateExcelFile(mockData)
      console.log(context.req.organisation);

      // 3. Set the response status and headers
      res.status(HttpStatus.OK);
      // res.send(excelBuffer);
      res.send("This is a placeholder for the Excel file content."); 

    } catch (error) {
      // 4. Handle any errors during file generation
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Could not generate the Excel file.');
    }
  }
}