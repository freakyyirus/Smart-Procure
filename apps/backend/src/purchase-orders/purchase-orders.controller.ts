import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  UpdateDeliveryStatusDto,
  UpdatePOStatusDto,
} from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new PO' })
  create(@CurrentUser() user: any, @Body() createPoDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(user.companyId, user.userId, createPoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all POs' })
  findAll(@CurrentUser() user: any) {
    return this.purchaseOrdersService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PO by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.findOne(id, user.companyId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update PO status' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDto: UpdatePOStatusDto
  ) {
    return this.purchaseOrdersService.updateStatus(
      id,
      user.companyId,
      user.userId,
      updateDto.status
    );
  }

  @Post(':id/generate-pdf')
  @ApiOperation({ summary: 'Generate PO PDF' })
  generatePdf(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.generatePdf(id, user.companyId);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send PO to vendor' })
  sendPo(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.sendPo(id, user.companyId, user.userId);
  }

  // ==================== DELIVERY ENDPOINTS ====================

  @Post(':id/deliveries')
  @ApiOperation({ summary: 'Create delivery for PO' })
  createDelivery(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.createDelivery(id, user.companyId, user.userId);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get all deliveries for PO' })
  getDeliveries(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.getDeliveries(id, user.companyId);
  }

  @Patch(':poId/deliveries/:deliveryId')
  @ApiOperation({ summary: 'Update delivery status' })
  updateDeliveryStatus(
    @Param('poId') poId: string,
    @Param('deliveryId') deliveryId: string,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateDeliveryStatusDto
  ) {
    return this.purchaseOrdersService.updateDeliveryStatus(
      deliveryId,
      user.companyId,
      user.userId,
      updateDto
    );
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get delivery timeline / audit logs for PO' })
  getDeliveryTimeline(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.getDeliveryTimeline(id, user.companyId);
  }

  @Get(':id/audit-logs')
  @ApiOperation({ summary: 'Get audit logs for PO' })
  getAuditLogs(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.getPoAuditLogs(id, user.companyId);
  }
}
