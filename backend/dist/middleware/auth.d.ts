import { Request, Response, NextFunction } from 'express';
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
export declare const blacklistedAccessTokens: Set<string>;
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authorizeSelfOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireEmailVerification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=auth.d.ts.map