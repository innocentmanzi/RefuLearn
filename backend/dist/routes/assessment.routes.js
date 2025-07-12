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
router.get('/', auth_1.authenticateToken, [
    (0, express_validator_1.query)('courseId').optional(),
    (0, express_validator_1.query)('status').optional().isIn(['draft', 'published', 'archived']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId, status, page = 1, limit = 10 } = req.query;
    const query = { type: 'assessment', status: 'published' };
    if (courseId) {
        query.course = courseId;
    }
    if (status) {
        query.status = status;
    }
    const result = await db.find({ selector: query });
    const assessments = result.docs;
    const total = assessments.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedAssessments = assessments.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            assessments: pagedAssessments,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalAssessments: total
            }
        }
    });
}));
router.get('/:assessmentId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const assessment = await db.get(req.params['assessmentId']);
        res.json({
            success: true,
            data: { assessment }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Assessment not found'
        });
    }
}));
router.post('/:assessmentId/submit', auth_1.authenticateToken, [
    (0, express_validator_1.body)('answers').isArray().withMessage('Answers must be an array'),
    (0, express_validator_1.body)('answers.*.questionId').notEmpty().withMessage('Question ID is required'),
    (0, express_validator_1.body)('answers.*.answer').notEmpty().withMessage('Answer is required'),
    (0, express_validator_1.body)('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user._id.toString();
    const assessment = await db.get(assessmentId);
    if (!assessment) {
        return res.status(404).json({
            success: false,
            message: 'Assessment not found'
        });
    }
    if (assessment.status !== 'published') {
        return res.status(400).json({
            success: false,
            message: 'Assessment is not available for submission'
        });
    }
    if (!assessment.submissions) {
        assessment.submissions = [];
    }
    const alreadySubmitted = assessment.submissions.some((sub) => sub.student === userId);
    if (alreadySubmitted) {
        return res.status(400).json({
            success: false,
            message: 'You have already submitted this assessment'
        });
    }
    let score = 0;
    const gradedAnswers = answers.map((answer, index) => {
        const question = assessment.questions[index];
        if (question && question.type === 'multiple-choice' && answer === question.correctAnswer) {
            score += question.points;
        }
        return answer;
    });
    assessment.submissions.push({
        student: userId,
        answers: gradedAnswers,
        score: score,
        submittedAt: new Date(),
        status: 'submitted',
        timeSpent: timeSpent || 0
    });
    assessment.updatedAt = new Date();
    const latest = await db.get(assessment._id);
    assessment._rev = latest._rev;
    await db.put(assessment);
    res.json({
        success: true,
        message: 'Assessment submitted successfully',
        data: { score, totalPoints: assessment.totalPoints }
    });
}));
router.get('/submissions/user', auth_1.authenticateToken, [
    (0, express_validator_1.query)('status').optional().isIn(['submitted', 'graded', 'late']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const selector = {
        type: 'assessment',
        'submissions.student': req.user._id
    };
    if (status) {
        selector['submissions.status'] = status;
    }
    const result = await db.find({ selector });
    const assessments = result.docs;
    const submissions = assessments.map((assessment) => {
        const submission = assessment.submissions.find((sub) => sub.student === req.user._id.toString());
        return {
            assessment: {
                _id: assessment._id,
                title: assessment.title,
                type: assessment.type,
                course: assessment.course,
                instructor: assessment.instructor
            },
            submission
        };
    });
    const total = assessments.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedSubmissions = submissions.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            submissions: pagedSubmissions,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalSubmissions: total
            }
        }
    });
}));
router.get('/:assessmentId/results', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const userId = req.user._id.toString();
    const assessment = await db.get(assessmentId);
    if (!assessment) {
        return res.status(404).json({
            success: false,
            message: 'Assessment not found'
        });
    }
    if (!assessment.submissions) {
        assessment.submissions = [];
    }
    const submission = assessment.submissions.find((sub) => sub.student === userId);
    if (!submission) {
        return res.status(404).json({
            success: false,
            message: 'No submission found for this assessment'
        });
    }
    res.json({
        success: true,
        data: {
            submission,
            assessment: {
                title: assessment.title,
                totalPoints: assessment.totalPoints,
                passingScore: assessment.passingScore
            }
        }
    });
}));
router.get('/:assessmentId/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const assessment = await db.get(assessmentId);
    if (!assessment) {
        return res.status(404).json({
            success: false,
            message: 'Assessment not found'
        });
    }
    if (assessment.instructor !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to view this assessment analytics'
        });
    }
    const assessmentDoc = assessment;
    if (!assessmentDoc.submissions)
        assessmentDoc.submissions = [];
    const totalSubmissions = assessmentDoc.submissions.length;
    const gradedSubmissions = assessmentDoc.submissions.filter((s) => s.status === 'graded').length;
    const pendingSubmissions = assessmentDoc.submissions.filter((s) => s.status === 'submitted').length;
    const totalScore = assessmentDoc.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const averageScore = totalSubmissions > 0 ? totalScore / totalSubmissions : 0;
    const passedSubmissions = assessmentDoc.submissions.filter((sub) => {
        const percentage = ((sub.score || 0) / assessmentDoc.totalPoints) * 100;
        const passingScore = assessmentDoc.passingScore || 70;
        return percentage >= passingScore;
    }).length;
    const passRate = totalSubmissions > 0 ? (passedSubmissions / totalSubmissions) * 100 : 0;
    const questionAnalysis = assessmentDoc.questions.map((question) => {
        const questionSubmissions = assessmentDoc.submissions.filter((sub) => sub.answers.some((ans) => ans.questionId === question._id?.toString()));
        const correctAnswers = questionSubmissions.filter((sub) => {
            const answer = sub.answers.find((ans) => ans.questionId === question._id?.toString());
            return answer && answer.isCorrect;
        }).length;
        const questionPassRate = questionSubmissions.length > 0
            ? (correctAnswers / questionSubmissions.length) * 100
            : 0;
        return {
            questionId: question._id,
            question: question.question,
            type: question.type,
            totalAttempts: questionSubmissions.length,
            correctAnswers,
            passRate: Math.round(questionPassRate * 100) / 100
        };
    });
    const recentSubmissions = assessmentDoc.submissions
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10);
    const populatedSubmissions = await Promise.all(recentSubmissions.map(async (sub) => {
        const user = await db.get(sub.student);
        return {
            ...sub,
            student: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePic: user.profilePic
            }
        };
    }));
    res.json({
        success: true,
        data: {
            overview: {
                totalSubmissions,
                gradedSubmissions,
                pendingSubmissions,
                averageScore: Math.round(averageScore * 100) / 100,
                passRate: Math.round(passRate * 100) / 100
            },
            questionAnalysis,
            recentSubmissions: populatedSubmissions
        }
    });
}));
router.get('/course/:courseId', auth_1.authenticateToken, [
    (0, express_validator_1.query)('status').optional().isIn(['draft', 'published', 'archived']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const selector = { type: 'assessment', course: courseId };
    if (status) {
        selector.status = status;
    }
    const result = await db.find({ selector });
    const assessments = result.docs;
    const total = assessments.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedAssessments = assessments.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            assessments: pagedAssessments,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalAssessments: total
            }
        }
    });
}));
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('dueDate').optional(),
    (0, express_validator_1.body)('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be non-negative'),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const assessment = {
        ...req.body,
        _id: Date.now().toString(),
        _rev: '',
        type: 'assessment',
        course: req.body.course || 'general',
        instructor: req.user._id.toString(),
        status: 'published',
        questions: req.body.questions || [],
        totalPoints: req.body.totalPoints || 0,
        passingScore: req.body.passingScore || 70,
        duration: req.body.duration || 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        submissions: []
    };
    const result = await db.put(assessment);
    res.status(201).json({ success: true, message: 'Assessment created successfully', data: { assessment } });
}));
router.get('/admin/all', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const selector = { type: 'assessment' };
    const result = await db.find({ selector });
    const assessments = result.docs;
    res.json({ success: true, data: { assessments } });
}));
router.get('/admin/:assessmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const assessment = await db.get(req.params.assessmentId);
    if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.json({ success: true, data: { assessment } });
}));
router.put('/admin/:assessmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('dueDate').optional(),
    (0, express_validator_1.body)('totalPoints').optional().isInt({ min: 0 }),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const updates = req.body;
    const assessment = await db.get(assessmentId);
    if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    Object.assign(assessment, updates);
    assessment.updatedAt = new Date();
    const latest = await db.get(assessment._id);
    assessment._rev = latest._rev;
    await db.put(assessment);
    res.json({ success: true, message: 'Assessment updated successfully', data: { assessment } });
}));
router.delete('/admin/:assessmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const assessment = await db.get(assessmentId);
    if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const latest = await db.get(assessment._id);
    assessment._rev = latest._rev;
    await db.remove(assessment);
    res.json({ success: true, message: 'Assessment deleted successfully' });
}));
router.post('/user-submissions', auth_1.authenticateToken, [
    (0, express_validator_1.body)('user').exists().withMessage('User is required'),
    (0, express_validator_1.body)('assessment').exists().withMessage('Assessment is required'),
    (0, express_validator_1.body)('attempt_number').isInt({ min: 1 }).withMessage('Attempt number must be a positive integer'),
    (0, express_validator_1.body)('answers').isArray().withMessage('Answers must be an array'),
    (0, express_validator_1.body)('answers.*.question').notEmpty().withMessage('Question is required'),
    (0, express_validator_1.body)('answers.*.answer').notEmpty().withMessage('Answer is required'),
    (0, express_validator_1.body)('score').exists().withMessage('Score is required'),
    (0, express_validator_1.body)('passed').isBoolean().withMessage('Passed must be a boolean'),
    (0, express_validator_1.body)('completed_at').notEmpty().withMessage('Completed_at is required'),
    (0, express_validator_1.body)('time_taken').isInt({ min: 0 }).withMessage('Time taken must be non-negative')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const submission = {
        ...req.body,
        _id: Date.now().toString(),
        _rev: '',
        type: 'user_assessment_submission',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    try {
        const result = await db.put(submission);
        res.status(201).json({
            success: true,
            message: 'Assessment submission created successfully',
            data: {
                submission: {
                    ...submission,
                    _id: result.id,
                    _rev: result.rev
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create assessment submission',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
router.get('/user-submissions', auth_1.authenticateToken, [
    (0, express_validator_1.query)('assessment').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('user').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessment, user, page = 1, limit = 10 } = req.query;
    const selector = { type: 'user_assessment_submission' };
    if (!['admin', 'instructor'].includes(req.user.role)) {
        selector.user = parseInt(req.user._id.toString()) || req.user._id;
    }
    else if (user) {
        selector.user = parseInt(user);
    }
    if (assessment) {
        selector.assessment = parseInt(assessment);
    }
    const result = await db.find({ selector });
    const submissions = result.docs;
    const total = submissions.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedSubmissions = submissions.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            submissions: pagedSubmissions,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalSubmissions: total
            }
        }
    });
}));
router.get('/user-submissions/:submissionId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { submissionId } = req.params;
    try {
        const submission = await db.get(submissionId);
        if (submission.type !== 'user_assessment_submission') {
            return res.status(404).json({
                success: false,
                message: 'Assessment submission not found'
            });
        }
        if (!['admin', 'instructor'].includes(req.user.role) &&
            submission.user !== (parseInt(req.user._id.toString()) || req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this submission'
            });
        }
        res.json({
            success: true,
            data: { submission }
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: 'Assessment submission not found'
        });
    }
}));
router.put('/user-submissions/:submissionId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('score').optional().isInt({ min: 0 }).withMessage('Score must be non-negative'),
    (0, express_validator_1.body)('passed').optional().isBoolean().withMessage('Passed must be a boolean'),
    (0, express_validator_1.body)('answers').optional().isArray().withMessage('Answers must be an array')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { submissionId } = req.params;
    const updates = req.body;
    try {
        const submission = await db.get(submissionId);
        if (submission.type !== 'user_assessment_submission') {
            return res.status(404).json({
                success: false,
                message: 'Assessment submission not found'
            });
        }
        if (!['admin', 'instructor'].includes(req.user.role) &&
            submission.user !== (parseInt(req.user._id.toString()) || req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this submission'
            });
        }
        Object.assign(submission, updates);
        submission.updatedAt = new Date();
        const latest = await db.get(submission._id);
        submission._rev = latest._rev;
        const result = await db.put(submission);
        res.json({
            success: true,
            message: 'Assessment submission updated successfully',
            data: {
                submission: {
                    ...submission,
                    _rev: result.rev
                }
            }
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: 'Assessment submission not found'
        });
    }
}));
router.delete('/user-submissions/:submissionId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { submissionId } = req.params;
    try {
        const submission = await db.get(submissionId);
        if (submission.type !== 'user_assessment_submission') {
            return res.status(404).json({
                success: false,
                message: 'Assessment submission not found'
            });
        }
        if (!['admin', 'instructor'].includes(req.user.role) &&
            submission.user !== (parseInt(req.user._id.toString()) || req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this submission'
            });
        }
        const latest = await db.get(submission._id);
        submission._rev = latest._rev;
        await db.remove(submission);
        res.json({
            success: true,
            message: 'Assessment submission deleted successfully'
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: 'Assessment submission not found'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=assessment.routes.js.map