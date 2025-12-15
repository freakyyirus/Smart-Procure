import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new item' })
  create(@CurrentUser() user: any, @Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(user.companyId, createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  findAll(@CurrentUser() user: any) {
    return this.itemsService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.itemsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(id, user.companyId, updateItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.itemsService.remove(id, user.companyId);
  }
}
