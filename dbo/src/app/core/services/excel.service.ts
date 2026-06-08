import { Injectable } from '@angular/core';
import { AccountInfoDto } from '../../views/main/features/accounts-payments/models/accounts-payments.model';
import * as XLSX from 'xlsx';


@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  exportToExcel(formattedData: any, n = 'excel') {
    const [workbook, name] = this.prepareExcelFile(formattedData, n)

    this.writeFile(workbook, name);
  }

  prepareExcelFile(formattedData: any, name = 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map((obj: any) => String((obj as any)[name] || '').length)
      );

      return { width: maxLength + 2 };
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name);

    return [workbook, name];
  }

  writeFile(workbook: any, name: any) {
    XLSX.writeFile(workbook, `${name}.xlsx`);
  }

  exportToExcelInBrowser(formattedData: any, n = 'excel') {
    const [workbook, name] = this.prepareExcelFile(formattedData, n)

    // Write workbook to binary format
    const workbookBinary = XLSX.write(workbook as XLSX.WorkBook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob object from the binary data
    const blob = new Blob([workbookBinary], { type: 'application/octet-stream' });

    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element to trigger download
    window.open(url, '_blank');

    // Revoke the URL after some time to free up memory
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

}
