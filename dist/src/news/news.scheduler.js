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
var NewsScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const news_service_1 = require("./news.service");
let NewsScheduler = NewsScheduler_1 = class NewsScheduler {
    constructor(newsService) {
        this.newsService = newsService;
        this.logger = new common_1.Logger(NewsScheduler_1.name);
    }
    async handlePublishDue() {
        const count = await this.newsService.publishDueScheduled();
        if (count > 0) {
            this.logger.log(`Auto-published ${count} scheduled article(s)`);
        }
    }
};
exports.NewsScheduler = NewsScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsScheduler.prototype, "handlePublishDue", null);
exports.NewsScheduler = NewsScheduler = NewsScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsScheduler);
//# sourceMappingURL=news.scheduler.js.map