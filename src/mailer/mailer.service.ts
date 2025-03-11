import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private templatesDir = path.join(__dirname, '../../templates');

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
      },
    });
  }

  private getTemplateFile(templateName: string): { subject: string; content: string } {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException(`Email template '${templateName}' not found.`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');

    const subjectMatch = templateContent.match(/^<!-- subject: (.+) -->/);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Important Message';

    return { subject, content: templateContent };
  }

  async sendMail(to: string, templateName: string, templateData: any) {
    const { subject, content } = this.getTemplateFile(templateName);
    const compiledTemplate = handlebars.compile(content);
    const html = compiledTemplate(templateData);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
