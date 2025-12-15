import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  // Using Meta Cloud API for production
  async sendRfqNotification(rfq: any, vendor: any) {
    this.logger.log(`💬 Sending WhatsApp RFQ notification to ${vendor.phone}`);

    // TODO: Integrate with Meta Cloud API
    // const message = `Hi ${vendor.name}, you have received a new RFQ: ${rfq.title}. Please check your email for details.`;
    // await this.sendWhatsappMessage(vendor.phone, message);

    return { success: true };
  }

  async sendPoNotification(po: any) {
    this.logger.log(`💬 Sending WhatsApp PO notification to ${po.vendor.phone}`);

    // TODO: Integrate with Meta Cloud API
    return { success: true };
  }

  async sendMandateNotification(mandate: any) {
    this.logger.log(`💬 Sending WhatsApp Mandate notification to ${mandate.vendor.phone}`);

    // TODO: Integrate with Meta Cloud API when credentials are available
    // Template: Hi ${mandate.vendor.name}, a payment mandate has been created for PO ${mandate.po.poNumber}. Amount: ₹${mandate.totalAmount}. Please sign digitally.
    return { success: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async notifyMandateActive(_mandate: any) {
    this.logger.log(`💬 Notifying vendor about active mandate via WhatsApp`);
    return { success: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async notifyMandateCompleted(_mandate: any) {
    this.logger.log(`💬 Notifying both parties about completed payment via WhatsApp`);
    return { success: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async sendWhatsappMessage(_phone: string, _message: string) {
    // Implementation using Meta Cloud API
    // const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: phone,
    //     text: { body: message },
    //   }),
    // });
  }
}
