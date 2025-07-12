"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadAny = exports.uploadMultiple = exports.uploadAudio = exports.uploadVideo = exports.uploadResource = exports.uploadCertificate = exports.uploadCoverLetter = exports.uploadResume = exports.uploadCourseImage = exports.uploadProfilePic = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = process.env['UPLOAD_PATH'] || 'uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = uploadDir;
        if (file.fieldname === 'profilePic') {
            uploadPath = path_1.default.join(uploadDir, 'profiles');
        }
        else if (file.fieldname === 'courseImage' || file.fieldname === 'course_profile_picture') {
            uploadPath = path_1.default.join(uploadDir, 'courses');
        }
        else if (file.fieldname === 'resume' || file.fieldname === 'coverLetter' ||
            file.fieldname === 'cvDocument' || file.fieldname === 'degreeDocument' ||
            file.fieldname === 'financialApproval' || file.fieldname === 'additionalDocuments') {
            uploadPath = path_1.default.join(uploadDir, 'documents');
        }
        else if (file.fieldname === 'certificate') {
            uploadPath = path_1.default.join(uploadDir, 'certificates');
        }
        else if (file.fieldname === 'resource') {
            uploadPath = path_1.default.join(uploadDir, 'resources');
        }
        else {
            uploadPath = path_1.default.join(uploadDir, 'general');
        }
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedDocumentTypes = /pdf|doc|docx|txt|rtf/;
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm/;
    const allowedAudioTypes = /mp3|wav|ogg|aac/;
    const extname = path_1.default.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    if (file.fieldname === 'profilePic' || file.fieldname === 'courseImage' || file.fieldname === 'course_profile_picture') {
        if (allowedImageTypes.test(extname) && mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for profile pictures and course images'));
        }
    }
    else if (file.fieldname === 'resume' || file.fieldname === 'coverLetter' || file.fieldname === 'certificate' ||
        file.fieldname === 'cvDocument' || file.fieldname === 'degreeDocument' ||
        file.fieldname === 'financialApproval' || file.fieldname === 'additionalDocuments') {
        if (allowedDocumentTypes.test(extname) || mimetype === 'application/pdf' || mimetype.includes('document')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed for documents'));
        }
    }
    else if (file.fieldname === 'video') {
        if (allowedVideoTypes.test(extname) && mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only video files are allowed'));
        }
    }
    else if (file.fieldname === 'audio') {
        if (allowedAudioTypes.test(extname) && mimetype.startsWith('audio/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only audio files are allowed'));
        }
    }
    else {
        if (allowedImageTypes.test(extname) || allowedDocumentTypes.test(extname) ||
            allowedVideoTypes.test(extname) || allowedAudioTypes.test(extname)) {
            cb(null, true);
        }
        else {
            cb(new Error('File type not allowed'));
        }
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'),
        files: 10
    }
});
exports.uploadProfilePic = upload.single('profilePic');
exports.uploadCourseImage = upload.single('courseImage');
exports.uploadResume = upload.single('resume');
exports.uploadCoverLetter = upload.single('coverLetter');
exports.uploadCertificate = upload.single('certificate');
exports.uploadResource = upload.single('resource');
exports.uploadVideo = upload.single('video');
exports.uploadAudio = upload.single('audio');
exports.uploadMultiple = upload.array('files', 10);
exports.uploadAny = upload.any();
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field'
            });
        }
    }
    if (error.message) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
exports.default = upload;
//# sourceMappingURL=upload.js.map