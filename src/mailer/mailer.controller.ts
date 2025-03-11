import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('twistedfate/mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  async sendEmail(@Body() body: { email: string; type: string; data: any }) {
    return this.mailerService.sendMail(body.email, body.type, body.data);
  }
}