import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const password = this.config.get<string>('SMTP_PASSWORD');

    if (host && user && password) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
        secure: Number(this.config.get<string>('SMTP_PORT')) === 465,
        auth: { user, pass: password },
      });
    } else {
      this.logger.warn(
        'SMTP credentials not configured — emails will be logged instead of sent. ' +
          'Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env for real delivery.',
      );
    }
  }

  private async send(to: string, subject: string, html: string) {
    const from =
      this.config.get<string>('SMTP_FROM') ?? '"SAZU FCS" <no-reply@sazufcs.org>';

    if (!this.transporter) {
      this.logger.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}\n${html}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from, to, subject, html });
    } catch (err) {
      // Email failures must never crash the request that triggered them
      // (e.g. a successful payment). Log and move on.
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }

  sendWelcomeEmail(to: string, fullName: string) {
    return this.send(
      to,
      'Welcome to SAZU FCS',
      `<p>Dear ${fullName},</p>
       <p>Welcome to SAZU FCS — Fellowship of Christian Students. We're glad to have you with us.</p>
       <p>Grace and peace,<br/>SAZU FCS</p>`,
    );
  }

  sendPasswordResetEmail(to: string, resetUrl: string) {
    return this.send(
      to,
      'Reset your SAZU FCS password',
      `<p>We received a request to reset your password.</p>
       <p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p>
       <p>If you did not request this, you can safely ignore this email.</p>`,
    );
  }

  sendPaymentConfirmationEmail(
    to: string,
    fullName: string,
    amount: string,
    givingType: string,
    receiptNumber: string,
    receiptId: string,
  ) {
    const receiptUrl = `${this.config.get<string>('CLIENT_URL') ?? 'http://localhost:3000'}/receipts/${receiptId}`;
    return this.send(
      to,
      'Payment Confirmation — SAZU FCS',
      `<p>Dear ${fullName},</p>
       <p>Thank you for your ${givingType.toLowerCase()} of <strong>${amount}</strong>.</p>
      <p>Your receipt number is <strong>${receiptNumber}</strong>.</p>
      <p><a href="${receiptUrl}">View and download your receipt</a>.</p>
       <p>God bless you,<br/>SAZU FCS</p>`,
    );
  }

  notifyAdminNewPayment(to: string, fullName: string, amount: string) {
    return this.send(
      to,
      'New Payment Received — SAZU FCS',
      `<p>${fullName} just completed a payment of <strong>${amount}</strong>.</p>`,
    );
  }

  notifyAdminNewContactMessage(to: string, name: string, subject: string) {
    return this.send(
      to,
      'New Contact Message — SAZU FCS',
      `<p>New message from ${name}: <strong>${subject}</strong>. Check the admin dashboard for details.</p>`,
    );
  }
}
