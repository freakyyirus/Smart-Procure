import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, ApproveQuoteDto } from './dto/quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a quote' })
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  findAll(@Query('rfqId') rfqId?: string) {
    return this.quotesService.findAll(rfqId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a quote' })
  approve(@Param('id') id: string, @Body() approveQuoteDto: ApproveQuoteDto) {
    return this.quotesService.approve(id, approveQuoteDto);
  }
}
