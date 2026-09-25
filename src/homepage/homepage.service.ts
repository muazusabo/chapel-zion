import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateAboutDto,
  UpdateFellowshipSettingsDto,
  UpdateHomepageDto,
  UpdateScriptureDto,
} from './dto/homepage.dto';

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

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  // ---- Homepage hero/welcome content ----
  async getHomepage() {
    const existing = await this.prisma.homepageContent.findFirst();
    return existing ?? this.prisma.homepageContent.create({ data: {} });
  }

  async updateHomepage(dto: UpdateHomepageDto) {
    const existing = await this.getHomepage();
    return this.prisma.homepageContent.update({ where: { id: existing.id }, data: dto });
  }

  // ---- About page content ----
  async getAbout() {
    const existing = await this.prisma.aboutContent.findFirst();
    return existing ?? this.prisma.aboutContent.create({ data: {} });
  }

  async updateAbout(dto: UpdateAboutDto) {
    const existing = await this.getAbout();
    return this.prisma.aboutContent.update({ where: { id: existing.id }, data: dto });
  }

  // ---- Daily scripture rotation ----
  async getScripture() {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const updatedToday = await this.prisma.scripture.findFirst({
      where: { isActive: true, updatedAt: { gte: startOfDay } },
      orderBy: { updatedAt: 'desc' },
    });

    if (updatedToday) return updatedToday;

    const dayNumber = Math.floor(Date.now() / 86_400_000);
    return DAILY_SCRIPTURES[dayNumber % DAILY_SCRIPTURES.length];
  }

  async updateScripture(dto: UpdateScriptureDto) {
    // Deactivate any previous scripture, then create a fresh active one —
    // keeps a lightweight history without needing a separate table.
    await this.prisma.scripture.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    return this.prisma.scripture.create({ data: { ...dto, isActive: true } });
  }

  // ---- Fellowship-wide settings (contact info, socials) ----
  async getSettings() {
    const existing = await this.prisma.fellowshipSettings.findFirst();
    return existing ?? this.prisma.fellowshipSettings.create({ data: {} });
  }

  async updateSettings(dto: UpdateFellowshipSettingsDto) {
    const existing = await this.getSettings();
    return this.prisma.fellowshipSettings.update({ where: { id: existing.id }, data: dto });
  }

  // ---- Admin dashboard aggregate stats ----
  async getAdminDashboardStats() {
    const [
      totalMembers,
      totalDonationsAgg,
      totalOfferingsAgg,
      successfulPayments,
      pendingPayments,
      pendingReceiptRequests,
      upcomingEvents,
      unreadMessages,
    ] = await Promise.all([
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
}
