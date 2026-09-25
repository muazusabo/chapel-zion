"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_module_1 = require("./audit/audit.module");
const upload_module_1 = require("./upload/upload.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const announcements_module_1 = require("./announcements/announcements.module");
const news_module_1 = require("./news/news.module");
const events_module_1 = require("./events/events.module");
const executives_module_1 = require("./executives/executives.module");
const gallery_module_1 = require("./gallery/gallery.module");
const payments_module_1 = require("./payments/payments.module");
const donations_module_1 = require("./donations/donations.module");
const offerings_module_1 = require("./offerings/offerings.module");
const receipts_module_1 = require("./receipts/receipts.module");
const chapel_module_1 = require("./chapel/chapel.module");
const homepage_module_1 = require("./homepage/homepage.module");
const contact_module_1 = require("./contact/contact.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            upload_module_1.UploadModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            announcements_module_1.AnnouncementsModule,
            news_module_1.NewsModule,
            events_module_1.EventsModule,
            executives_module_1.ExecutivesModule,
            gallery_module_1.GalleryModule,
            receipts_module_1.ReceiptsModule,
            payments_module_1.PaymentsModule,
            donations_module_1.DonationsModule,
            offerings_module_1.OfferingsModule,
            chapel_module_1.ChapelModule,
            homepage_module_1.HomepageModule,
            contact_module_1.ContactModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map