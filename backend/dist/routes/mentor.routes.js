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
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
const db = new pouchdb_1.default('http://Manzi:Clarisse101@localhost:5984/refulearn');
router.get('/', [
    (0, express_validator_1.query)('specialization').optional().trim(),
    (0, express_validator_1.query)('location').optional().trim(),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { specialization, location, search, page = 1, limit = 10 } = req.query;
    const selector = { type: 'mentor', isActive: true };
    if (specialization) {
        selector.specializations = { $in: [specialization] };
    }
    const result = await db.find({ selector });
    let mentors = result.docs;
    if (location) {
        const loc = location.toLowerCase();
        mentors = mentors.filter((mentor) => mentor.location?.toLowerCase().includes(loc));
    }
    if (search) {
        const s = search.toLowerCase();
        mentors = mentors.filter((mentor) => mentor.bio?.toLowerCase().includes(s));
    }
    const total = mentors.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedMentors = mentors.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            mentors: pagedMentors,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalMentors: total
            }
        }
    });
}));
router.get('/:mentorId', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const mentor = await db.get(req.params['mentorId']);
        res.json({
            success: true,
            data: { mentor }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Mentor not found'
        });
    }
}));
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('bio').trim().notEmpty().withMessage('Bio is required'),
    (0, express_validator_1.body)('specializations').isArray().withMessage('Specializations must be an array'),
    (0, express_validator_1.body)('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    (0, express_validator_1.body)('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be positive'),
    (0, express_validator_1.body)('availability').isObject().withMessage('Availability must be an object'),
    (0, express_validator_1.body)('location').trim().notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('languages').optional().isArray(),
    (0, express_validator_1.body)('certifications').optional().isArray()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existingResult = await db.find({
        selector: { type: 'mentor', user: req.user._id.toString() }
    });
    if (existingResult.docs.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Mentor profile already exists'
        });
    }
    const mentorData = {
        ...req.body,
        _id: Date.now().toString(),
        _rev: '',
        user: req.user._id.toString(),
        type: 'mentor',
        isActive: true,
        rating: 0,
        totalSessions: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mentor = await db.put(mentorData);
    res.status(201).json({
        success: true,
        message: 'Mentor profile created successfully',
        data: { mentor }
    });
}));
router.put('/profile', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('bio').optional().trim().notEmpty(),
    (0, express_validator_1.body)('specializations').optional().isArray(),
    (0, express_validator_1.body)('experience').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('hourlyRate').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('availability').optional().isObject(),
    (0, express_validator_1.body)('location').optional().trim().notEmpty(),
    (0, express_validator_1.body)('languages').optional().isArray(),
    (0, express_validator_1.body)('certifications').optional().isArray(),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const updates = req.body;
    const result = await db.find({
        selector: { type: 'mentor', user: req.user._id.toString() }
    });
    const mentor = result.docs[0];
    if (!mentor) {
        return res.status(404).json({
            success: false,
            message: 'Mentor profile not found'
        });
    }
    Object.assign(mentor, updates);
    mentor.updatedAt = new Date();
    const latest = await db.get(mentor._id);
    mentor._rev = latest._rev;
    const updatedMentor = await db.put(mentor);
    res.json({
        success: true,
        message: 'Mentor profile updated successfully',
        data: { mentor: updatedMentor }
    });
}));
router.get('/sessions/mentor', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const selector = { type: 'mentor_session', mentor: req.user._id.toString() };
    if (status) {
        selector.status = status;
    }
    const result = await db.find({ selector });
    const sessions = result.docs;
    const total = sessions.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedSessions = sessions.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            sessions: pagedSessions,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalSessions: total
            }
        }
    });
}));
router.get('/sessions/mentee', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const selector = { type: 'mentor_session', mentee: req.user._id.toString() };
    if (status) {
        selector.status = status;
    }
    const result = await db.find({ selector });
    const sessions = result.docs;
    const total = sessions.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedSessions = sessions.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            sessions: pagedSessions,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalSessions: total
            }
        }
    });
}));
router.post('/:mentorId/sessions', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('scheduledAt').isISO8601().withMessage('Scheduled time is required'),
    (0, express_validator_1.body)('duration').isInt({ min: 30, max: 240 }).withMessage('Duration must be between 30 and 240 minutes'),
    (0, express_validator_1.body)('topic').trim().notEmpty().withMessage('Topic is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('preferredLanguage').optional().trim()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { mentorId } = req.params;
    const { scheduledAt, duration, topic, description, preferredLanguage } = req.body;
    const menteeId = req.user._id.toString();
    const mentor = await db.get(mentorId);
    if (!mentor) {
        return res.status(404).json({
            success: false,
            message: 'Mentor not found'
        });
    }
    if (!mentor.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Mentor is not available for sessions'
        });
    }
    if (mentor.user === menteeId) {
        return res.status(400).json({
            success: false,
            message: 'Cannot request session with yourself'
        });
    }
    const conflictingSession = await db.find({
        selector: {
            type: 'mentor_session',
            mentor: mentorId,
            scheduledAt: {
                $gte: new Date(scheduledAt),
                $lt: new Date(new Date(scheduledAt).getTime() + duration * 60000)
            },
            status: { $in: ['scheduled', 'confirmed'] }
        }
    });
    if (conflictingSession.docs.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Mentor has a conflicting session at this time'
        });
    }
    const sessionData = {
        _id: Date.now().toString(),
        _rev: '',
        type: 'mentor_session',
        mentor: mentorId,
        mentee: menteeId,
        title: topic,
        description: description || '',
        scheduledAt: new Date(scheduledAt),
        duration,
        timezone: 'UTC',
        status: 'scheduled',
        notes: {},
        feedback: {},
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const session = await db.put(sessionData);
    res.status(201).json({
        success: true,
        message: 'Session request sent successfully',
        data: { session }
    });
}));
router.put('/sessions/:sessionId/status', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
    (0, express_validator_1.body)('notes').optional().trim()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const { status, notes } = req.body;
    const session = await db.get(sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            message: 'Session not found'
        });
    }
    if (session.mentor !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this session'
        });
    }
    session.status = status;
    if (notes) {
        if (!session.notes)
            session.notes = {};
        session.notes.mentor = notes;
    }
    const latest = await db.get(session._id);
    session._rev = latest._rev;
    const updatedSession = await db.put(session);
    res.json({
        success: true,
        message: 'Session status updated successfully',
        data: { session: updatedSession }
    });
}));
router.put('/sessions/:sessionId/cancel', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('reason').optional().trim()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const { reason } = req.body;
    const session = await db.get(sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            message: 'Session not found'
        });
    }
    if (session.mentee !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to cancel this session'
        });
    }
    if (session.status !== 'scheduled' && session.status !== 'confirmed') {
        return res.status(400).json({
            success: false,
            message: 'Session cannot be cancelled in its current status'
        });
    }
    session.status = 'cancelled';
    if (reason) {
        if (!session.notes)
            session.notes = {};
        session.notes.mentee = reason;
    }
    const latest = await db.get(session._id);
    session._rev = latest._rev;
    const updatedSession = await db.put(session);
    res.json({
        success: true,
        message: 'Session cancelled successfully',
        data: { session: updatedSession }
    });
}));
router.post('/sessions/:sessionId/rate', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('review').optional().trim().isLength({ max: 500 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const { rating, review } = req.body;
    const session = await db.get(sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            message: 'Session not found'
        });
    }
    if (session.mentee !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to rate this session'
        });
    }
    if (session.status !== 'completed') {
        return res.status(400).json({
            success: false,
            message: 'Can only rate completed sessions'
        });
    }
    if (!session.feedback)
        session.feedback = {};
    if (session.feedback.mentee?.rating) {
        return res.status(400).json({
            success: false,
            message: 'Session has already been rated'
        });
    }
    if (!session.feedback.mentee)
        session.feedback.mentee = {};
    session.feedback.mentee.rating = rating;
    if (review) {
        session.feedback.mentee.comment = review;
    }
    session.feedback.mentee.submittedAt = new Date();
    const latest = await db.get(session._id);
    session._rev = latest._rev;
    const updatedSession = await db.put(session);
    const mentor = await db.get(session.mentor);
    if (mentor) {
        const completedSessions = await db.find({
            selector: {
                type: 'mentor_session',
                mentor: session.mentor,
                status: 'completed'
            }
        });
        const ratedSessions = completedSessions.docs.filter((s) => s.feedback?.mentee?.rating);
        if (ratedSessions.length > 0) {
            const totalRating = ratedSessions.reduce((sum, s) => sum + (s.feedback.mentee.rating || 0), 0);
            mentor.rating = totalRating / ratedSessions.length;
            mentor.totalSessions = ratedSessions.length;
            const mentorLatest = await db.get(mentor._id);
            mentor._rev = mentorLatest._rev;
            await db.put(mentor);
        }
    }
    res.json({
        success: true,
        message: 'Session rated successfully',
        data: { session: updatedSession }
    });
}));
router.get('/mentees', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const sessions = await db.find({
        selector: { type: 'mentor_session', mentor: req.user._id.toString() }
    });
    const menteeIds = [...new Set(sessions.docs.map((session) => session.mentee))];
    const mentees = await Promise.all(menteeIds.map(async (menteeId) => {
        try {
            return await db.get(menteeId);
        }
        catch (err) {
            return null;
        }
    }));
    const validMentees = mentees.filter(mentee => mentee !== null);
    res.json({ success: true, data: { mentees: validMentees } });
}));
router.get('/mentees/:menteeId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { menteeId } = req.params;
    const sessions = await db.find({
        selector: { type: 'mentor_session', mentor: req.user._id.toString(), mentee: menteeId }
    });
    try {
        const mentee = await db.get(menteeId);
        res.json({
            success: true,
            data: {
                mentee,
                sessions: sessions.docs
            }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Mentee not found'
        });
    }
}));
router.patch('/mentees/:menteeId/goals', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('goals').isArray()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { menteeId } = req.params;
    const { goals } = req.body;
    try {
        const mentee = await db.get(menteeId);
        mentee.goals = goals;
        const latest = await db.get(mentee._id);
        mentee._rev = latest._rev;
        const updatedMentee = await db.put(mentee);
        res.json({
            success: true,
            message: 'Goals updated',
            data: { mentee: updatedMentee }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Mentee not found'
        });
    }
}));
router.get('/sessions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    req.url = '/sessions/mentor';
    router.handle(req, res);
}));
router.get('/sessions/:sessionId', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const session = await db.get(req.params.sessionId);
        res.json({ success: true, data: { session } });
    }
    catch (err) {
        res.status(404).json({ success: false, message: 'Session not found' });
    }
}));
router.patch('/sessions/:sessionId', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('scheduledAt').optional().isISO8601(),
    (0, express_validator_1.body)('duration').optional().isInt({ min: 30, max: 240 }),
    (0, express_validator_1.body)('notes').optional().isString()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const updates = req.body;
    const session = await db.get(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.mentor !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this session' });
    }
    Object.assign(session, updates);
    const latest = await db.get(session._id);
    session._rev = latest._rev;
    const updatedSession = await db.put(session);
    res.json({ success: true, message: 'Session updated', data: { session: updatedSession } });
}));
router.delete('/sessions/:sessionId', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const session = await db.get(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.mentor !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this session' });
    }
    const latest = await db.get(session._id);
    session._rev = latest._rev;
    await db.remove(session);
    res.json({ success: true, message: 'Session deleted' });
}));
router.post('/sessions/:sessionId/notes', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('note').isString()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const { note } = req.body;
    const session = await db.get(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (!session.notes)
        session.notes = {};
    session.notes.mentor = note;
    const latest = await db.get(session._id);
    session._rev = latest._rev;
    const updatedSession = await db.put(session);
    res.json({ success: true, message: 'Note added', data: { session: updatedSession } });
}));
router.post('/sessions/:sessionId/feedback', (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('comment').isString()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const { rating, comment } = req.body;
    const session = await db.get(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (!session.feedback)
        session.feedback = {};
    session.feedback.mentor = { rating, comment, submittedAt: new Date() };
    const latest = await db.get(session._id);
    session._rev = latest._rev;
    const updatedSession = await db.put(session);
    res.json({ success: true, message: 'Feedback added', data: { session: updatedSession } });
}));
router.get('/dashboard', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('mentor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));
    const totalSessionsResult = await db.find({
        selector: { type: 'mentor_session', mentor: req.user._id.toString() }
    });
    const totalSessions = totalSessionsResult.docs.length;
    const completedSessionsResult = await db.find({
        selector: { type: 'mentor_session', mentor: req.user._id.toString(), status: 'completed' }
    });
    const completedSessions = completedSessionsResult.docs.length;
    const upcomingSessionsResult = await db.find({
        selector: {
            type: 'mentor_session',
            mentor: req.user._id.toString(),
            status: { $in: ['scheduled', 'confirmed'] },
            scheduledAt: { $gte: new Date() }
        }
    });
    const upcomingSessions = upcomingSessionsResult.docs.length;
    const recentSessionsResult = await db.find({
        selector: {
            type: 'mentor_session',
            mentor: req.user._id.toString(),
            scheduledAt: { $gte: daysAgo }
        }
    });
    const recentSessions = recentSessionsResult.docs.length;
    const uniqueMenteesResult = await db.find({
        selector: { type: 'mentor_session', mentor: req.user._id.toString() }
    });
    const uniqueMentees = [...new Set(uniqueMenteesResult.docs.map((session) => session.mentee))].length;
    const activeMenteesResult = await db.find({
        selector: {
            type: 'mentor_session',
            mentor: req.user._id.toString(),
            scheduledAt: { $gte: daysAgo }
        }
    });
    const activeMentees = [...new Set(activeMenteesResult.docs.map((session) => session.mentee))].length;
    const recentSessionsList = totalSessionsResult.docs
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 5)
        .map((session) => ({
        title: session.title,
        mentee: session.mentee,
        status: session.status,
        scheduledAt: session.scheduledAt,
        duration: session.duration
    }));
    const upcomingSessionsList = upcomingSessionsResult.docs
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5)
        .map((session) => ({
        title: session.title,
        mentee: session.mentee,
        status: session.status,
        scheduledAt: session.scheduledAt,
        duration: session.duration
    }));
    const sessionStats = totalSessionsResult.docs.reduce((acc, session) => {
        const existing = acc.find(item => item.status === session.status);
        if (existing) {
            existing.count++;
        }
        else {
            acc.push({
                status: session.status,
                count: 1
            });
        }
        return acc;
    }, []);
    const monthlySessions = totalSessionsResult.docs.reduce((acc, session) => {
        const date = new Date(session.scheduledAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${month.toString().padStart(2, '0')}`;
        const existing = acc.find(item => item.month === key);
        if (existing) {
            existing.total++;
            if (session.status === 'completed')
                existing.completed++;
        }
        else {
            acc.push({
                month: key,
                total: 1,
                completed: session.status === 'completed' ? 1 : 0
            });
        }
        return acc;
    }, []).sort((a, b) => a.month.localeCompare(b.month)).slice(0, 6);
    const menteeStats = totalSessionsResult.docs.reduce((acc, session) => {
        if (!acc[session.mentee]) {
            acc[session.mentee] = {
                totalSessions: 0,
                completedSessions: 0
            };
        }
        acc[session.mentee].totalSessions++;
        if (session.status === 'completed') {
            acc[session.mentee].completedSessions++;
        }
        return acc;
    }, {});
    const topMentees = Object.entries(menteeStats)
        .sort(([, a], [, b]) => b.totalSessions - a.totalSessions)
        .slice(0, 5)
        .map(([menteeId, stats]) => ({
        id: menteeId,
        totalSessions: stats.totalSessions,
        completedSessions: stats.completedSessions,
        completionRate: Math.round((stats.completedSessions / stats.totalSessions) * 100)
    }));
    const avgSessionDuration = completedSessionsResult.docs.length > 0
        ? completedSessionsResult.docs.reduce((sum, session) => sum + (session.duration || 0), 0) / completedSessionsResult.docs.length
        : 0;
    const recentMenteeActivity = recentSessionsResult.docs
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 5)
        .map((session) => ({
        id: session.mentee,
        lastSession: session.scheduledAt,
        sessionCount: 1
    }));
    res.json({
        success: true,
        data: {
            overview: {
                sessions: {
                    total: totalSessions,
                    completed: completedSessions,
                    upcoming: upcomingSessions,
                    recent: recentSessions
                },
                mentees: {
                    total: uniqueMentees,
                    active: activeMentees
                },
                averageDuration: Math.round(avgSessionDuration)
            },
            charts: {
                sessionStats: sessionStats,
                monthlySessions: monthlySessions
            },
            recentActivity: {
                recentSessions: recentSessionsList,
                upcomingSessions: upcomingSessionsList
            },
            topMentees: topMentees,
            recentMenteeActivity: recentMenteeActivity
        }
    });
}));
exports.default = router;
//# sourceMappingURL=mentor.routes.js.map