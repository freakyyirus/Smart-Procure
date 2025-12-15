import { Module } from '@nestjs/common';
import { RfqsService } from './rfqs.service';
import { RfqsController } from './rfqs.controller';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  controllers: [RfqsController],
  providers: [RfqsService],
  exports: [RfqsService],
})
export class RfqsModule {}
