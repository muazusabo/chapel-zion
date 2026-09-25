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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME ?? 'SAZU FCS Admin';
    if (!email || !password) {
        throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env before seeding.');
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        const passwordHash = await argon2.hash(password);
        await prisma.user.create({
            data: {
                fullName: name,
                email,
                passwordHash,
                role: client_1.Role.SUPER_ADMIN,
            },
        });
        console.log(`Created initial SUPER_ADMIN: ${email}`);
        console.log('IMPORTANT: log in and change this password immediately.');
    }
    else {
        console.log('Super admin already exists, skipping.');
    }
    const homepage = await prisma.homepageContent.findFirst();
    if (!homepage) {
        await prisma.homepageContent.create({
            data: {
                heroTitle: 'SAZU FCS',
                heroSubtitle: 'Fellowship of Christian Students',
                heroDescription: 'Growing in Faith. Building Community. Serving with Purpose.',
                heroImageUrl: '[HERO IMAGE]',
                welcomeMessage: 'Welcome to SAZU FCS — a community of students growing together in Christ. [Edit this welcome message from the admin dashboard.]',
                missionPreview: '[Edit mission statement from the admin dashboard]',
                visionPreview: '[Edit vision statement from the admin dashboard]',
            },
        });
        console.log('Seeded default homepage content.');
    }
    const about = await prisma.aboutContent.findFirst();
    if (!about) {
        await prisma.aboutContent.create({
            data: {
                whoWeAre: '[Edit "Who We Are" content from the admin dashboard]',
                mission: '[Edit mission from the admin dashboard]',
                vision: '[Edit vision from the admin dashboard]',
                values: '[Edit values from the admin dashboard]',
                whatWeDo: 'Bible Study, Prayer, Worship, Evangelism, Discipleship, Fellowship, Outreach, Student support.',
            },
        });
        console.log('Seeded default about content.');
    }
    const scripture = await prisma.scripture.findFirst();
    if (!scripture) {
        await prisma.scripture.create({
            data: {
                verseText: '"For where two or three gather in my name, there am I with them."',
                reference: 'Matthew 18:20',
                isActive: true,
            },
        });
        console.log('Seeded default scripture.');
    }
    const chapelAccount = await prisma.chapelAccount.findFirst();
    if (!chapelAccount) {
        await prisma.chapelAccount.create({
            data: {
                bankName: '[CHAPEL BANK NAME]',
                accountName: '[CHAPEL ACCOUNT NAME]',
                accountNumber: '[ACCOUNT NUMBER]',
            },
        });
        console.log('Seeded placeholder chapel account — update with real details.');
    }
    const settings = await prisma.fellowshipSettings.findFirst();
    if (!settings) {
        await prisma.fellowshipSettings.create({
            data: {
                fcsName: 'SAZU FCS',
                chapelName: '[CHAPEL NAME]',
                contactEmail: '[CONTACT EMAIL]',
                phoneNumber: '[PHONE NUMBER]',
                address: '[FELLOWSHIP ADDRESS]',
            },
        });
        console.log('Seeded placeholder fellowship settings — update with real details.');
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map