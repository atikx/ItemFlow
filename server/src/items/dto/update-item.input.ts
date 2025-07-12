import { CreateItemInput } from './create-item.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateItemInput extends PartialType(CreateItemInput) {
  id: string;
  name?: string;
  quantityTotal?: number;
}
