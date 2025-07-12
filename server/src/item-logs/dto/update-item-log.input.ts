import { CreateItemLogInput } from './create-item-log.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateItemLogInput extends PartialType(CreateItemLogInput) {
  id: string;
  itemId: string;
  quantityIssued?: number;
  expectedReturnDate?: string;
  departmentId?: string;
}
