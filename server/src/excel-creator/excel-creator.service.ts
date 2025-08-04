// excel.service.ts
import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Buffer } from 'buffer'; // Keep this for clarity, though it might not be strictly necessary with this fix

@Injectable()
export class ExcelCreatorService {
  async generateExcelFile(data: any[]): Promise<Buffer> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Age', key: 'age', width: 10 },
    ];

    // Add rows with data
    worksheet.addRows(data);

    // Generate buffer and bypass the type error
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any as Buffer;
  }
}