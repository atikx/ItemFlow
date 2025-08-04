import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Workbook } from 'exceljs';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { items } from 'src/drizzle/schema/items.schema';
import { DrizzleDB } from 'src/drizzle/types/drizzle';

@Injectable()
export class ExportItemsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async generateExcelFile(org_id: string): Promise<Buffer> {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      // Define columns
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'quantityTotal', key: 'quantityTotal', width: 30 },
        { header: 'quantityAvailable', key: 'quantityAvailable', width: 30 },
      ];


      const itemsList = await this.db.select({
        name: items.name,
        quantityTotal: items.quantityTotal,
        quantityAvailable: items.quantityAvailable,
      }).from(items).where(eq(items.organisationId, org_id));

      // Add rows with data
      worksheet.addRows(itemsList);

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as any as Buffer;
    } catch (error) {
      console.error('Error generating Excel file:', error);
      throw new Error('Could not generate Excel file');
    }
  }
}
