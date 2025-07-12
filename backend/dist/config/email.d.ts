export declare const sendMail: (to: string, subject: string, html: string) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare const sendOTPEmail: (to: string, otp: string) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare const sendCourseCompletionEmail: (to: string, userName: string, courseName: string, certificateNumber?: string) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
//# sourceMappingURL=email.d.ts.map