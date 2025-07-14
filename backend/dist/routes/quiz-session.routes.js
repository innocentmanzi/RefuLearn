"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const couchdb_1 = require("../config/couchdb");
const router = express_1.default.Router();
let couchConnection = null;
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing CouchDB connection for quiz session routes...');
        couchConnection = await (0, couchdb_1.connectCouchDB)();
        console.log('✅ Quiz session routes database connection successful!');
        return true;
    }
    catch (error) {
        console.error('❌ Quiz session routes database connection failed:', error.message);
        return false;
    }
};
initializeDatabase();
const ensureDb = async () => {
    if (!couchConnection) {
        console.log('⚠️ Database not available, reinitializing...');
        const connectionSuccess = await initializeDatabase();
        if (!connectionSuccess || !couchConnection) {
            throw new Error('Database connection failed');
        }
    }
    return couchConnection.getDatabase();
};
router.post('/start', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user'), [
    (0, express_validator_1.body)('quizId').notEmpty().withMessage('Quiz ID is required'),
    (0, express_validator_1.body)('courseId').notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('moduleId').notEmpty().withMessage('Module ID is required'),
    (0, express_validator_1.body)('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { quizId, courseId, moduleId, duration } = req.body;
        const userId = req.user._id.toString();
        console.log('🚀 Starting new quiz session:', { userId, quizId, duration });
        const database = await ensureDb();
        const existingSessions = await database.find({
            selector: {
                type: 'quiz_session',
                userId,
                quizId,
                status: 'active'
            }
        });
        if (existingSessions.docs.length > 0) {
            const existingSession = existingSessions.docs[0];
            const now = new Date();
            const endTime = new Date(existingSession.endTime);
            if (now > endTime) {
                existingSession.status = 'expired';
                existingSession.isExpired = true;
                existingSession.updatedAt = now;
                await database.insert(existingSession);
                console.log('⏰ Previous session expired, creating new one');
            }
            else {
                const timeRemaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);
                console.log('✅ Returning existing active session with', timeRemaining, 'seconds remaining');
                return res.json({
                    success: true,
                    data: {
                        sessionId: existingSession._id,
                        startTime: existingSession.startTime,
                        endTime: existingSession.endTime,
                        timeRemaining,
                        status: existingSession.status,
                        answers: existingSession.answers || {}
                    }
                });
            }
        }
        const now = new Date();
        const durationMinutes = parseInt(duration);
        const endTime = new Date(now.getTime() + (durationMinutes * 60 * 1000));
        const sessionDoc = {
            _id: `quiz_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'quiz_session',
            userId,
            quizId,
            courseId,
            moduleId,
            startTime: now,
            durationMinutes,
            endTime,
            status: 'active',
            answers: {},
            timeSpent: 0,
            isExpired: false,
            createdAt: now,
            updatedAt: now
        };
        const result = await database.insert(sessionDoc);
        console.log('✅ Quiz session created:', result.id);
        const timeRemaining = durationMinutes * 60;
        res.status(201).json({
            success: true,
            message: 'Quiz session started successfully',
            data: {
                sessionId: result.id,
                startTime: now,
                endTime,
                timeRemaining,
                status: 'active',
                answers: {}
            }
        });
    }
    catch (error) {
        console.error('Error starting quiz session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start quiz session'
        });
    }
}));
router.get('/:quizId/status', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user'), [
    (0, express_validator_1.param)('quizId').notEmpty().withMessage('Quiz ID is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user._id.toString();
        console.log('📊 Getting quiz session status:', { userId, quizId });
        const database = await ensureDb();
        const sessions = await database.find({
            selector: {
                type: 'quiz_session',
                userId,
                quizId,
                status: 'active'
            },
            sort: [{ createdAt: 'desc' }],
            limit: 1
        });
        if (sessions.docs.length === 0) {
            return res.json({
                success: true,
                data: {
                    hasActiveSession: false,
                    sessionId: null,
                    timeRemaining: null,
                    status: null
                }
            });
        }
        const session = sessions.docs[0];
        const now = new Date();
        const endTime = new Date(session.endTime);
        if (now > endTime) {
            session.status = 'expired';
            session.isExpired = true;
            session.updatedAt = now;
            await database.insert(session);
            return res.json({
                success: true,
                data: {
                    hasActiveSession: false,
                    sessionId: session._id,
                    timeRemaining: 0,
                    status: 'expired'
                }
            });
        }
        const timeRemaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);
        res.json({
            success: true,
            data: {
                hasActiveSession: true,
                sessionId: session._id,
                startTime: session.startTime,
                endTime: session.endTime,
                timeRemaining,
                status: session.status,
                answers: session.answers || {}
            }
        });
    }
    catch (error) {
        console.error('Error getting quiz session status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quiz session status'
        });
    }
}));
router.put('/:sessionId/answers', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user'), [
    (0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required'),
    (0, express_validator_1.body)('answers').isObject().withMessage('Answers must be an object')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { answers } = req.body;
        const userId = req.user._id.toString();
        console.log('💾 Updating quiz session answers:', { sessionId, userId });
        const database = await ensureDb();
        const session = await database.get(sessionId);
        if (session.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this quiz session'
            });
        }
        if (session.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Quiz session is not active'
            });
        }
        const now = new Date();
        const endTime = new Date(session.endTime);
        if (now > endTime) {
            session.status = 'expired';
            session.isExpired = true;
            session.updatedAt = now;
            await database.insert(session);
            return res.status(400).json({
                success: false,
                message: 'Quiz session has expired'
            });
        }
        const timeSpent = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
        session.answers = { ...session.answers, ...answers };
        session.timeSpent = timeSpent;
        session.updatedAt = now;
        await database.insert(session);
        res.json({
            success: true,
            message: 'Quiz session updated successfully',
            data: {
                timeSpent,
                timeRemaining: Math.floor((endTime.getTime() - now.getTime()) / 1000)
            }
        });
    }
    catch (error) {
        console.error('Error updating quiz session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quiz session'
        });
    }
}));
router.get('/quiz/:quizId/submissions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.param)('quizId').notEmpty().withMessage('Quiz ID is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { quizId } = req.params;
        const instructorId = req.user._id.toString();
        console.log('📊 Getting quiz submissions for instructor:', { instructorId, quizId });
        const database = await ensureDb();
        const quiz = await database.get(quizId);
        if (quiz.instructorId !== instructorId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view submissions for this quiz'
            });
        }
        const sessions = await database.find({
            selector: {
                type: 'quiz_session',
                quizId,
                status: { $in: ['completed', 'expired'] }
            },
            sort: [{ submittedAt: 'desc' }]
        });
        const submissions = await Promise.all(sessions.docs.map(async (session) => {
            try {
                const user = await database.get(session.userId);
                return {
                    sessionId: session._id,
                    student: {
                        id: user._id,
                        firstName: user.firstName || 'Unknown',
                        lastName: user.lastName || 'Student',
                        email: user.email || 'No email'
                    },
                    score: session.score || 0,
                    timeSpent: session.timeSpent || 0,
                    timeSpentMinutes: Math.round((session.timeSpent || 0) / 60 * 100) / 100,
                    submittedAt: session.submittedAt || session.updatedAt,
                    status: session.status,
                    answers: session.answers || {},
                    startTime: session.startTime,
                    endTime: session.endTime,
                    isExpired: session.isExpired || false
                };
            }
            catch (error) {
                console.error('Error getting user details for submission:', error);
                return {
                    sessionId: session._id,
                    student: {
                        id: session.userId,
                        firstName: 'Unknown',
                        lastName: 'Student',
                        email: 'Unknown'
                    },
                    score: session.score || 0,
                    timeSpent: session.timeSpent || 0,
                    timeSpentMinutes: Math.round((session.timeSpent || 0) / 60 * 100) / 100,
                    submittedAt: session.submittedAt || session.updatedAt,
                    status: session.status,
                    answers: session.answers || {},
                    startTime: session.startTime,
                    endTime: session.endTime,
                    isExpired: session.isExpired || false
                };
            }
        }));
        res.json({
            success: true,
            data: {
                quizTitle: quiz.title,
                totalSubmissions: submissions.length,
                submissions
            }
        });
    }
    catch (error) {
        console.error('Error getting quiz submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quiz submissions'
        });
    }
}));
router.post('/:sessionId/submit', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user'), [
    (0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required'),
    (0, express_validator_1.body)('answers').isObject().withMessage('Answers must be an object')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { answers } = req.body;
        const userId = req.user._id.toString();
        console.log('📤 Submitting quiz session:', { sessionId, userId });
        const database = await ensureDb();
        const session = await database.get(sessionId);
        if (session.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to submit this quiz session'
            });
        }
        if (session.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Quiz has already been submitted'
            });
        }
        const now = new Date();
        const endTime = new Date(session.endTime);
        const gracePeriod = 10 * 1000;
        if (now.getTime() > endTime.getTime() + gracePeriod) {
            session.status = 'expired';
            session.isExpired = true;
            session.updatedAt = now;
            await database.insert(session);
            return res.status(400).json({
                success: false,
                message: 'Quiz session has expired and cannot be submitted'
            });
        }
        const timeSpent = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
        const quiz = await database.get(session.quizId);
        let correctAnswers = 0;
        if (quiz && quiz.questions) {
            quiz.questions.forEach((question, index) => {
                const userAnswer = answers[index];
                const correctAnswer = question.correctAnswer;
                if (question.type === 'multiple-choice' || question.type === 'multiple_choice') {
                    if (userAnswer === correctAnswer) {
                        correctAnswers++;
                    }
                }
                else if (question.type === 'true-false' || question.type === 'true_false') {
                    const normalizedUserAnswer = userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1';
                    const normalizedCorrectAnswer = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1';
                    if (normalizedUserAnswer === normalizedCorrectAnswer) {
                        correctAnswers++;
                    }
                }
                else if (question.type === 'short-answer' || question.type === 'short_answer') {
                    if (userAnswer && userAnswer.toString().trim().length > 0) {
                        if (correctAnswer && typeof correctAnswer === 'string') {
                            const userAnswerLower = userAnswer.toString().toLowerCase().trim();
                            const correctAnswerLower = correctAnswer.toLowerCase().trim();
                            if (userAnswerLower === correctAnswerLower || userAnswerLower.includes(correctAnswerLower)) {
                                correctAnswers++;
                            }
                        }
                        else {
                            correctAnswers++;
                        }
                    }
                }
            });
        }
        const score = quiz && quiz.questions ? Math.round((correctAnswers / quiz.questions.length) * 100) : 0;
        session.answers = { ...session.answers, ...answers };
        session.timeSpent = timeSpent;
        session.status = 'completed';
        session.score = score;
        session.submittedAt = now;
        session.updatedAt = now;
        await database.insert(session);
        console.log('✅ Quiz session submitted successfully');
        res.json({
            success: true,
            message: 'Quiz submitted successfully',
            data: {
                sessionId: session._id,
                score,
                timeSpent,
                submittedAt: now,
                answers: session.answers
            }
        });
    }
    catch (error) {
        console.error('Error submitting quiz session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit quiz'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=quiz-session.routes.js.map