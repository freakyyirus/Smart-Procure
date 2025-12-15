import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new vendor' })
  create(@CurrentUser() user: any, @Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(user.companyId, createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  findAll(@CurrentUser() user: any) {
    return this.vendorsService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vendorsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vendor' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateVendorDto: UpdateVendorDto
  ) {
    return this.vendorsService.update(id, user.companyId, updateVendorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vendor' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vendorsService.remove(id, user.companyId);
  }
}
