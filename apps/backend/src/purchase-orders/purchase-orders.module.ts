import { Module } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [IntegrationsModule, AuditLogModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
