import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import PouchDB from 'pouchdb';
import { getRedisClient } from '../config/redis';

// Import the Request type with user property
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    type?: string;
    isActive?: boolean;
    [key: string]: any;
  };
}

// Initialize PouchDB
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

interface UserDoc {
  _id: string;
  _rev?: string;
  type: 'user';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  otp?: string;
  otpExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  profilePic?: string;
  bio?: string;
  phone_number?: string;
  dob?: string;
  language_preference?: string;
  gender?: string;
  education_level?: string;
  camp?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  [key: string]: any;
}

// In-memory blacklist for access tokens
export const blacklistedAccessTokens: Set<string> = new Set();

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    // Check if token is blacklisted in Redis
    try {
      const redisClient = getRedisClient();
      const isBlacklisted = await redisClient.get(`bl_${token}`);
      if (isBlacklisted) {
        res.status(401).json({
          success: false,
          message: 'Access token has been revoked'
        });
        return;
      }
    } catch (redisError) {
      // Redis connection issue - continue without blacklist check
      console.warn('Redis connection issue during token validation:', redisError);
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as any;
    
    // Find user ID from different possible fields in JWT payload
    const userId = decoded.userId || decoded._id || decoded.id || decoded.sub;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload - no user ID found' 
      });
      return;
    }
    
    // Find user and check if still active
    try {
      const user = await db.get(userId) as UserDoc;
      
      if (!user || user.type !== 'user' || user.isActive === false) {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid or inactive user' 
        });
        return;
      }

      req.user = user;
      next();
    } catch (dbError) {
      // Database connection issue - create minimal user from token for fallback
      console.warn('Database connection issue during user lookup:', dbError);
      
      // Create minimal user object from token data
      req.user = {
        _id: userId,
        id: userId,
        userId: userId,
        role: decoded.role || 'user', // Default to 'user' instead of 'refugee'
        email: decoded.email || '',
        firstName: decoded.firstName || 'User',
        lastName: decoded.lastName || '',
        type: 'user',
        isActive: true
      };
      
      next();
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if ((req.user as any)?.role === 'admin') {
      // Admin can access all endpoints
      return next();
    }

    if (!roles.includes((req.user as any)?.role || '')) {
      res.status(403).json({ 
        success: false, 
        message: `Access denied: This endpoint is only accessible to [${roles.join(', ')}]. Your role: ${(req.user as any)?.role || 'undefined'}` 
      });
      return;
    }

    next();
  };
};

export const authorizeSelfOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
    return;
  }

  const userId = req.params['userId'] || req.params['id'];
  
  if ((req.user as any)?.role === 'admin' || (req.user as any)?._id?.toString() === userId) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Insufficient permissions' 
    });
  }
};

export const requireEmailVerification = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
    return;
  }

  if (!(req.user as any)?.isEmailVerified) {
    res.status(403).json({ 
      success: false, 
      message: 'Email verification required' 
    });
    return;
  }

  next();
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as any;
      const userId = decoded.userId || decoded._id || decoded.id || decoded.sub;
      
      if (userId) {
        const user = await db.get(userId) as UserDoc;
        
        if (user && user.type === 'user' && user.isActive) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
}; 