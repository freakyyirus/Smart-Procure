import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  // Using Resend for production
  async sendRfqToVendor(rfq: any, vendor: any) {
    this.logger.log(`📧 Sending RFQ ${rfq.rfqNumber} to vendor ${vendor.name}`);

    // TODO: Integrate with Resend
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: process.env.FROM_EMAIL,
    //   to: vendor.email,
    //   subject: `RFQ: ${rfq.title}`,
    //   html: this.generateRfqEmail(rfq, vendor),
    // });

    return { success: true, vendor: vendor.name };
  }

  async sendPoToVendor(po: any) {
    this.logger.log(`📧 Sending PO ${po.poNumber} to vendor ${po.vendor.name}`);

    // TODO: Integrate with Resend
    return { success: true };
  }

  async sendMandateToVendor(mandate: any) {
    this.logger.log(`📧 Sending Mandate ${mandate.mandateNumber} to vendor ${mandate.vendor.name}`);

    // TODO: Integrate with Resend
    return { success: true };
  }

  async notifyCompanyMandateSigned(mandate: any) {
    this.logger.log(`📧 Notifying company about mandate signature: ${mandate.mandateNumber}`);
    return { success: true };
  }

  async notifyVendorMandateActive(mandate: any) {
    this.logger.log(`📧 Notifying vendor about active mandate: ${mandate.mandateNumber}`);
    return { success: true };
  }

  async notifyMandateCompleted(mandate: any) {
    this.logger.log(`📧 Payment completed for mandate: ${mandate.mandateNumber}`);
    return { success: true };
  }

  private generateRfqEmail(rfq: any, vendor: any): string {
    return `
      <h2>Request for Quotation</h2>
      <p>Dear ${vendor.contactPerson || vendor.name},</p>
      <p>We would like to request a quotation for the following items:</p>
      <h3>${rfq.title}</h3>
      <p>${rfq.description || ''}</p>
      <p>Please submit your quote by ${rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : 'soon'}.</p>
      <p>Best regards,<br/>${rfq.company.name}</p>
    `;
  }
}
