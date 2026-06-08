import { TemplateRef } from '@angular/core';

export interface TableColumn {
  header: string;
  field: string;
  template?: TemplateRef<any>;
  left?: boolean,
  right?: boolean,
  total?: boolean,
  percent?: boolean,
}
