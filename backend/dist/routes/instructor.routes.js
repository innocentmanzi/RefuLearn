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
        console.log('🔄 Initializing CouchDB connection for instructor routes...');
        couchConnection = await (0, couchdb_1.connectCouchDB)();
        console.log('✅ Instructor routes database connection successful!');
        return true;
    }
    catch (error) {
        console.error('❌ Instructor routes database connection failed:', error.message);
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
router.get('/courses/active', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const result = await database.list({ include_docs: true });
        const activeCourses = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc &&
            doc.type === 'course' &&
            doc.instructor === req.user._id.toString() &&
            doc.isPublished === true);
        activeCourses.sort((a, b) => a.title.localeCompare(b.title));
        res.json({
            success: true,
            data: {
                courses: activeCourses,
                total: activeCourses.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching active courses:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch active courses'
        });
    }
}));
router.get('/courses', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.query)('status').optional().isIn(['published', 'draft']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 })
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, page = 1, limit = 100 } = req.query;
    const database = await ensureDb();
    const result = await database.list({ include_docs: true });
    let courses = result.rows
        .map((row) => row.doc)
        .filter((doc) => doc && doc.type === 'course' && doc.instructor === req.user._id.toString());
    if (status === 'published') {
        courses = courses.filter(c => c.isPublished === true);
    }
    else if (status === 'draft') {
        courses = courses.filter(c => c.isPublished === false);
    }
    const coursesWithModules = await Promise.all(courses.map(async (course) => {
        try {
            const modules = result.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'module' &&
                (doc.course === course._id || doc.courseId === course._id))
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            return {
                ...course,
                modules: modules || []
            };
        }
        catch (error) {
            return {
                ...course,
                modules: []
            };
        }
    }));
    const total = coursesWithModules.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedCourses = coursesWithModules.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({
        success: true,
        data: {
            courses: pagedCourses,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalCourses: total
            }
        }
    });
}));
router.get('/assessments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.query)('status').optional().isIn(['draft', 'published', 'archived']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const database = await ensureDb();
    const result = await database.list({ include_docs: true });
    let assessments = result.rows
        .map((row) => row.doc)
        .filter((doc) => doc &&
        ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) &&
        doc.instructor === req.user._id.toString());
    if (status) {
        assessments = assessments.filter(a => a.status === status);
    }
    assessments = assessments.map(assessment => {
        if (assessment.questions && assessment.questions.length > 0) {
            assessment.questions = assessment.questions.map((question, index) => {
                if (!question._id) {
                    question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
                }
                return question;
            });
        }
        return assessment;
    });
    const assessmentsWithCourses = await Promise.all(assessments.map(async (assessment) => {
        try {
            const database = await ensureDb();
            const course = await database.get(assessment.course);
            return {
                ...assessment,
                courseName: course.title,
                courseData: {
                    _id: course._id,
                    title: course.title,
                    isPublished: course.isPublished
                }
            };
        }
        catch (error) {
            return {
                ...assessment,
                courseName: 'Unknown Course',
                courseData: null
            };
        }
    }));
    const total = assessmentsWithCourses.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedAssessments = assessmentsWithCourses.slice((pageNum - 1) * limitNum, pageNum * limitNum);
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
router.post('/assessments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Assessment title is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('courseId').optional().notEmpty().withMessage('Course selection cannot be empty if provided'),
    (0, express_validator_1.body)('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
    (0, express_validator_1.body)('questions').optional().isArray().withMessage('Questions must be an array'),
    (0, express_validator_1.body)('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be a non-negative integer'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId, timeLimit, ...assessmentData } = req.body;
    try {
        console.log('Creating assessment with data:', { courseId, timeLimit, ...assessmentData });
        const database = await ensureDb();
        const finalCourseId = courseId || 'general';
        if (courseId && courseId !== 'general') {
            try {
                const course = await database.get(courseId);
                if (!course) {
                    return res.status(404).json({
                        success: false,
                        message: 'Course not found'
                    });
                }
                if (course.instructor !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to create assessment for this course'
                    });
                }
                if (!course.isPublished) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot create assessment for unpublished course'
                    });
                }
            }
            catch (error) {
                console.error('Error checking course:', error);
                console.log('Falling back to general course');
            }
        }
        const questions = (assessmentData.questions || []).map((q, index) => ({
            _id: q._id || `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            question: q.question,
            type: q.type,
            points: q.points || 1,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
        }));
        let totalPoints = assessmentData.totalPoints || 0;
        if (questions && questions.length > 0) {
            totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
        }
        const assessment = {
            ...assessmentData,
            _id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: assessmentData.type || 'assessment',
            course: finalCourseId,
            courseId: finalCourseId,
            moduleId: assessmentData.moduleId || '',
            instructor: req.user._id.toString(),
            status: 'published',
            duration: timeLimit || assessmentData.duration || 60,
            totalPoints: totalPoints,
            questions: questions,
            submissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: assessmentData.dueDate ? new Date(assessmentData.dueDate) : undefined
        };
        console.log('Assessment object to save:', assessment);
        const createdAssessment = await database.insert(assessment);
        console.log('Assessment saved successfully:', createdAssessment);
        res.status(201).json({
            success: true,
            message: 'Assessment created successfully!',
            data: {
                assessment: {
                    ...assessment,
                    _id: createdAssessment.id,
                    _rev: createdAssessment.rev
                },
                courseId: finalCourseId
            }
        });
    }
    catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while creating assessment'
        });
    }
}));
router.put('/assessments/:assessmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Assessment title cannot be empty'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
    (0, express_validator_1.body)('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
    (0, express_validator_1.body)('questions').optional().isArray().withMessage('Questions must be an array'),
    (0, express_validator_1.body)('questions.*.question').optional().notEmpty().withMessage('Question text cannot be empty'),
    (0, express_validator_1.body)('questions.*.type').optional().isIn(['multiple-choice', 'true-false', 'short-answer', 'essay']).withMessage('Invalid question type'),
    (0, express_validator_1.body)('questions.*.points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
    (0, express_validator_1.body)('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be a non-negative integer'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const { courseId, timeLimit, ...updates } = req.body;
    try {
        const database = await ensureDb();
        const assessment = await database.get(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }
        if (assessment.instructor !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this assessment'
            });
        }
        if (courseId && courseId !== assessment.course) {
            const course = await database.get(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }
            if (course.instructor !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to assign assessment to this course'
                });
            }
            if (!course.isPublished) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot assign assessment to unpublished course'
                });
            }
            updates.course = courseId;
        }
        if (timeLimit !== undefined) {
            updates.duration = timeLimit;
        }
        if (updates.questions) {
            updates.questions = updates.questions.map((question, index) => {
                if (!question._id) {
                    question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
                }
                if (!question.question || !question.type || question.points === undefined) {
                    throw new Error(`Invalid question at index ${index}: missing required fields`);
                }
                if (question.type === 'multiple-choice') {
                    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
                        throw new Error(`Multiple choice question at index ${index} must have at least 2 options`);
                    }
                    if (!question.correctAnswer) {
                        throw new Error(`Multiple choice question at index ${index} must have a correct answer`);
                    }
                }
                if (question.type !== 'multiple-choice' && !question.correctAnswer) {
                    throw new Error(`Question at index ${index} must have a correct answer`);
                }
                return {
                    _id: question._id,
                    question: question.question,
                    type: question.type,
                    points: parseInt(question.points) || 1,
                    options: question.options || [],
                    correctAnswer: question.correctAnswer || '',
                    explanation: question.explanation || ''
                };
            });
            updates.totalPoints = updates.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        }
        else if (assessment.questions) {
            assessment.questions = assessment.questions.map((question, index) => {
                if (!question._id) {
                    question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
                }
                return question;
            });
        }
        const cleanUpdates = {
            ...updates,
            updatedAt: new Date()
        };
        if (updates.dueDate) {
            cleanUpdates.dueDate = new Date(updates.dueDate);
        }
        Object.assign(assessment, cleanUpdates);
        const latest = await database.get(assessment._id);
        assessment._rev = latest._rev;
        const updatedAssessment = await database.insert(assessment);
        res.json({
            success: true,
            message: 'Assessment updated successfully!',
            data: { assessment: updatedAssessment }
        });
    }
    catch (error) {
        console.error('Error updating assessment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while updating assessment'
        });
    }
}));
router.post('/assessments/:assessmentId/questions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('question').notEmpty().withMessage('Question text is required'),
    (0, express_validator_1.body)('type').isIn(['multiple-choice', 'true-false', 'short-answer', 'essay']).withMessage('Invalid question type'),
    (0, express_validator_1.body)('points').isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
    (0, express_validator_1.body)('options').optional().isArray().withMessage('Options must be an array'),
    (0, express_validator_1.body)('correctAnswer').notEmpty().withMessage('Correct answer is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const { question, type, points, options, correctAnswer, explanation } = req.body;
    try {
        const database = await ensureDb();
        const assessment = await database.get(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }
        if (assessment.instructor !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add questions to this assessment'
            });
        }
        if (type === 'multiple-choice') {
            if (!options || !Array.isArray(options) || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Multiple choice questions must have at least 2 options'
                });
            }
            if (!options.includes(correctAnswer)) {
                return res.status(400).json({
                    success: false,
                    message: 'Correct answer must be one of the provided options'
                });
            }
        }
        const newQuestion = {
            _id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            question,
            type,
            points: parseInt(points) || 1,
            options: options || [],
            correctAnswer,
            explanation: explanation || ''
        };
        if (!assessment.questions) {
            assessment.questions = [];
        }
        assessment.questions.push(newQuestion);
        assessment.totalPoints = assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        assessment.updatedAt = new Date();
        const latest = await database.get(assessment._id);
        assessment._rev = latest._rev;
        const updatedAssessment = await database.insert(assessment);
        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            data: {
                question: newQuestion,
                assessment: updatedAssessment
            }
        });
    }
    catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while adding question'
        });
    }
}));
router.put('/assessments/:assessmentId/questions/:questionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('question').optional().notEmpty().withMessage('Question text cannot be empty'),
    (0, express_validator_1.body)('type').optional().isIn(['multiple-choice', 'true-false', 'short-answer', 'essay']).withMessage('Invalid question type'),
    (0, express_validator_1.body)('points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
    (0, express_validator_1.body)('options').optional().isArray().withMessage('Options must be an array'),
    (0, express_validator_1.body)('correctAnswer').optional().notEmpty().withMessage('Correct answer cannot be empty')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId, questionId } = req.params;
    const updates = req.body;
    try {
        const database = await ensureDb();
        const assessment = await database.get(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }
        if (assessment.instructor !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update questions in this assessment'
            });
        }
        if (!assessment.questions) {
            assessment.questions = [];
        }
        let questionIndex = assessment.questions.findIndex(q => q._id === questionId);
        if (questionIndex === -1) {
            const indexFromId = questionId.match(/question_\d+_(\d+)_/);
            if (indexFromId) {
                const index = parseInt(indexFromId[1]);
                if (index >= 0 && index < assessment.questions.length) {
                    questionIndex = index;
                    assessment.questions[questionIndex]._id = questionId;
                }
            }
        }
        if (questionIndex === -1) {
            questionIndex = assessment.questions.findIndex(q => q.question === updates.question ||
                (!q._id && assessment.questions.indexOf(q) === parseInt(questionId.split('_')[2] || '0')));
            if (questionIndex !== -1) {
                assessment.questions[questionIndex]._id = questionId;
            }
        }
        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        const question = assessment.questions[questionIndex];
        if (updates.type === 'multiple-choice' || question.type === 'multiple-choice') {
            const options = updates.options || question.options;
            const correctAnswer = updates.correctAnswer || question.correctAnswer;
            if (!options || !Array.isArray(options) || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Multiple choice questions must have at least 2 options'
                });
            }
            if (!options.includes(correctAnswer)) {
                return res.status(400).json({
                    success: false,
                    message: 'Correct answer must be one of the provided options'
                });
            }
        }
        Object.assign(question, updates);
        if (updates.points !== undefined) {
            question.points = parseInt(updates.points) || 1;
        }
        if (!question._id) {
            question._id = questionId;
        }
        assessment.totalPoints = assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        assessment.updatedAt = new Date();
        const latest = await database.get(assessment._id);
        assessment._rev = latest._rev;
        const updatedAssessment = await database.insert(assessment);
        res.json({
            success: true,
            message: 'Question updated successfully',
            data: {
                question,
                assessment: updatedAssessment
            }
        });
    }
    catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while updating question'
        });
    }
}));
router.delete('/assessments/:assessmentId/questions/:questionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId, questionId } = req.params;
    try {
        const database = await ensureDb();
        const assessment = await database.get(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }
        if (assessment.instructor !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete questions from this assessment'
            });
        }
        const questionIndex = assessment.questions.findIndex(q => q._id === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        const removedQuestion = assessment.questions.splice(questionIndex, 1)[0];
        assessment.totalPoints = assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        assessment.updatedAt = new Date();
        const latest = await database.get(assessment._id);
        assessment._rev = latest._rev;
        const updatedAssessment = await database.insert(assessment);
        res.json({
            success: true,
            message: 'Question deleted successfully',
            data: {
                deletedQuestion: removedQuestion,
                assessment: updatedAssessment
            }
        });
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while deleting question'
        });
    }
}));
router.get('/test-auth', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('🧪 TEST AUTH ROUTE CALLED');
    console.log('   User from token:', req.user ? req.user._id : 'NO USER');
    console.log('   Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    res.json({
        success: true,
        message: 'Authentication working',
        user: req.user ? req.user._id : 'No user'
    });
}));
router.delete('/assessments/:assessmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    try {
        console.log('🗑️ DELETE REQUEST RECEIVED');
        console.log('   Assessment ID:', assessmentId);
        console.log('   User from token:', req.user ? req.user._id : 'NO USER');
        console.log('   User object:', req.user);
        console.log('   Auth header:', req.headers.authorization ? 'Present' : 'Missing');
        const database = await ensureDb();
        let assessment;
        try {
            assessment = await database.get(assessmentId);
            console.log('📋 Assessment found:', assessment.title);
            console.log('📋 Assessment instructor:', assessment.instructor);
            console.log('📋 Assessment data:', JSON.stringify(assessment, null, 2));
        }
        catch (getError) {
            console.log('❌ Assessment not found:', assessmentId);
            console.log('❌ Get error:', getError.message);
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }
        console.log('🔍 Instructor check:');
        console.log('   Assessment instructor:', assessment.instructor);
        console.log('   User ID:', req.user._id.toString());
        console.log('   Match:', assessment.instructor === req.user._id.toString());
        try {
            await database.destroy(assessment._id, assessment._rev);
            console.log('✅ Assessment deleted successfully');
            res.json({
                success: true,
                message: 'Assessment deleted successfully'
            });
        }
        catch (removeError) {
            console.log('❌ Error removing assessment:', removeError.message);
            console.log('❌ Remove error details:', removeError);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete assessment: ' + removeError.message
            });
        }
    }
    catch (error) {
        console.error('❌ Error in delete route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
}));
router.get('/assessments/:assessmentId/submissions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.query)('status').optional().isIn(['submitted', 'graded', 'late']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    try {
        const database = await ensureDb();
        const assessment = await database.get(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }
        if (assessment.instructor !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view submissions for this assessment'
            });
        }
        let submissions = assessment.submissions || [];
        if (status) {
            submissions = submissions.filter((sub) => sub.status === status);
        }
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedSubmissions = submissions.slice(startIndex, endIndex);
        const populatedSubmissions = await Promise.all(paginatedSubmissions.map(async (sub) => {
            try {
                const user = await database.get(sub.student);
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
            }
            catch (error) {
                return {
                    ...sub,
                    student: {
                        _id: sub.student,
                        firstName: 'Unknown',
                        lastName: 'User',
                        email: 'unknown@example.com',
                        profilePic: null
                    }
                };
            }
        }));
        res.json({
            success: true,
            data: {
                submissions: populatedSubmissions,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(submissions.length / Number(limit)),
                    totalSubmissions: submissions.length
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching assessment submissions:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching submissions'
        });
    }
}));
router.put('/assessments/:assessmentId/submissions/:submissionId/grade', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.body)('score').isFloat({ min: 0 }).withMessage('Score must be non-negative'),
    (0, express_validator_1.body)('feedback').optional().trim(),
    (0, express_validator_1.body)('comments').optional().trim()
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId, submissionId } = req.params;
    const { score, feedback, comments } = req.body;
    try {
        const database = await ensureDb();
        const assessment = await database.get(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }
        if (assessment.instructor !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to grade submissions for this assessment'
            });
        }
        if (!assessment.submissions) {
            assessment.submissions = [];
        }
        const submission = assessment.submissions.find((s) => s._id === submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        submission.score = score;
        submission.feedback = feedback || '';
        submission.comments = comments || '';
        submission.gradedAt = new Date();
        submission.status = 'graded';
        assessment.updatedAt = new Date();
        const latest = await database.get(assessment._id);
        assessment._rev = latest._rev;
        await database.insert(assessment);
        res.json({
            success: true,
            message: 'Submission graded successfully',
            data: { submission }
        });
    }
    catch (error) {
        console.error('Error grading assessment submission:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while grading submission'
        });
    }
}));
router.get('/courses/:courseId/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    try {
        const database = await ensureDb();
        const course = await database.get(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        if (course.instructor !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view analytics for this course'
            });
        }
        const totalEnrollments = course.enrolledStudents?.length || 0;
        const completedModules = course.studentProgress?.filter((p) => p.completed).length || 0;
        const averageScore = course.studentProgress && course.studentProgress.length > 0
            ? course.studentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / course.studentProgress.length
            : 0;
        const allDocsResult = await database.list({ include_docs: true });
        const assessments = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc &&
            ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) &&
            doc.course === courseId);
        const totalAssessments = assessments.length;
        const completedAssessments = assessments.filter((a) => a.status === 'published').length;
        const recentProgress = course.studentProgress && course.studentProgress.length > 0
            ? course.studentProgress
                .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
                .slice(0, 10)
            : [];
        const populatedProgress = await Promise.all(recentProgress.map(async (p) => {
            try {
                const user = await database.get(p.student);
                return {
                    ...p,
                    student: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePic: user.profilePic
                    }
                };
            }
            catch (error) {
                return {
                    ...p,
                    student: {
                        _id: p.student,
                        firstName: 'Unknown',
                        lastName: 'User',
                        profilePic: null
                    }
                };
            }
        }));
        res.json({
            success: true,
            data: {
                totalEnrollments,
                completedModules,
                averageScore: Math.round(averageScore * 100) / 100,
                totalAssessments,
                completedAssessments,
                recentActivity: populatedProgress,
                studentProgress: course.studentProgress || []
            }
        });
    }
    catch (error) {
        console.error('Error fetching course analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching analytics'
        });
    }
}));
router.get('/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(period));
        const database = await ensureDb();
        const allDocsResult = await database.list({ include_docs: true });
        const courses = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course' && doc.instructor === req.user._id.toString());
        const totalCourses = courses.length;
        const publishedCourses = courses.filter(c => c.isPublished).length;
        const newCourses = courses.filter(c => c.createdAt && new Date(c.createdAt) >= daysAgo).length;
        const assessments = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc &&
            ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) &&
            doc.instructor === req.user._id.toString());
        const totalAssessments = assessments.length;
        const publishedAssessments = assessments.filter(a => a.status === 'published').length;
        const newAssessments = assessments.filter(a => a.createdAt && new Date(a.createdAt) >= daysAgo).length;
        const recentCourses = courses
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 5);
        const recentAssessments = assessments
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 5);
        const allStudentIds = new Set();
        courses.forEach(course => {
            if (course.enrolledStudents) {
                course.enrolledStudents.forEach(id => allStudentIds.add(id));
            }
        });
        const totalStudents = allStudentIds.size;
        let totalCompletions = 0;
        let totalProgress = 0;
        courses.forEach(course => {
            if (course.studentProgress) {
                totalProgress += course.studentProgress.length;
                totalCompletions += course.studentProgress.filter(p => p.completed).length;
            }
        });
        const completionRate = totalProgress > 0 ? (totalCompletions / totalProgress) * 100 : 0;
        res.json({
            success: true,
            data: {
                overview: {
                    totalCourses,
                    publishedCourses,
                    newCourses,
                    totalAssessments,
                    publishedAssessments,
                    newAssessments,
                    totalStudents,
                    completionRate: Math.round(completionRate * 100) / 100
                },
                recentCourses,
                recentAssessments
            }
        });
    }
    catch (error) {
        console.error('Error fetching instructor analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching analytics'
        });
    }
}));
router.get('/dashboard', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(period));
        const database = await ensureDb();
        const allDocsResult = await database.list({ include_docs: true });
        const courses = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course' && doc.instructor === req.user._id.toString());
        const totalCourses = courses.length;
        const publishedCourses = courses.filter(c => c.isPublished).length;
        const assessments = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc &&
            ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) &&
            doc.instructor === req.user._id.toString());
        const totalAssessments = assessments.length;
        const publishedAssessments = assessments.filter(a => a.status === 'published').length;
        const users = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'user' && doc.role === 'user');
        const allStudentIds = new Set();
        courses.forEach(course => {
            if (course.enrolledStudents) {
                course.enrolledStudents.forEach(id => allStudentIds.add(id));
            }
        });
        const totalStudents = allStudentIds.size;
        const studentProgress = courses.map(course => {
            const enrolledCount = course.enrolledStudents?.length || 0;
            const completedCount = course.studentProgress?.filter((p) => p.completed).length || 0;
            const completionPercentage = enrolledCount > 0 ? (completedCount / enrolledCount) * 100 : 0;
            return {
                courseName: course.title,
                courseId: course._id,
                enrolledStudents: enrolledCount,
                completedStudents: completedCount,
                completionPercentage: Math.round(completionPercentage * 100) / 100,
                lastActivity: course.updatedAt || course.createdAt
            };
        });
        let pendingSubmissions = 0;
        assessments.forEach(assessment => {
            if (assessment.submissions) {
                pendingSubmissions += assessment.submissions.filter((sub) => sub.status === 'submitted').length;
            }
        });
        res.json({
            success: true,
            data: {
                overview: {
                    totalCourses,
                    publishedCourses,
                    totalAssessments,
                    publishedAssessments,
                    totalStudents,
                    pendingSubmissions
                },
                studentProgress,
                recentCourses: courses.slice(0, 5),
                recentAssessments: assessments.slice(0, 5)
            }
        });
    }
    catch (error) {
        console.error('Error fetching instructor dashboard:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching dashboard'
        });
    }
}));
router.get('/help-tickets', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.query)('status').optional().isIn(['open', 'in_progress', 'closed', 'resolved']),
    (0, express_validator_1.query)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, priority, page = 1, limit = 10 } = req.query;
    try {
        const database = await ensureDb();
        const allDocsResult = await database.list({ include_docs: true });
        let tickets = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'help_ticket');
        if (status) {
            tickets = tickets.filter(ticket => ticket.status === status);
        }
        if (priority) {
            tickets = tickets.filter(ticket => ticket.priority === priority);
        }
        const total = tickets.length;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const pagedTickets = tickets.slice(startIndex, endIndex);
        const populatedTickets = await Promise.all(pagedTickets.map(async (ticket) => {
            try {
                const user = await database.get(ticket.user);
                const assignedUser = ticket.assignedTo ? await database.get(ticket.assignedTo) : null;
                return {
                    ...ticket,
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        profilePic: user.profilePic
                    },
                    assignedTo: assignedUser ? {
                        _id: assignedUser._id,
                        firstName: assignedUser.firstName,
                        lastName: assignedUser.lastName,
                        email: assignedUser.email
                    } : null
                };
            }
            catch (error) {
                return {
                    ...ticket,
                    user: {
                        _id: ticket.user,
                        firstName: 'Unknown',
                        lastName: 'User',
                        email: 'unknown@example.com',
                        profilePic: null
                    },
                    assignedTo: null
                };
            }
        }));
        res.json({
            success: true,
            data: {
                tickets: populatedTickets,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalTickets: total
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching help tickets:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching help tickets'
        });
    }
}));
router.post('/help-tickets/:ticketId/respond', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.body)('message').trim().notEmpty().withMessage('Response message is required'),
    (0, express_validator_1.body)('isInternal').optional().isBoolean()
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const { message, isInternal = false } = req.body;
    try {
        const database = await ensureDb();
        const ticket = await database.get(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Help ticket not found'
            });
        }
        if (ticket.assignedTo !== req.user._id.toString() && ticket.user !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this ticket'
            });
        }
        if (!ticket.messages) {
            ticket.messages = [];
        }
        const response = {
            _id: Date.now().toString(),
            sender: req.user._id.toString(),
            message,
            isInternal,
            createdAt: new Date()
        };
        ticket.messages.push(response);
        ticket.status = isInternal ? ticket.status : 'in-progress';
        ticket.updatedAt = new Date();
        const latest = await database.get(ticket._id);
        ticket._rev = latest._rev;
        await database.insert(ticket);
        res.json({
            success: true,
            message: 'Response added successfully',
            data: { ticket: ticket }
        });
    }
    catch (error) {
        console.error('Error responding to help ticket:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while responding to ticket'
        });
    }
}));
router.patch('/help-tickets/:ticketId/status', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.body)('status').isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status')
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;
    try {
        const database = await ensureDb();
        const ticket = await database.get(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Help ticket not found'
            });
        }
        if (ticket.assignedTo !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this ticket'
            });
        }
        ticket.status = status;
        ticket.updatedAt = new Date();
        const latest = await database.get(ticket._id);
        ticket._rev = latest._rev;
        await database.insert(ticket);
        res.json({
            success: true,
            message: 'Ticket status updated successfully',
            data: { ticket: ticket }
        });
    }
    catch (error) {
        console.error('Error updating help ticket status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while updating ticket status'
        });
    }
}));
router.get('/profile', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const user = await database.get(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const userProfile = { ...user };
        delete userProfile.password;
        res.json({
            success: true,
            data: { user: userProfile }
        });
    }
    catch (error) {
        console.error('Error fetching instructor profile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching profile'
        });
    }
}));
router.put('/profile', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, validation_1.validate)([
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('bio').optional().trim(),
    (0, express_validator_1.body)('phone_number').optional().trim(),
    (0, express_validator_1.body)('language_preference').optional().trim()
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const updates = req.body;
        const database = await ensureDb();
        const user = await database.get(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        Object.assign(user, updates);
        user.updatedAt = new Date();
        const latest = await database.get(user._id);
        user._rev = latest._rev;
        await database.insert(user);
        const userProfile = { ...user };
        delete userProfile.password;
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userProfile }
        });
    }
    catch (error) {
        console.error('Error updating instructor profile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while updating profile'
        });
    }
}));
router.get('/student-activity', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { period = '7' } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(period));
        const database = await ensureDb();
        const allDocsResult = await database.list({ include_docs: true });
        const courses = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course' && doc.instructor === req.user._id.toString());
        const enrolledUserIds = new Set();
        courses.forEach(course => {
            if (course.enrolledStudents) {
                course.enrolledStudents.forEach(id => enrolledUserIds.add(id));
            }
        });
        const users = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'user' && enrolledUserIds.has(doc._id));
        const dailyActivity = [];
        for (let i = Number(period) - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const activeUsers = users.filter(user => {
                const activityDate = user.lastActivity ? new Date(user.lastActivity).toISOString().split('T')[0] : null;
                const loginDate = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null;
                return activityDate === dateStr || loginDate === dateStr;
            }).length;
            let progressMade = 0;
            courses.forEach(course => {
                if (course.studentProgress) {
                    progressMade += course.studentProgress.filter((p) => {
                        if (!p.completedAt)
                            return false;
                        const completedDate = new Date(p.completedAt).toISOString().split('T')[0];
                        return completedDate === dateStr;
                    }).length;
                }
            });
            const totalEnrolledStudents = enrolledUserIds.size || 1;
            const activeUsersPercentage = Math.round((activeUsers / totalEnrolledStudents) * 100);
            const totalPossibleProgress = courses.reduce((sum, course) => {
                const modules = course.modules?.length || 1;
                const enrolled = course.enrolledStudents?.length || 0;
                return sum + (modules * enrolled);
            }, 0) || 1;
            const progressPercentage = Math.round((progressMade / totalPossibleProgress) * 100);
            dailyActivity.push({
                date: dateStr,
                activeUsers: Math.min(activeUsersPercentage, 100),
                progressMade: Math.min(progressPercentage, 100),
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawActiveUsers: activeUsers,
                rawProgressMade: progressMade
            });
        }
        const courseProgress = courses.map(course => {
            const totalModules = course.modules?.length || 1;
            const enrolledCount = course.enrolledStudents?.length || 0;
            const totalPossibleProgress = totalModules * enrolledCount;
            const actualProgress = course.studentProgress?.filter((p) => p.completed).length || 0;
            const progressPercentage = totalPossibleProgress > 0 ? (actualProgress / totalPossibleProgress) * 100 : 0;
            return {
                courseName: course.title,
                courseId: course._id,
                enrolledStudents: enrolledCount,
                totalModules,
                completedModules: actualProgress,
                progressPercentage: Math.round(progressPercentage * 100) / 100,
                lastActivity: course.updatedAt || course.createdAt
            };
        });
        res.json({
            success: true,
            data: {
                dailyActivity,
                courseProgress,
                summary: {
                    totalActiveUsers: users.filter(u => u.lastLogin && new Date(u.lastLogin) >= daysAgo).length,
                    totalProgressMade: dailyActivity.reduce((sum, day) => sum + day.progressMade, 0),
                    averageProgress: courseProgress.reduce((sum, course) => sum + course.progressPercentage, 0) / courseProgress.length || 0
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching student activity:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching student activity'
        });
    }
}));
router.get('/quizzes', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        console.log('🔍 Fetching quizzes for user:', user._id);
        const database = await ensureDb();
        const result = await database.list({ include_docs: true });
        const allQuizzes = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'quiz');
        console.log('📊 All quizzes in database:', allQuizzes.length);
        console.log('📋 Quiz details:', allQuizzes.length > 0 ? 'Found quizzes' : 'No quizzes');
        const quizzes = allQuizzes.filter((doc) => doc.instructorId === user._id);
        console.log('✅ Filtered quizzes for current user:', quizzes.length);
        console.log('📝 Quiz count for user:', quizzes.length);
        res.json({
            success: true,
            data: { quizzes }
        });
    }
    catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quizzes'
        });
    }
}));
router.post('/quizzes', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Quiz title is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('courseId').notEmpty().withMessage('Course selection is required'),
    (0, express_validator_1.body)('moduleId').optional().notEmpty().withMessage('Module selection is required'),
    (0, express_validator_1.body)('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    (0, express_validator_1.body)('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be a non-negative integer'),
    (0, express_validator_1.body)('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { title, description, courseId, moduleId, duration, totalPoints, passingScore, dueDate, questions } = req.body;
        console.log('🔍 Quiz creation request data:', { title, description, courseId, moduleId, duration, totalPoints, passingScore, dueDate, questionsCount: questions?.length });
        if (!title || !courseId || !questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Title, course, and questions are required'
            });
        }
        let courseName = 'Unknown Course';
        try {
            const database = await ensureDb();
            const courseDoc = await database.get(courseId);
            courseName = courseDoc.title;
        }
        catch (err) {
            console.error('Course not found:', err);
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        const quiz = {
            _id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'quiz',
            title,
            description: description || '',
            courseId,
            moduleId: moduleId || '',
            courseName,
            instructorId: user._id,
            instructorName: user.firstName + ' ' + user.lastName,
            duration: duration || 30,
            totalPoints: totalPoints || 0,
            passingScore: passingScore || 70,
            dueDate: dueDate || null,
            questions: questions || [],
            status: 'published',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        console.log('📤 Quiz object being saved to database:', { _id: quiz._id, title: quiz.title, courseId: quiz.courseId, moduleId: quiz.moduleId });
        const database = await ensureDb();
        await database.insert(quiz);
        console.log('✅ Quiz saved successfully with moduleId:', quiz.moduleId);
        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: { quiz }
        });
    }
    catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create quiz'
        });
    }
}));
router.put('/quizzes/:quizId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Quiz title cannot be empty'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
    (0, express_validator_1.body)('moduleId').optional().notEmpty().withMessage('Module selection cannot be empty'),
    (0, express_validator_1.body)('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    (0, express_validator_1.body)('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be a non-negative integer'),
    (0, express_validator_1.body)('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('questions').optional().isArray().withMessage('Questions must be an array')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { quizId } = req.params;
        const { title, description, courseId, moduleId, duration, totalPoints, passingScore, dueDate, questions } = req.body;
        const database = await ensureDb();
        const quiz = await database.get(quizId);
        if (quiz.instructorId !== user._id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this quiz'
            });
        }
        let courseName = quiz.courseName || 'Unknown Course';
        if (courseId && courseId !== quiz.courseId) {
            try {
                const courseDoc = await database.get(courseId);
                courseName = courseDoc.title;
            }
            catch (err) {
                console.error('Course not found:', err);
            }
        }
        const updatedQuiz = {
            ...quiz,
            title: title || quiz.title,
            description: description || quiz.description,
            courseId: courseId || quiz.courseId,
            moduleId: moduleId || quiz.moduleId,
            courseName,
            duration: duration || quiz.duration,
            totalPoints: totalPoints || quiz.totalPoints,
            passingScore: passingScore || quiz.passingScore,
            dueDate: dueDate || quiz.dueDate,
            questions: questions || quiz.questions,
            updatedAt: new Date().toISOString()
        };
        await database.insert(updatedQuiz);
        res.json({
            success: true,
            message: 'Quiz updated successfully',
            data: { quiz: updatedQuiz }
        });
    }
    catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quiz'
        });
    }
}));
router.delete('/quizzes/:quizId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { quizId } = req.params;
        const database = await ensureDb();
        const quiz = await database.get(quizId);
        if (quiz.instructorId !== user._id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this quiz'
            });
        }
        await database.destroy(quiz._id, quiz._rev);
        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete quiz'
        });
    }
}));
router.get('/discussions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const database = await ensureDb();
        const result = await database.list({ include_docs: true });
        const discussions = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'discussion' && doc.instructorId === user._id);
        res.json({
            success: true,
            data: { discussions }
        });
    }
    catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch discussions'
        });
    }
}));
router.post('/discussions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Discussion title is required'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Discussion content is required'),
    (0, express_validator_1.body)('courseId').notEmpty().withMessage('Course selection is required'),
    (0, express_validator_1.body)('category').optional().isIn(['general', 'question', 'announcement']).withMessage('Invalid category'),
    (0, express_validator_1.body)('questions').optional().isArray().withMessage('Questions must be an array')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { title, content, courseId, category, questions } = req.body;
        if (!title || !content || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and course are required'
            });
        }
        let courseName = 'Unknown Course';
        try {
            const database = await ensureDb();
            const courseDoc = await database.get(courseId);
            courseName = courseDoc.title;
        }
        catch (err) {
            console.error('Course not found:', err);
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        const discussion = {
            _id: `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'discussion',
            title,
            content,
            courseId,
            courseName,
            category: category || 'general',
            instructorId: user._id,
            instructorName: user.firstName + ' ' + user.lastName,
            status: 'active',
            replies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const database2 = await ensureDb();
        await database2.insert(discussion);
        res.status(201).json({
            success: true,
            message: 'Discussion created successfully',
            data: { discussion }
        });
    }
    catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create discussion'
        });
    }
}));
router.put('/discussions/:discussionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Discussion title cannot be empty'),
    (0, express_validator_1.body)('content').optional().notEmpty().withMessage('Discussion content cannot be empty'),
    (0, express_validator_1.body)('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
    (0, express_validator_1.body)('category').optional().isIn(['general', 'question', 'announcement']).withMessage('Invalid category'),
    (0, express_validator_1.body)('questions').optional().isArray().withMessage('Questions must be an array')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { discussionId } = req.params;
        const { title, content, courseId, category, questions } = req.body;
        const database = await ensureDb();
        const discussion = await database.get(discussionId);
        if (discussion.instructorId !== user._id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this discussion'
            });
        }
        let courseName = discussion.courseName || 'Unknown Course';
        if (courseId && courseId !== discussion.courseId) {
            try {
                const courseDoc = await database.get(courseId);
                courseName = courseDoc.title;
            }
            catch (err) {
                console.error('Course not found:', err);
            }
        }
        const updatedDiscussion = {
            ...discussion,
            title: title || discussion.title,
            content: content || discussion.content,
            courseId: courseId || discussion.courseId,
            courseName,
            category: category || discussion.category,
            updatedAt: new Date().toISOString()
        };
        await database.insert(updatedDiscussion);
        res.json({
            success: true,
            message: 'Discussion updated successfully',
            data: { discussion: updatedDiscussion }
        });
    }
    catch (error) {
        console.error('Error updating discussion:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update discussion'
        });
    }
}));
router.delete('/discussions/:discussionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { discussionId } = req.params;
        const database = await ensureDb();
        const discussion = await database.get(discussionId);
        if (discussion.instructorId !== user._id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this discussion'
            });
        }
        await database.destroy(discussion._id, discussion._rev);
        res.json({
            success: true,
            message: 'Discussion deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting discussion:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete discussion'
        });
    }
}));
router.get('/groups', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const database = await ensureDb();
        const result = await database.list({ include_docs: true });
        const groups = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'group' && doc.instructorId === user._id);
        res.json({
            success: true,
            data: { groups }
        });
    }
    catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch groups'
        });
    }
}));
router.post('/groups', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Group name is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('courseId').notEmpty().withMessage('Course selection is required'),
    (0, express_validator_1.body)('maxMembers').optional().isInt({ min: 1 }).withMessage('Max members must be a positive integer'),
    (0, express_validator_1.body)('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
    (0, express_validator_1.body)('allowSelfJoin').optional().isBoolean().withMessage('allowSelfJoin must be a boolean')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { name, description, courseId, maxMembers, isPrivate, allowSelfJoin } = req.body;
        if (!name || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Name and course are required'
            });
        }
        let courseName = 'Unknown Course';
        try {
            const database = await ensureDb();
            const courseDoc = await database.get(courseId);
            courseName = courseDoc.title;
        }
        catch (err) {
            console.error('Course not found:', err);
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        const group = {
            _id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'group',
            name,
            description: description || '',
            courseId,
            courseName,
            instructorId: user._id,
            instructorName: user.firstName + ' ' + user.lastName,
            maxMembers: maxMembers || 10,
            isPrivate: isPrivate || false,
            allowSelfJoin: allowSelfJoin !== false,
            members: [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const database2 = await ensureDb();
        await database2.insert(group);
        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: { group }
        });
    }
    catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create group'
        });
    }
}));
router.put('/groups/:groupId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Group name cannot be empty'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
    (0, express_validator_1.body)('maxMembers').optional().isInt({ min: 1 }).withMessage('Max members must be a positive integer'),
    (0, express_validator_1.body)('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
    (0, express_validator_1.body)('allowSelfJoin').optional().isBoolean().withMessage('allowSelfJoin must be a boolean')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { groupId } = req.params;
        const { name, description, courseId, maxMembers, isPrivate, allowSelfJoin } = req.body;
        const database = await ensureDb();
        const group = await database.get(groupId);
        if (group.instructorId !== user._id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this group'
            });
        }
        let courseName = group.courseName || 'Unknown Course';
        if (courseId && courseId !== group.courseId) {
            try {
                const courseDoc = await database.get(courseId);
                courseName = courseDoc.title;
            }
            catch (err) {
                console.error('Course not found:', err);
            }
        }
        const updatedGroup = {
            ...group,
            name: name || group.name,
            description: description || group.description,
            courseId: courseId || group.courseId,
            courseName,
            maxMembers: maxMembers || group.maxMembers,
            isPrivate: isPrivate !== undefined ? isPrivate : group.isPrivate,
            allowSelfJoin: allowSelfJoin !== undefined ? allowSelfJoin : group.allowSelfJoin,
            updatedAt: new Date().toISOString()
        };
        await database.insert(updatedGroup);
        res.json({
            success: true,
            message: 'Group updated successfully',
            data: { group: updatedGroup }
        });
    }
    catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update group'
        });
    }
}));
router.delete('/groups/:groupId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = req.user;
        const { groupId } = req.params;
        const database = await ensureDb();
        const group = await database.get(groupId);
        if (group.instructorId !== user._id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this group'
            });
        }
        await database.destroy(group._id, group._rev);
        res.json({
            success: true,
            message: 'Group deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete group'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=instructor.routes.js.map