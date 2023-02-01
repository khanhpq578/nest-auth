import { Controller, Get, OnModuleInit, Body } from '@nestjs/common';
import { DefaultService } from './default.service';
// import { Public } from 'src/modules/auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'apps/api/src/modules/auth/public.decorator';
@Controller()
@Public()
@ApiTags('Actions private')
export class DefaultController {
  constructor(private readonly appService: DefaultService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
  @Get('/updateUserTest')
  async updateUserTest() {
    return this.appService.updateUser(10097444, 'create');
  }
  @Get('/updateAllUser')
  async updateAllUser() {
    return this.appService.updateAllUser();
  }
  @Get('/randomUser')
  async randomUser() {
    return this.appService.randomUser();
  }
  @Get('/putMappingUser')
  async putMappingUser() {
    return this.appService.putMappingUser();
  }

  @Get('/notifyAdmin')
  async notifyAdmin(@Body() body) {
    return this.appService.notifyAdmin(body);
  }
}
