import { Injectable } from '@angular/core';
import mustache from 'mustache';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewComponent } from '../../shared/components/pdf-view/pdf-view.component';
import * as html2pdf from 'html2pdf.js';


export interface Options {
  templateCode?: string;
  templatePath: string;
  templateData: any;
  templateName: string;
  templateLogo?: any;
  templateLang: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}
  async prepareTemplate(options: Options): Promise<any> {

    const templateOptions = {
      logo: null,
      logoAlt: null,
      stamp: null,
      data: options.templateData,
      name: options.templateName,
    };

    return new Promise((resolve, reject) => {
      this.http.get('./assets/templates/' + options.templatePath, { responseType: 'text' })
        .subscribe({
          next: (data: string) => {
            resolve(mustache.render(data, templateOptions));
          },
          error: (err) => {
            reject(new Error(err.message));
          }
        });
    });
  }

  printTemplate(data: any) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px'; // Hide the iframe out of the viewport
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(data);
      iframeDoc.close(); // Close to ensure content is loaded

      // Wait for the iframe to load before triggering print
      iframe.contentWindow?.addEventListener('load', () => {
        iframe.contentWindow?.focus(); // Ensure iframe is focused for printing
        iframe.contentWindow?.print(); // Open the print dialog
        document.body.removeChild(iframe); // Remove the iframe after printing
      });
    } else {
      console.error("Unable to write content to iframe.");
    }
  }

  async generatePdfFromTemplate(options: Options, orientation = 'portrait'): Promise<Blob> {
    const templateData = await this.prepareTemplate(options);

    const element = document.createElement('div');
    element.innerHTML = templateData;

    const opt = {
      margin:       10,
      filename:     `${options.templateName}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation }
    };

    return new Promise((resolve) => {
      html2pdf()
        .from(element)
        .set(opt)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            // Get page size dynamically
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height;

            // Adjust image position based on orientation
            const imgWidth = 40; // Adjust as needed
            const imgHeight = 20; // Adjust as needed
            const imgX = pageWidth - imgWidth - 10; // 10mm padding from right
            const imgY = pageHeight - imgHeight - 10; // 10mm padding from bottom

            // pdf.addImage('assets/images/stamp.png', 'PNG', imgX, imgY, imgWidth, imgHeight);
          }
        })
        .outputPdf('blob')
        .then(resolve);
    });
  }


  async getBase64Image(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  async showPdfInDialog(options: Options, orientation = 'portrait') {
    const pdfBlob = await this.generatePdfFromTemplate(options, orientation);
    const pdfUrl = URL.createObjectURL(pdfBlob);

    this.dialog.open(PdfViewComponent, {
      width: '90%',
      height: '100%',
      data: pdfUrl
    });
  }

  async prepareAndPrint(options: Options) {
    const template = this.prepareTemplate(options);
    this.printTemplate(template);
  }
}
