import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CsvService {
  generateCsv(data: any[], columnTitles: Record<string, string>): string {
    // Add header row with Russian titles
    const headers = Object.keys(columnTitles).map((key) => columnTitles[key]);
    const rows = data.map((row) =>
      Object.keys(columnTitles).map((key) => (row[key] !== null ? row[key] : ''))
    );

    // Convert to CSV format
    const csvContent =
      [headers, ...rows].map((e) => e.join(',')).join('\n');
    return csvContent;
  }

  downloadCsv(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
  }
}
