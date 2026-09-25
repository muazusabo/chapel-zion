"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DAILY_SCRIPTURES = [
    { verseText: '"For where two or three gather in my name, there am I with them."', reference: 'Matthew 18:20' },
    { verseText: '"I can do all this through him who gives me strength."', reference: 'Philippians 4:13' },
    { verseText: '"The Lord is my shepherd, I lack nothing."', reference: 'Psalm 23:1' },
    { verseText: '"Trust in the Lord with all your heart and lean not on your own understanding."', reference: 'Proverbs 3:5' },
    { verseText: '"Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."', reference: 'Joshua 1:9' },
    { verseText: '"Your word is a lamp for my feet, a light on my path."', reference: 'Psalm 119:105' },
    { verseText: '"And we know that in all things God works for the good of those who love him."', reference: 'Romans 8:28' },
    { verseText: '"Let all that you do be done in love."', reference: '1 Corinthians 16:14' },
    { verseText: '"The steadfast love of the Lord never ceases; his mercies never come to an end."', reference: 'Lamentations 3:22' },
    { verseText: '"Do everything without grumbling or arguing."', reference: 'Philippians 2:14' },
    { verseText: '"Cast all your anxiety on him because he cares for you."', reference: '1 Peter 5:7' },
    { verseText: '"This is the day the Lord has made; let us rejoice and be glad in it."', reference: 'Psalm 118:24' },
    { verseText: '"Let us not become weary in doing good, for at the proper time we will reap a harvest."', reference: 'Galatians 6:9' },
    { verseText: '"Above all, love each other deeply, because love covers over a multitude of sins."', reference: '1 Peter 4:8' },
];
let HomepageService = class HomepageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHomepage() {
        const existing = await this.prisma.homepageContent.findFirst();
        return existing ?? this.prisma.homepageContent.create({ data: {} });
    }
    async updateHomepage(dto) {
        const existing = await this.getHomepage();
        return this.prisma.homepageContent.update({ where: { id: existing.id }, data: dto });
    }
    async getAbout() {
        const existing = await this.prisma.aboutContent.findFirst();
        return existing ?? this.prisma.aboutContent.create({ data: {} });
    }
    async updateAbout(dto) {
        const existing = await this.getAbout();
        return this.prisma.aboutContent.update({ where: { id: existing.id }, data: dto });
    }
    async getScripture() {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const updatedToday = await this.prisma.scripture.findFirst({
            where: { isActive: true, updatedAt: { gte: startOfDay } },
            orderBy: { updatedAt: 'desc' },
        });
        if (updatedToday)
            return updatedToday;
        const dayNumber = Math.floor(Date.now() / 86_400_000);
        return DAILY_SCRIPTURES[dayNumber % DAILY_SCRIPTURES.length];
    }
    async updateScripture(dto) {
        await this.prisma.scripture.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
        return this.prisma.scripture.create({ data: { ...dto, isActive: true } });
    }
    async getSettings() {
        const existing = await this.prisma.fellowshipSettings.findFirst();
        return existing ?? this.prisma.fellowshipSettings.create({ data: {} });
    }
    async updateSettings(dto) {
        const existing = await this.getSettings();
        return this.prisma.fellowshipSettings.update({ where: { id: existing.id }, data: dto });
    }
    async getAdminDashboardStats() {
        const [totalMembers, totalDonationsAgg, totalOfferingsAgg, successfulPayments, pendingPayments, pendingReceiptRequests, upcomingEvents, unreadMessages,] = await Promise.all([
            this.prisma.user.count({ where: { role: 'USER' } }),
            this.prisma.donation.aggregate({ _sum: { amount: true } }),
            this.prisma.offering.aggregate({ _sum: { amount: true } }),
            this.prisma.transaction.count({ where: { status: 'SUCCESSFUL' } }),
            this.prisma.transaction.count({ where: { status: 'PENDING' } }),
            this.prisma.receiptRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.event.count({ where: { date: { gte: new Date() } } }),
            this.prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
        ]);
        return {
            totalMembers,
            totalUsers: totalMembers,
            totalDonations: totalDonationsAgg._sum.amount ?? 0,
            totalOfferings: totalOfferingsAgg._sum.amount ?? 0,
            successfulPayments,
            pendingPayments,
            pendingReceiptRequests,
            upcomingEvents,
            unreadMessages,
        };
    }
};
exports.HomepageService = HomepageService;
exports.HomepageService = HomepageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HomepageService);
//# sourceMappingURL=homepage.service.js.map