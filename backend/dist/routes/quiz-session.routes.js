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
const ensureAuth = (req) => {
    if (!req.user?._id) {
        throw new Error('User authentication required');
    }
    return {
        userId: req.user._id.toString(),
        user: req.user
    };
};
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
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { quizId, courseId, moduleId, duration } = req.body;
        const { userId } = ensureAuth(req);
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
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { userId } = ensureAuth(req);
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
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { answers } = req.body;
        const { userId } = ensureAuth(req);
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
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { userId: instructorId } = ensureAuth(req);
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
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { answers } = req.body;
        const { userId } = ensureAuth(req);
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
        try {
            console.log('🎯 Updating course progress after quiz completion...');
            const courseDoc = await database.get(session.courseId);
            if (courseDoc && courseDoc.modules) {
                const moduleDoc = await database.get(session.moduleId);
                if (moduleDoc && moduleDoc.quizzes) {
                    const quizIndex = moduleDoc.quizzes.findIndex((quiz) => quiz._id === session.quizId);
                    if (quizIndex !== -1) {
                        let itemIndex = 0;
                        if (moduleDoc.description)
                            itemIndex++;
                        if (moduleDoc.content)
                            itemIndex++;
                        if (moduleDoc.videoUrl)
                            itemIndex++;
                        if (moduleDoc.resources)
                            itemIndex += moduleDoc.resources.length;
                        if (moduleDoc.assessments)
                            itemIndex += moduleDoc.assessments.length;
                        itemIndex += quizIndex;
                        const completionKey = `quiz-${itemIndex}`;
                        console.log('🎯 Quiz completion details:', {
                            quizId: session.quizId,
                            moduleId: session.moduleId,
                            courseId: session.courseId,
                            quizIndex,
                            itemIndex,
                            completionKey
                        });
                        if (!courseDoc.studentProgress) {
                            courseDoc.studentProgress = [];
                        }
                        let moduleProgress = courseDoc.studentProgress.find((p) => p.student === userId && p.moduleId === session.moduleId);
                        if (!moduleProgress) {
                            moduleProgress = {
                                student: userId,
                                moduleId: session.moduleId,
                                completed: false,
                                score: 0,
                                completedAt: null,
                                completedItems: []
                            };
                            courseDoc.studentProgress.push(moduleProgress);
                        }
                        if (!moduleProgress.completedItems) {
                            moduleProgress.completedItems = [];
                        }
                        if (!moduleProgress.completedItems.includes(completionKey)) {
                            moduleProgress.completedItems.push(completionKey);
                            console.log('✅ Added quiz completion to progress:', completionKey);
                            courseDoc.updatedAt = new Date();
                            const latestCourse = await database.get(courseDoc._id);
                            courseDoc._rev = latestCourse._rev;
                            await database.insert(courseDoc);
                            console.log('✅ Course progress updated successfully after quiz completion');
                        }
                        else {
                            console.log('ℹ️ Quiz already marked as completed in progress');
                        }
                    }
                }
            }
        }
        catch (progressError) {
            console.error('⚠️ Failed to update course progress after quiz completion:', progressError.message);
        }
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
router.get('/:quizId/completion-status', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user'), [
    (0, express_validator_1.param)('quizId').notEmpty().withMessage('Quiz ID is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { userId } = ensureAuth(req);
        console.log('🔍 Enhanced quiz completion check:', { userId, quizId });
        const database = await ensureDb();
        let completedSession = null;
        try {
            const completedSessions = await database.find({
                selector: {
                    type: 'quiz_session',
                    userId,
                    quizId,
                    status: 'completed'
                },
                sort: [{ submittedAt: 'desc' }],
                limit: 1
            });
            if (completedSessions.docs.length > 0) {
                completedSession = completedSessions.docs[0];
                console.log('✅ Found completed quiz session:', completedSession._id);
            }
        }
        catch (sessionErr) {
            console.log('⚠️ Quiz session query failed:', sessionErr);
        }
        if (!completedSession) {
            try {
                const allSessions = await database.find({
                    selector: {
                        type: 'quiz_session',
                        userId,
                        quizId
                    },
                    sort: [{ createdAt: 'desc' }],
                    limit: 5
                });
                console.log('🔍 All sessions for this user+quiz:', allSessions.docs.map((s) => ({
                    id: s._id,
                    status: s.status,
                    score: s.score,
                    submittedAt: s.submittedAt
                })));
                const sessionWithScore = allSessions.docs.find((s) => s.score !== undefined && s.score !== null);
                if (sessionWithScore) {
                    completedSession = sessionWithScore;
                    console.log('✅ Found session with score:', sessionWithScore._id, 'Score:', sessionWithScore.score);
                }
            }
            catch (allSessionsErr) {
                console.log('⚠️ All sessions query failed:', allSessionsErr);
            }
        }
        if (!completedSession) {
            try {
                console.log('🔍 Trying comprehensive search...');
                const allQuizSessions = await database.list({ include_docs: true });
                const userQuizSessions = allQuizSessions.rows
                    .map((row) => row.doc)
                    .filter((doc) => doc &&
                    doc.type === 'quiz_session' &&
                    doc.userId === userId &&
                    doc.quizId === quizId &&
                    (doc.status === 'completed' || doc.score !== undefined));
                console.log('🔍 Comprehensive search found:', userQuizSessions.length, 'sessions');
                if (userQuizSessions.length > 0) {
                    completedSession = userQuizSessions.sort((a, b) => new Date(b.submittedAt || b.updatedAt || b.createdAt).getTime() -
                        new Date(a.submittedAt || a.updatedAt || a.createdAt).getTime())[0];
                    console.log('✅ Found session via comprehensive search:', completedSession._id);
                }
            }
            catch (comprehensiveErr) {
                console.log('⚠️ Comprehensive search failed:', comprehensiveErr);
            }
        }
        if (completedSession) {
            return res.json({
                success: true,
                data: {
                    isCompleted: true,
                    completedAt: completedSession.submittedAt || completedSession.updatedAt,
                    score: completedSession.score,
                    timeSpent: completedSession.timeSpent,
                    sessionId: completedSession._id,
                    method: 'enhanced_search'
                }
            });
        }
        console.log('ℹ️ No completed quiz session found for user');
        res.json({
            success: true,
            data: {
                isCompleted: false,
                completedAt: null,
                score: null,
                timeSpent: null,
                sessionId: null
            }
        });
    }
    catch (error) {
        console.error('Error checking quiz completion status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check quiz completion status'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=quiz-session.routes.js.map