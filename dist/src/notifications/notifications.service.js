"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.transporter = null;
        const host = this.config.get('SMTP_HOST');
        const user = this.config.get('SMTP_USER');
        const password = this.config.get('SMTP_PASSWORD');
        if (host && user && password) {
            this.transporter = nodemailer.createTransport({
                host,
                port: Number(this.config.get('SMTP_PORT') ?? 587),
                secure: Number(this.config.get('SMTP_PORT')) === 465,
                auth: { user, pass: password },
            });
        }
        else {
            this.logger.warn('SMTP credentials not configured — emails will be logged instead of sent. ' +
                'Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env for real delivery.');
        }
    }
    async send(to, subject, html) {
        const from = this.config.get('SMTP_FROM') ?? '"SAZU FCS" <no-reply@sazufcs.org>';
        if (!this.transporter) {
            this.logger.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}\n${html}`);
            return;
        }
        try {
            await this.transporter.sendMail({ from, to, subject, html });
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${to}: ${err.message}`);
        }
    }
    sendWelcomeEmail(to, fullName) {
        return this.send(to, 'Welcome to SAZU FCS', `<p>Dear ${fullName},</p>
       <p>Welcome to SAZU FCS — Fellowship of Christian Students. We're glad to have you with us.</p>
       <p>Grace and peace,<br/>SAZU FCS</p>`);
    }
    sendPasswordResetEmail(to, resetUrl) {
        return this.send(to, 'Reset your SAZU FCS password', `<p>We received a request to reset your password.</p>
       <p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p>
       <p>If you did not request this, you can safely ignore this email.</p>`);
    }
    sendPaymentConfirmationEmail(to, fullName, amount, givingType, receiptNumber, receiptId) {
        const receiptUrl = `${this.config.get('CLIENT_URL') ?? 'http://localhost:3000'}/receipts/${receiptId}`;
        return this.send(to, 'Payment Confirmation — SAZU FCS', `<p>Dear ${fullName},</p>
       <p>Thank you for your ${givingType.toLowerCase()} of <strong>${amount}</strong>.</p>
      <p>Your receipt number is <strong>${receiptNumber}</strong>.</p>
      <p><a href="${receiptUrl}">View and download your receipt</a>.</p>
       <p>God bless you,<br/>SAZU FCS</p>`);
    }
    notifyAdminNewPayment(to, fullName, amount) {
        return this.send(to, 'New Payment Received — SAZU FCS', `<p>${fullName} just completed a payment of <strong>${amount}</strong>.</p>`);
    }
    notifyAdminNewContactMessage(to, name, subject) {
        return this.send(to, 'New Contact Message — SAZU FCS', `<p>New message from ${name}: <strong>${subject}</strong>. Check the admin dashboard for details.</p>`);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map