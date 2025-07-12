declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        [key: string]: any;
      };
    }
  }
} 