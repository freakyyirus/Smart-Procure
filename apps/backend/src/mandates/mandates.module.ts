import { Module } from '@nestjs/common';
import { MandatesService } from './mandates.service';
import { MandatesController } from './mandates.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [IntegrationsModule, AuditLogModule],
  controllers: [MandatesController],
  providers: [MandatesService],
  exports: [MandatesService],
})
export class MandatesModule {}
