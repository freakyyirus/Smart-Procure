import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MandatesService } from './mandates.service';
import { CreateMandateDto, SignMandateDto, ExecuteMandateDto } from './dto/mandate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Mandates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mandates')
export class MandatesController {
  constructor(private readonly mandatesService: MandatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment mandate' })
  create(@CurrentUser() user: any, @Body() createMandateDto: CreateMandateDto) {
    return this.mandatesService.create(user.companyId, createMandateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all mandates' })
  findAll(@CurrentUser() user: any) {
    return this.mandatesService.findAll(user.companyId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming mandates (next 30 days)' })
  getUpcoming(@CurrentUser() user: any) {
    return this.mandatesService.getUpcomingMandates(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mandate by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mandatesService.findOne(id, user.companyId);
  }

  @Patch(':id/sign/vendor')
  @ApiOperation({ summary: 'Vendor signs mandate' })
  signByVendor(@Param('id') id: string, @Body() signMandateDto: SignMandateDto) {
    return this.mandatesService.signByVendor(id, signMandateDto);
  }

  @Patch(':id/sign/company')
  @ApiOperation({ summary: 'Company approves mandate' })
  signByCompany(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() signMandateDto: SignMandateDto
  ) {
    return this.mandatesService.signByCompany(id, user.companyId, signMandateDto);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute mandate payment (auto-deduct)' })
  execute(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() executeMandateDto?: ExecuteMandateDto
  ) {
    return this.mandatesService.executeMandate(id, user.companyId, user.id, executeMandateDto);
  }
}
