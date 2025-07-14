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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const apiDocs = __importStar(require("../api-docs.json"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const employer_routes_1 = __importDefault(require("./routes/employer.routes"));
const instructor_routes_1 = __importDefault(require("./routes/instructor.routes"));
const help_routes_1 = __importDefault(require("./routes/help.routes"));
const assessment_routes_1 = __importDefault(require("./routes/assessment.routes"));
const certificate_routes_1 = __importDefault(require("./routes/certificate.routes"));
const scholarship_routes_1 = __importDefault(require("./routes/scholarship.routes"));
const peerLearning_routes_1 = __importDefault(require("./routes/peerLearning.routes"));
const quiz_session_routes_1 = __importDefault(require("./routes/quiz-session.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const auth_1 = require("./middleware/auth");
const couchdb_1 = require("./config/couchdb");
const redis_1 = require("./config/redis");
const i18n_1 = require("./config/i18n");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.set('trust proxy', 1);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env['CORS_ORIGIN'] || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
const progressLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env['PROGRESS_RATE_LIMIT_WINDOW_MS'] || '60000'),
    max: parseInt(process.env['PROGRESS_RATE_LIMIT_MAX_REQUESTS'] || '50'),
    message: 'Too many progress requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use((0, helmet_1.default)());
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5000"
];
const isProduction = process.env.NODE_ENV === 'production';
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (!isProduction) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.logger.info(message.trim()) } }));
app.use('/api/courses/*/progress', progressLimiter);
app.use(generalLimiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, i18n_1.getI18nMiddleware)());
app.use('/uploads', express_1.default.static('uploads'));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'RefuLearn API is running - Database connection updated',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/test-server', (_req, res) => {
    console.log('🔍 SERVER TEST ROUTE HIT');
    res.json({ message: 'Server test route working', timestamp: new Date().toISOString() });
});
app.get('/api/submission-file/:submissionId', async (req, res) => {
    console.log('📁 DIRECT FILE ROUTE HIT - Submission ID:', req.params.submissionId);
    try {
        const fs = require('fs');
        const path = require('path');
        const testFilePath = 'uploads/general/Innocent-Manzi-Privacy In Digital Age-1752407904305-62023978.pdf';
        if (fs.existsSync(testFilePath)) {
            console.log('📁 File found, serving:', testFilePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="submission.pdf"');
            const fileStream = fs.createReadStream(testFilePath);
            fileStream.pipe(res);
        }
        else {
            console.log('❌ File not found:', testFilePath);
            res.status(404).json({ error: 'File not found' });
        }
    }
    catch (error) {
        console.error('❌ Error serving file:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', auth_1.authenticateToken, user_routes_1.default);
console.log('🔧 Mounting course routes at /api/courses');
app.use('/api/courses', course_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/admin', auth_1.authenticateToken, admin_routes_1.default);
app.use('/api/employer', auth_1.authenticateToken, employer_routes_1.default);
app.use('/api/instructor', auth_1.authenticateToken, instructor_routes_1.default);
app.use('/api/help', help_routes_1.default);
app.use('/api/assessments', assessment_routes_1.default);
app.use('/api/certificates', certificate_routes_1.default);
app.use('/api/scholarships', scholarship_routes_1.default);
app.use('/api/peer-learning', peerLearning_routes_1.default);
app.use('/api/quiz-sessions', auth_1.authenticateToken, quiz_session_routes_1.default);
app.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(apiDocs));
io.on('connection', (socket) => {
    logger_1.logger.info(`User connected: ${socket.id}`);
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        logger_1.logger.info(`User ${socket.id} joined room: ${roomId}`);
    });
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        logger_1.logger.info(`User ${socket.id} left room: ${roomId}`);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`User disconnected: ${socket.id}`);
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
app.set('io', io);
const PORT = process.env['PORT'] || 5000;
const startServer = async () => {
    try {
        await (0, i18n_1.setupI18n)();
        try {
            await (0, couchdb_1.connectCouchDB)();
            logger_1.logger.info('CouchDB connected successfully');
        }
        catch (couchError) {
            logger_1.logger.error('CouchDB connection failed, but server will continue:', couchError);
            logger_1.logger.warn('Some features may not work properly without CouchDB');
        }
        try {
            await (0, redis_1.connectRedis)();
            logger_1.logger.info('Redis connected successfully');
        }
        catch (redisError) {
            logger_1.logger.error('Redis connection failed, but server will continue:', redisError);
            logger_1.logger.warn('Session management may not work properly without Redis');
        }
        server.listen(PORT, () => {
            console.log(`\n🚀 API running at: http://localhost:${PORT}\n`);
            logger_1.logger.info(`Server started on port ${PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', (err) => {
    logger_1.logger.error('Uncaught Exception:', err);
    process.exit(1);
});
startServer();
//# sourceMappingURL=index.js.map