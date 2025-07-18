declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        type?: string;
        isActive?: boolean;
        isEmailVerified?: boolean;
        [key: string]: any;
      };
    }
  }
}

export {}; 