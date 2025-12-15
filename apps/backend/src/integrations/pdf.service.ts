import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePoPdf(po: any): Promise<Buffer> {
    this.logger.log(`📄 Generating PDF for PO ${po.poNumber}`);

    // TODO: Implement with Puppeteer
    // const puppeteer = require('puppeteer');
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    //
    // const html = this.generatePoHtml(po);
    // await page.setContent(html);
    // const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    // await browser.close();
    //
    // return pdfBuffer;

    // Mock PDF buffer for now
    return Buffer.from('PDF_CONTENT_HERE');
  }

  async generateMandatePdf(mandate: any): Promise<Buffer> {
    this.logger.log(`📄 Generating PDF for Mandate ${mandate.mandateNumber}`);

    // TODO: Implement with Puppeteer
    return Buffer.from('MANDATE_PDF_CONTENT_HERE');
  }

  private generatePoHtml(po: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f4f4f4; }
          .total { text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PURCHASE ORDER</h1>
          <p>PO Number: ${po.poNumber}</p>
          <p>Date: ${new Date(po.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div class="company-info">
          <h3>From:</h3>
          <p>${po.company.name}</p>
          <p>${po.company.address || ''}</p>
          <p>GSTIN: ${po.company.gstin || 'N/A'}</p>
        </div>
        
        <div class="company-info">
          <h3>To:</h3>
          <p>${po.vendor.name}</p>
          <p>${po.vendor.address || ''}</p>
          <p>GSTIN: ${po.vendor.gstin || 'N/A'}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>GST %</th>
              <th>GST Amount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${po.lineItems
              .map(
                (item: any) => `
              <tr>
                <td>${item.item.name}</td>
                <td>${item.quantity} ${item.item.unit}</td>
                <td>₹${item.unitPrice}</td>
                <td>${item.gst}%</td>
                <td>₹${item.gstAmount}</td>
                <td>₹${item.totalAmount}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        <div class="total" style="margin-top: 20px;">
          <p>Subtotal: ₹${po.totalAmount}</p>
          <p>GST: ₹${po.gstAmount}</p>
          <p><strong>Grand Total: ₹${po.grandTotal}</strong></p>
        </div>
        
        ${po.terms ? `<p><strong>Terms:</strong> ${po.terms}</p>` : ''}
        ${po.notes ? `<p><strong>Notes:</strong> ${po.notes}</p>` : ''}
      </body>
      </html>
    `;
  }
}
