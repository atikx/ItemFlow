import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { Workbook } from 'exceljs';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { itemLogs } from 'src/drizzle/schema/itemLogs.schema';
import { items } from 'src/drizzle/schema/items.schema';
import { DrizzleDB } from 'src/drizzle/types/drizzle';

@Injectable()
export class ExportItemLogsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async generateExcelFile(org_id: string, eventId: string): Promise<Buffer> {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      // Define columns
      worksheet.columns = [
        { header: 'Item Name', key: 'item', width: 30 },
        { header: 'Issued To', key: 'department', width: 30 },
        { header: 'Phone Number', key: 'phone', width: 30 },
        { header: 'Issued By', key: 'issuedBy', width: 30 },
        { header: 'Quantity Issued', key: 'quantityIssued', width: 20 },
        { header: 'Issued At', key: 'createdAt', width: 30 },
        {
          header: 'Expected Return Date',
          key: 'expectedReturnDate',
          width: 30,
        },
        { header: 'Returned At', key: 'returnedAt', width: 30 },
        { header: 'Returned By', key: 'returnedBy', width: 30 },
      ];

      const logsList = await this.db.query.itemLogs.findMany({
        where: and(
          eq(itemLogs.eventId, eventId),
          eq(itemLogs.organisationId, org_id),
        ),
        with: {
          item: {
            columns: {
              name: true,
            },
          },
          issuedBy: {
            columns: {
              name: true,
            },
          },
          returnedBy: {
            columns: {
              name: true,
            },
          },
          department: {
            columns: {
              name: true,
            },
          },
        },
      });

      const flatLogsList = logsList.map((log) => ({
        ...log,
        item: log.item.name,
        issuedBy: log.issuedBy.name,
        department: log.department.name,
        returnedBy: log.returnedBy?.name,
      }));

      // Add rows with data
      worksheet.addRows(flatLogsList);

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as any as Buffer;
    } catch (error) {
      console.error('Error generating Excel file:', error);
      throw new Error('Could not generate Excel file');
    }
  }
}
