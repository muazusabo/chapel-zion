"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const config = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use('/uploads', express_1.default.static((0, path_1.join)(process.cwd(), 'uploads')));
    app.enableCors({
        origin: config.get('CLIENT_URL') ?? 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.setGlobalPrefix('', { exclude: [] });
    const prismaService = app.get(prisma_service_1.PrismaService);
    await prismaService.enableShutdownHooks(app);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('SAZU FCS API')
        .setDescription('REST API for the SAZU FCS (Fellowship of Christian Students) platform: ' +
        'auth, content management, giving/payments, and receipts.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = config.get('PORT') ?? 4000;
    await app.listen(port);
    console.log(`SAZU FCS API running on http://localhost:${port}`);
    console.log(`API docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map