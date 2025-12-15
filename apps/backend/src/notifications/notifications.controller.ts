import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { MarkNotificationsReadDto } from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Request() req: any, @Query('limit') limit?: string) {
    return this.notificationsService.findAll(
      req.user.companyId,
      req.user.sub,
      limit ? parseInt(limit) : 50
    );
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnread(@Request() req: any) {
    return this.notificationsService.getUnread(req.user.companyId, req.user.sub);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.companyId, req.user.sub);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read/bulk')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  async markMultipleAsRead(@Body() dto: MarkNotificationsReadDto) {
    return this.notificationsService.markMultipleAsRead(dto.ids);
  }

  @Patch('read/all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.companyId, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
