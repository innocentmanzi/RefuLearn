"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireEmailVerification = exports.authorizeSelfOrAdmin = exports.authorizeRoles = exports.authenticateToken = exports.blacklistedAccessTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pouchdb_1 = __importDefault(require("pouchdb"));
const redis_1 = require("../config/redis");
const db = new pouchdb_1.default('http://Manzi:Clarisse101@localhost:5984/refulearn');
exports.blacklistedAccessTokens = new Set();
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        try {
            const redisClient = (0, redis_1.getRedisClient)();
            const isBlacklisted = await redisClient.get(`bl_${token}`);
            if (isBlacklisted) {
                res.status(401).json({
                    success: false,
                    message: 'Access token has been revoked'
                });
                return;
            }
        }
        catch (redisError) {
            console.warn('Redis connection issue during token validation:', redisError);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET'] || 'fallback-secret');
        const userId = decoded.userId || decoded._id || decoded.id || decoded.sub;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Invalid token payload - no user ID found'
            });
            return;
        }
        try {
            const user = await db.get(userId);
            if (!user || user.type !== 'user' || user.isActive === false) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid or inactive user'
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (dbError) {
            console.warn('Database connection issue during user lookup:', dbError);
            req.user = {
                _id: userId,
                id: userId,
                userId: userId,
                role: decoded.role || 'user',
                email: decoded.email || '',
                firstName: decoded.firstName || 'User',
                lastName: decoded.lastName || '',
                type: 'user',
                isActive: true
            };
            next();
        }
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        else {
            console.error('Authentication error:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication error'
            });
        }
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (req.user?.role === 'admin') {
            return next();
        }
        if (!roles.includes(req.user?.role || '')) {
            res.status(403).json({
                success: false,
                message: `Access denied: This endpoint is only accessible to [${roles.join(', ')}]. Your role: ${req.user?.role || 'undefined'}`
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const authorizeSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
        return;
    }
    const userId = req.params['userId'] || req.params['id'];
    if (req.user?.role === 'admin' || req.user?._id?.toString() === userId) {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
        });
    }
};
exports.authorizeSelfOrAdmin = authorizeSelfOrAdmin;
const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
        return;
    }
    if (!req.user?.isEmailVerified) {
        res.status(403).json({
            success: false,
            message: 'Email verification required'
        });
        return;
    }
    next();
};
exports.requireEmailVerification = requireEmailVerification;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET'] || 'fallback-secret');
            const userId = decoded.userId || decoded._id || decoded.id || decoded.sub;
            if (userId) {
                const user = await db.get(userId);
                if (user && user.type === 'user' && user.isActive) {
                    req.user = user;
                }
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map