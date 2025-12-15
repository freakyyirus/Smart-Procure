import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { WhatsappService } from './whatsapp.service';
import { PdfService } from './pdf.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [EmailService, WhatsappService, PdfService, StorageService],
  exports: [EmailService, WhatsappService, PdfService, StorageService],
})
export class IntegrationsModule {}
