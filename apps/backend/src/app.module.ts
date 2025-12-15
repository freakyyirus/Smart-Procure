import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { ItemsModule } from './items/items.module';
import { RfqsModule } from './rfqs/rfqs.module';
import { QuotesModule } from './quotes/quotes.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { MandatesModule } from './mandates/mandates.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Security: Rate limiting to prevent brute force and DoS attacks
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 10,  // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50,  // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 200, // 200 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    VendorsModule,
    ItemsModule,
    RfqsModule,
    QuotesModule,
    PurchaseOrdersModule,
    MandatesModule,
    IntegrationsModule,
    AuditLogModule,
    NotificationsModule,
    AIModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
