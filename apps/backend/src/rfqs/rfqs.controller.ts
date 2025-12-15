import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RfqsService } from './rfqs.service';
import { CreateRfqDto, SendRfqDto } from './dto/rfq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('RFQs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rfqs')
export class RfqsController {
  constructor(private readonly rfqsService: RfqsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new RFQ' })
  create(@CurrentUser() user: any, @Body() createRfqDto: CreateRfqDto) {
    return this.rfqsService.create(user.companyId, user.userId, createRfqDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all RFQs' })
  findAll(@CurrentUser() user: any) {
    return this.rfqsService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RFQ by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rfqsService.findOne(id, user.companyId);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send RFQ to vendors' })
  sendRfq(@Param('id') id: string, @CurrentUser() user: any, @Body() sendRfqDto: SendRfqDto) {
    return this.rfqsService.sendRfq(id, user.companyId, sendRfqDto);
  }
}
