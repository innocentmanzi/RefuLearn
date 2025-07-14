"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const couchdb_1 = require("../config/couchdb");
let couchConnection = null;
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing CouchDB connection for course routes...');
        couchConnection = await (0, couchdb_1.connectCouchDB)();
        console.log('✅ Course routes database connection successful!');
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Course routes database connection failed:', errorMessage);
        return false;
    }
};
initializeDatabase();
const router = (0, express_1.Router)();
router.get('/debug-test', (req, res) => {
    console.log('🔍 DEBUG TEST ROUTE HIT');
    res.json({ message: 'Debug test route working', timestamp: new Date().toISOString() });
});
router.get('/file-download/:submissionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('📁 FILE DOWNLOAD ROUTE HIT - Submission ID:', req.params.submissionId);
    console.log('📁 Request URL:', req.originalUrl);
    console.log('📁 Request method:', req.method);
    try {
        const { submissionId } = req.params;
        const database = await ensureDb();
        console.log('📁 File download request for submission:', submissionId);
        const submission = await database.get(submissionId);
        console.log('📁 Found submission:', submission);
        if (!submission || submission.type !== 'assignment_submission') {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        if (submission.submissionType !== 'file' || !submission.filePath) {
            return res.status(400).json({
                success: false,
                message: 'This submission does not contain a file'
            });
        }
        console.log('📁 File path:', submission.filePath);
        console.log('📁 File name:', submission.fileName);
        const fs = require('fs');
        const path = require('path');
        const filePath = submission.filePath;
        console.log('📁 Attempting to serve file:', filePath);
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found at path:', filePath);
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        switch (ext) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.txt':
                contentType = 'text/plain';
                break;
            case '.doc':
                contentType = 'application/msword';
                break;
            case '.docx':
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${submission.fileName || 'submission'}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
    catch (error) {
        console.error('❌ Error downloading submission file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
            error: error.message
        });
    }
}));
router.use((req, res, next) => {
    console.log('🔍 COURSE ROUTER - Request:', req.method, req.originalUrl, req.path);
    console.log('🔍 COURSE ROUTER - Full URL breakdown:', {
        originalUrl: req.originalUrl,
        path: req.path,
        baseUrl: req.baseUrl,
        params: req.params,
        query: req.query
    });
    next();
});
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
router.get('/', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { category, level, published, page = 1, limit = 10 } = req.query;
        console.log('Courses endpoint called by user:', req.user?._id, 'role:', req.user?.role);
        const database = await ensureDb();
        console.log('🔍 Querying database for all courses...');
        const result = await database.list({ include_docs: true });
        let courses = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course');
        console.log('📚 Course documents found:', courses.length);
        console.log('🔍 All courses in database:');
        courses.forEach((course, index) => {
            console.log(`  ${index + 1}. "${course.title}" - Category: "${course.category}" - Published: ${course.isPublished} - Active: ${course.is_active}`);
        });
        courses = courses.filter((course) => course.isPublished === true || course.isPublished === 'true');
        console.log('📚 Published courses found:', courses.length);
        if (category) {
            const categoryFilter = category.toLowerCase();
            courses = courses.filter((course) => course.category && course.category.toLowerCase() === categoryFilter);
            console.log('Filtered by category "' + category + '":', courses.length, 'courses');
        }
        if (level) {
            const levelFilter = level.toLowerCase();
            courses = courses.filter((course) => {
                const courseLevel = course.level ? course.level.toLowerCase() : '';
                const courseDifficultLevel = course.difficult_level ? course.difficult_level.toLowerCase() : '';
                return courseLevel === levelFilter || courseDifficultLevel === levelFilter;
            });
            console.log('Filtered by level "' + level + '":', courses.length, 'courses');
        }
        if (published === 'false') {
            const allCourses = result.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'course');
            courses = allCourses.filter((course) => course.isPublished === false);
            console.log('Filtered by published "false":', courses.length, 'courses');
        }
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedCourses = courses.slice(startIndex, endIndex);
        console.log('📄 Paginated courses:', paginatedCourses.length);
        return res.json({
            success: true,
            data: {
                courses: paginatedCourses,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: courses.length
                },
                debug: {
                    databaseConnected: !!database,
                    totalCoursesFound: courses.length,
                    usingRealData: true
                }
            }
        });
    }
    catch (error) {
        console.error('Error in courses endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch courses from database',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
router.get('/category/:categoryName', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { level, page = 1, limit = 10 } = req.query;
        console.log('🔍 Category endpoint called for:', categoryName);
        console.log('📊 Query params:', { level, page, limit });
        console.log('👤 User:', req.user?._id, 'Role:', req.user?.role);
        const database = await ensureDb();
        console.log('✅ Database connection successful');
        if (!database) {
            console.error('❌ Database connection failed');
            return res.status(500).json({
                success: false,
                message: 'Database connection failed'
            });
        }
        console.log('🔍 Querying database for courses...');
        try {
            console.log('🔍 Querying database for courses...');
            const result = await database.list({ include_docs: true });
            console.log('📊 Database query successful, total docs:', result.rows.length);
            const allCourses = result.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'course' && (doc.isPublished === true || doc.isPublished === 'true'));
            console.log('📚 Published courses found:', allCourses.length);
            console.log('🔍 All courses found:');
            allCourses.forEach((course, index) => {
                console.log(`  ${index + 1}. "${course.title}" - Category: "${course.category}" - Published: ${course.isPublished}`);
            });
            console.log('🔍 All course categories found:', allCourses.map(c => c.category).filter(Boolean));
            console.log('🔍 Looking for category:', categoryName);
            console.log('🔍 Looking for category (lowercase):', categoryName.toLowerCase());
            const filteredCourses = allCourses.filter((course) => {
                const courseCategory = course.category || '';
                const courseCategoryLower = courseCategory.toLowerCase();
                const categoryNameLower = categoryName.toLowerCase();
                const matches = courseCategoryLower === categoryNameLower;
                console.log(`📋 Checking course "${course.title}"`);
                console.log(`    Original category: "${courseCategory}"`);
                console.log(`    Lowercase category: "${courseCategoryLower}"`);
                console.log(`    Looking for: "${categoryNameLower}"`);
                console.log(`    Matches: ${matches}`);
                return matches;
            });
            console.log('📋 Filtered courses by category:', filteredCourses.length);
            let finalCourses = filteredCourses;
            if (level) {
                finalCourses = filteredCourses.filter((course) => {
                    const courseLevel = course.level || course.difficult_level || '';
                    return courseLevel.toLowerCase() === level.toString().toLowerCase();
                });
                console.log('📊 After level filter:', finalCourses.length);
            }
            const startIndex = (parseInt(page) - 1) * parseInt(limit);
            const endIndex = startIndex + parseInt(limit);
            const paginatedCourses = finalCourses.slice(startIndex, endIndex);
            console.log('📄 Paginated courses:', paginatedCourses.length);
            res.json({
                success: true,
                data: {
                    courses: paginatedCourses,
                    category: categoryName,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: finalCourses.length
                    },
                    debug: {
                        databaseConnected: !!database,
                        totalCoursesFound: allCourses.length,
                        filteredByCategory: filteredCourses.length,
                        finalCoursesCount: finalCourses.length,
                        usingRealData: true
                    }
                }
            });
        }
        catch (queryError) {
            console.error('❌ Database query error:', queryError);
            console.error('❌ Error message:', queryError instanceof Error ? queryError.message : 'Unknown error');
            console.error('❌ Error stack:', queryError instanceof Error ? queryError.stack : 'No stack trace');
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch courses from database',
                error: queryError instanceof Error ? queryError.message : 'Unknown error',
                debug: {
                    endpoint: 'category',
                    queryError: queryError instanceof Error ? queryError.message : 'Unknown error'
                }
            });
        }
    }
    catch (error) {
        console.error('❌ Error fetching courses by category:', error);
        console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch courses by category',
            error: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                endpoint: 'category',
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
}));
router.get('/recommended', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const result = await database.list({ include_docs: true });
        const allCourses = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course' && doc.isPublished === true);
        const courses = allCourses
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 20);
        const coursesWithModules = await Promise.all(courses.slice(0, 5).map(async (course) => {
            try {
                const modulesResult = await database.list({ include_docs: true });
                const modules = modulesResult.rows
                    .map((row) => row.doc)
                    .filter((doc) => doc && doc.type === 'module' &&
                    (doc.course === course._id || doc.courseId === course._id));
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
        res.json({ success: true, data: { courses: coursesWithModules } });
    }
    catch (error) {
        console.error('Error fetching recommended courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recommended courses from database',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
router.post('/:courseId/enroll', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id.toString();
    const database = await ensureDb();
    let course = await database.get(courseId);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (!course.isPublished) {
        return res.status(400).json({ success: false, message: 'Course is not available for enrollment' });
    }
    if (!course.enrolledStudents)
        course.enrolledStudents = [];
    if (course.enrolledStudents.includes(userId)) {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }
    course.enrolledStudents.push(userId);
    course.students = course.enrolledStudents.length;
    course.updatedAt = new Date();
    const latest = await database.get(course._id);
    course._rev = latest._rev;
    await database.insert(course);
    const user = await database.get(userId);
    if (!user.enrolledCourses)
        user.enrolledCourses = [];
    user.enrolledCourses.push(courseId);
    user.updatedAt = new Date();
    const latestUser = await database.get(user._id);
    user._rev = latestUser._rev;
    await database.insert(user);
    res.json({ success: true, message: 'Successfully enrolled in course' });
}));
router.delete('/:courseId/enroll', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id.toString();
    const database = await ensureDb();
    let course = await database.get(courseId);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (!course.enrolledStudents)
        course.enrolledStudents = [];
    course.enrolledStudents = course.enrolledStudents.filter((id) => id !== userId);
    course.students = course.enrolledStudents.length;
    course.updatedAt = new Date();
    const latest = await database.get(course._id);
    course._rev = latest._rev;
    await database.insert(course);
    const user = await database.get(userId);
    if (!user.enrolledCourses)
        user.enrolledCourses = [];
    user.enrolledCourses = user.enrolledCourses.filter((id) => id !== courseId);
    user.updatedAt = new Date();
    const latestUser = await database.get(user._id);
    user._rev = latestUser._rev;
    await database.insert(user);
    res.json({ success: true, message: 'Successfully unenrolled from course' });
}));
router.put('/:courseId/progress', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), [
    (0, express_validator_1.body)('moduleId').notEmpty().withMessage('Module ID is required'),
    (0, express_validator_1.body)('completed').isBoolean().withMessage('Completed status is required'),
    (0, express_validator_1.body)('score').optional().isFloat({ min: 0, max: 100 }),
    (0, express_validator_1.body)('contentType').optional().isString(),
    (0, express_validator_1.body)('itemIndex').optional().isInt(),
    (0, express_validator_1.body)('completionKey').optional().isString()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const { moduleId, completed, score, contentType, itemIndex, completionKey } = req.body;
    const userId = req.user._id.toString();
    console.log('📝 Progress update request:', {
        courseId,
        moduleId,
        completed,
        contentType,
        itemIndex,
        completionKey,
        userId
    });
    const database = await ensureDb();
    let course = await database.get(courseId);
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    if (!course.enrolledStudents?.includes(userId)) {
        return res.status(400).json({
            success: false,
            message: 'You must be enrolled to update progress'
        });
    }
    if (!course.studentProgress) {
        course.studentProgress = [];
    }
    let moduleProgress = course.studentProgress.find((p) => p.student === userId && p.moduleId === moduleId);
    if (!moduleProgress) {
        moduleProgress = {
            student: userId,
            moduleId,
            completed: false,
            score: 0,
            completedAt: null,
            completedItems: []
        };
        course.studentProgress.push(moduleProgress);
    }
    if (completionKey && contentType && itemIndex !== undefined) {
        if (!moduleProgress.completedItems) {
            moduleProgress.completedItems = [];
        }
        console.log('🎯 Processing item completion:', {
            completionKey,
            contentType,
            itemIndex,
            currentCompletedItems: moduleProgress.completedItems,
            completed
        });
        if (completed && !moduleProgress.completedItems.includes(completionKey)) {
            moduleProgress.completedItems.push(completionKey);
            console.log('✅ Added completion key:', completionKey);
        }
        else if (!completed && moduleProgress.completedItems.includes(completionKey)) {
            moduleProgress.completedItems = moduleProgress.completedItems.filter((key) => key !== completionKey);
            console.log('❌ Removed completion key:', completionKey);
        }
        try {
            const moduleDoc = await database.get(moduleId);
            if (moduleDoc) {
                let totalItems = 0;
                if (moduleDoc.description)
                    totalItems++;
                if (moduleDoc.content)
                    totalItems++;
                if (moduleDoc.videoUrl)
                    totalItems++;
                if (moduleDoc.resources)
                    totalItems += moduleDoc.resources.length;
                if (moduleDoc.assessments)
                    totalItems += moduleDoc.assessments.length;
                if (moduleDoc.quizzes)
                    totalItems += moduleDoc.quizzes.length;
                if (moduleDoc.discussions)
                    totalItems += moduleDoc.discussions.length;
                const completedItemsCount = moduleProgress.completedItems.length;
                const wasCompleted = moduleProgress.completed;
                moduleProgress.completed = totalItems > 0 && completedItemsCount >= totalItems;
                console.log('📊 Module completion check:', {
                    moduleId,
                    totalItems,
                    completedItemsCount,
                    wasCompleted,
                    nowCompleted: moduleProgress.completed
                });
                if (moduleProgress.completed && !moduleProgress.completedAt) {
                    moduleProgress.completedAt = new Date();
                    console.log('🎉 Module completed!');
                }
                else if (!moduleProgress.completed) {
                    moduleProgress.completedAt = null;
                }
            }
        }
        catch (moduleError) {
            const errorMessage = moduleError instanceof Error ? moduleError.message : String(moduleError);
            console.warn('⚠️ Could not fetch module document:', errorMessage);
        }
    }
    else {
        moduleProgress.completed = completed;
        if (score !== undefined) {
            moduleProgress.score = score;
        }
        if (completed && !moduleProgress.completedAt) {
            moduleProgress.completedAt = new Date();
        }
        else if (!completed) {
            moduleProgress.completedAt = null;
        }
    }
    let totalItemsInCourse = 0;
    let completedItemsInCourse = 0;
    const moduleIds = course.modules || [];
    for (const moduleId of moduleIds) {
        try {
            const moduleDoc = await database.get(moduleId);
            if (moduleDoc) {
                let moduleItemCount = 0;
                if (moduleDoc.description)
                    moduleItemCount++;
                if (moduleDoc.content)
                    moduleItemCount++;
                if (moduleDoc.videoUrl)
                    moduleItemCount++;
                if (moduleDoc.resources)
                    moduleItemCount += moduleDoc.resources.length;
                if (moduleDoc.assessments)
                    moduleItemCount += moduleDoc.assessments.length;
                if (moduleDoc.quizzes)
                    moduleItemCount += moduleDoc.quizzes.length;
                if (moduleDoc.discussions)
                    moduleItemCount += moduleDoc.discussions.length;
                totalItemsInCourse += moduleItemCount;
                const moduleProgress = course.studentProgress.find((p) => p.student === userId && p.moduleId === moduleId);
                if (moduleProgress && moduleProgress.completedItems) {
                    completedItemsInCourse += moduleProgress.completedItems.length;
                }
                console.log(`📊 Module ${moduleId} - Items: ${moduleItemCount}, Completed: ${moduleProgress?.completedItems?.length || 0}`);
            }
        }
        catch (moduleError) {
            const errorMessage = moduleError instanceof Error ? moduleError.message : String(moduleError);
            console.warn('⚠️ Could not fetch module for progress calculation:', errorMessage);
        }
    }
    const progressPercentage = totalItemsInCourse > 0 ? (completedItemsInCourse / totalItemsInCourse) * 100 : 0;
    const totalModules = moduleIds.length;
    const completedModules = course.studentProgress.filter((p) => p.student === userId && p.completed).length;
    console.log('📈 Overall progress calculation:', {
        totalModules,
        completedModules,
        totalItemsInCourse,
        completedItemsInCourse,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        userProgressEntries: course.studentProgress.filter((p) => p.student === userId)
    });
    course.updatedAt = new Date();
    const latest = await database.get(course._id);
    course._rev = latest._rev;
    await database.insert(course);
    console.log('✅ Progress updated successfully');
    res.json({
        success: true,
        message: 'Progress updated successfully',
        data: {
            progressPercentage,
            completedModules,
            totalModules,
            moduleProgress,
            completedItems: moduleProgress.completedItems
        }
    });
}));
router.get('/:courseId/progress', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id.toString();
    console.log('📊 Fetching progress for:', { courseId, userId });
    const database = await ensureDb();
    let course = await database.get(courseId);
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    const userProgress = course.studentProgress?.filter((p) => p.student === userId) || [];
    console.log('📈 User progress found:', userProgress.length, 'modules');
    let totalItemsInCourse = 0;
    let completedItemsInCourse = 0;
    const moduleIds = course.modules || [];
    for (const moduleId of moduleIds) {
        try {
            const moduleDoc = await database.get(moduleId);
            if (moduleDoc) {
                let moduleItemCount = 0;
                if (moduleDoc.description)
                    moduleItemCount++;
                if (moduleDoc.content)
                    moduleItemCount++;
                if (moduleDoc.videoUrl)
                    moduleItemCount++;
                if (moduleDoc.resources)
                    moduleItemCount += moduleDoc.resources.length;
                if (moduleDoc.assessments)
                    moduleItemCount += moduleDoc.assessments.length;
                if (moduleDoc.quizzes)
                    moduleItemCount += moduleDoc.quizzes.length;
                if (moduleDoc.discussions)
                    moduleItemCount += moduleDoc.discussions.length;
                totalItemsInCourse += moduleItemCount;
                const moduleProgress = userProgress.find((p) => p.moduleId === moduleId);
                if (moduleProgress && moduleProgress.completedItems) {
                    completedItemsInCourse += moduleProgress.completedItems.length;
                }
            }
        }
        catch (moduleError) {
            const errorMessage = moduleError instanceof Error ? moduleError.message : String(moduleError);
            console.warn('⚠️ Could not fetch module for progress calculation:', errorMessage);
        }
    }
    const progressPercentage = totalItemsInCourse > 0 ? (completedItemsInCourse / totalItemsInCourse) * 100 : 0;
    const totalModules = moduleIds.length;
    const completedModules = userProgress.filter((p) => p.completed).length;
    const allCompletedItems = userProgress.reduce((acc, moduleProgress) => {
        if (moduleProgress.completedItems) {
            acc.push(...moduleProgress.completedItems);
        }
        return acc;
    }, []);
    console.log('🎯 All completed items:', allCompletedItems);
    const modulesProgress = userProgress.reduce((acc, moduleProgress) => {
        acc[moduleProgress.moduleId] = {
            completed: moduleProgress.completed,
            completedItems: moduleProgress.completedItems || [],
            score: moduleProgress.score || 0,
            completedAt: moduleProgress.completedAt
        };
        return acc;
    }, {});
    console.log('📊 Progress summary:', {
        totalModules,
        completedModules,
        totalItemsInCourse,
        completedItemsInCourse,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        totalCompletedItems: allCompletedItems.length
    });
    res.json({
        success: true,
        data: {
            progress: userProgress,
            totalModules,
            completedModules,
            progressPercentage,
            modulesProgress,
            allCompletedItems
        }
    });
}));
router.get('/enrolled/courses/:courseId?', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin', 'instructor', 'employer', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id.toString();
    const database = await ensureDb();
    const user = await database.get(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    const { courseId } = req.params;
    if (courseId) {
        if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
            let course = await database.get(courseId);
            return res.json({ success: true, data: { course } });
        }
        else {
            return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
        }
    }
    let courses = [];
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
        courses = await Promise.all(user.enrolledCourses.map(async (id) => {
            try {
                return await database.get(id);
            }
            catch {
                return null;
            }
        }));
        courses = courses.filter(Boolean);
    }
    res.json({
        success: true,
        data: { courses }
    });
}));
router.get('/learning-path', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const database = await ensureDb();
        console.log('🔍 Learning path endpoint called for user:', userId);
        const result = await database.list({ include_docs: true });
        const enrolledCourses = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'enrollment' && doc.user_id === userId);
        console.log('📚 Enrolled courses found:', enrolledCourses.length);
        const learningPath = enrolledCourses.map((enrollment) => ({
            _id: enrollment.course_id,
            title: enrollment.course_title || 'Course',
            description: enrollment.course_description || 'Course description',
            progress: enrollment.progress_percentage || 0,
            completed: enrollment.completed || false,
            duration: enrollment.course_duration || '4 weeks',
            level: enrollment.course_level || 'Beginner',
            courseId: enrollment.course_id
        }));
        res.json({
            success: true,
            data: { learningPath }
        });
    }
    catch (error) {
        console.error('Error fetching learning path:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch learning path' });
    }
}));
router.get('/recommendations', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const database = await ensureDb();
        console.log('🔍 Recommendations endpoint called for user:', userId);
        const result = await database.list({ include_docs: true });
        const enrolledCourses = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'enrollment' && doc.user_id === userId);
        const allCourses = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course' && doc.isPublished === true);
        console.log('📚 Published courses found:', allCourses.length);
        console.log('📝 User enrolled courses:', enrolledCourses.length);
        const enrolledCourseIds = enrolledCourses.map((enrollment) => enrollment.course_id);
        const availableCourses = allCourses.filter((course) => !enrolledCourseIds.includes(course._id));
        console.log('✨ Available courses for recommendations:', availableCourses.length);
        const recommendations = availableCourses.slice(0, 5).map((course) => ({
            _id: course._id,
            title: course.title,
            description: course.description,
            level: course.difficult_level || course.level,
            duration: course.duration,
            category: course.category
        }));
        res.json({
            success: true,
            data: { recommendations }
        });
    }
    catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
    }
}));
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), upload_1.default.single('course_profile_picture'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const { title, overview, learningOutcomes, duration, category, level, modules = [] } = req.body;
        console.log('🔥 Course creation request received:');
        console.log('📋 Request body keys:', Object.keys(req.body));
        console.log('📚 Modules received:', modules);
        console.log('📊 Modules length:', modules.length);
        console.log('🔍 Modules type:', typeof modules);
        let parsedModules = modules;
        if (typeof modules === 'string') {
            try {
                parsedModules = JSON.parse(modules);
                console.log('📝 Parsed modules from string:', parsedModules);
            }
            catch (e) {
                console.error('❌ Failed to parse modules JSON:', e);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid modules format'
                });
            }
        }
        console.log('✅ Final modules to process:', parsedModules);
        console.log('📊 Final modules length:', parsedModules.length);
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Course title is required'
            });
        }
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Course category is required'
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Course profile picture is required'
            });
        }
        console.log('📸 Course image upload:', {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });
        const normalizedPath = req.file.path.replace(/\\/g, '/');
        console.log('📸 Normalized path:', normalizedPath);
        const courseData = {
            _id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'course',
            title,
            overview: overview || '',
            learningOutcomes: learningOutcomes || '',
            duration: duration || '',
            category: category,
            level: level || 'Beginner',
            difficult_level: level || 'Beginner',
            instructor: req.user._id.toString(),
            instructor_id: req.user._id.toString(),
            course_profile_picture: normalizedPath,
            isPublished: false,
            is_active: true,
            enrolledStudents: [],
            students: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const courseResult = await database.insert(courseData);
        const courseId = courseResult.id;
        console.log('✅ Course created with ID:', courseId);
        const createdModules = [];
        console.log('🔧 Creating', parsedModules.length, 'modules for course:', courseId);
        for (let i = 0; i < parsedModules.length; i++) {
            const moduleData = parsedModules[i];
            console.log('🔍 Processing module at index', i, ':', moduleData);
            if (!moduleData.title) {
                console.log('⚠️ Skipping module without title at index:', i, 'moduleData:', moduleData);
                continue;
            }
            const moduleDoc = {
                _id: `module_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'module',
                course: courseId,
                courseId: courseId,
                title: moduleData.title,
                description: moduleData.description || '',
                content_type: moduleData.content_type || 'text content',
                content: Array.isArray(moduleData.content) ? JSON.stringify(moduleData.content) : (moduleData.content || ''),
                duration: moduleData.duration || '30 minutes',
                isMandatory: moduleData.isMandatory !== undefined ? moduleData.isMandatory : true,
                order: i + 1,
                isPublished: moduleData.isPublished !== undefined ? moduleData.isPublished : true,
                createdAt: new Date(),
                updatedAt: new Date(),
                videoUrl: moduleData.videoUrl || '',
                videoTitle: moduleData.videoTitle || '',
                resources: moduleData.resources || [],
                assignments: moduleData.assignments || [],
                assessments: moduleData.assessments || [],
                quizzes: moduleData.quizzes || [],
                learningObjectives: moduleData.learningObjectives || [],
                prerequisites: moduleData.prerequisites || [],
                tags: moduleData.tags || [],
                overview: moduleData.overview || ''
            };
            console.log('📝 Creating module:', {
                _id: moduleDoc._id,
                title: moduleDoc.title,
                course: moduleDoc.course,
                courseId: moduleDoc.courseId,
                order: moduleDoc.order
            });
            const moduleResult = await database.insert(moduleDoc);
            createdModules.push({ ...moduleDoc, _id: moduleResult.id, _rev: moduleResult.rev });
            console.log('✅ Module created successfully:', moduleResult.id);
        }
        console.log('🎯 Total modules created:', createdModules.length);
        const courseWithModules = {
            ...courseData,
            _id: courseId,
            _rev: courseResult.rev,
            modules: createdModules.map((m) => m._id),
            moduleCount: createdModules.length
        };
        const updatedCourseResult = await database.insert(courseWithModules);
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: {
                course: { ...courseWithModules, _id: updatedCourseResult.id, _rev: updatedCourseResult.rev },
                modules: createdModules
            }
        });
    }
    catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create course'
        });
    }
}));
router.put('/:courseId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), upload_1.default.single('course_profile_picture'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const database = await ensureDb();
    const allowedFields = [
        'title', 'category', 'level', 'description', 'overview', 'learningOutcomes', 'instructor_id', 'duration', 'difficult_level', 'is_active', 'isPublished'
    ];
    let course = await database.get(courseId);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (req.user.role !== 'admin' && course.instructor !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }
    allowedFields.forEach(field => {
        if (typeof req.body[field] !== 'undefined') {
            course[field] = req.body[field];
            if (field === 'level') {
                course.difficult_level = req.body[field];
            }
        }
    });
    if (req.file) {
        course.course_profile_picture = req.file.path.replace(/\\/g, '/');
    }
    if (req.body.modules) {
        let modules = [];
        try {
            modules = typeof req.body.modules === 'string' ? JSON.parse(req.body.modules) : req.body.modules;
        }
        catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid modules format' });
        }
        const moduleIds = [];
        for (const [i, moduleData] of modules.entries()) {
            let moduleDoc;
            if (moduleData._id && moduleData._id.startsWith('module_')) {
                try {
                    moduleDoc = await database.get(moduleData._id);
                    Object.assign(moduleDoc, {
                        ...moduleData,
                        course: courseId,
                        courseId: courseId,
                        order: i + 1,
                        updatedAt: new Date()
                    });
                }
                catch (err) {
                    moduleDoc = {
                        _id: `module_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'module',
                        course: courseId,
                        courseId: courseId,
                        ...moduleData,
                        order: i + 1,
                        createdAt: new Date()
                    };
                }
            }
            else {
                moduleDoc = {
                    _id: `module_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'module',
                    course: courseId,
                    courseId: courseId,
                    title: moduleData.title || 'Untitled Module',
                    description: moduleData.description || '',
                    content: moduleData.content || [],
                    assessments: moduleData.assessments || [],
                    quizzes: moduleData.quizzes || [],
                    discussions: moduleData.discussions || [],
                    content_type: 'text content',
                    duration: moduleData.duration || '30 minutes',
                    isMandatory: true,
                    order: i + 1,
                    createdAt: new Date()
                };
            }
            const result = await database.insert(moduleDoc);
            moduleIds.push(result.id);
        }
        course.modules = moduleIds;
    }
    course.updatedAt = new Date();
    const latest = await database.get(course._id);
    course._rev = latest._rev;
    const updatedCourse = await database.insert(course);
    res.json({
        success: true,
        message: 'Course updated successfully',
        data: { course: updatedCourse }
    });
}));
router.delete('/:courseId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    try {
        const database = await ensureDb();
        console.log('🗑️ Attempting to delete course:', courseId);
        let course;
        try {
            course = await database.get(courseId);
        }
        catch (err) {
            console.error('❌ Course not found:', err instanceof Error ? err.message : 'Unknown error');
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        console.log('✅ Course found:', course.title);
        if (req.user.role !== 'admin' && course.instructor !== req.user._id.toString()) {
            console.log('❌ Authorization failed - user:', req.user._id, 'instructor:', course.instructor);
            return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
        }
        try {
            console.log('🔍 Looking for related modules...');
            const allDocsResult = await database.list({ include_docs: true });
            const relatedModules = allDocsResult.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'module' &&
                (doc.course === courseId || doc.courseId === courseId));
            console.log('📦 Found', relatedModules.length, 'related modules');
            for (const module of relatedModules) {
                try {
                    await database.destroy(module._id, module._rev);
                    console.log('✅ Deleted module:', module.title);
                }
                catch (moduleErr) {
                    console.warn('⚠️ Failed to delete module:', module.title, moduleErr instanceof Error ? moduleErr.message : 'Unknown error');
                }
            }
            const relatedContent = allDocsResult.rows
                .map((row) => row.doc)
                .filter((doc) => doc &&
                ['assessment', 'quiz', 'discussion'].includes(doc.type) &&
                (doc.course === courseId || doc.courseId === courseId));
            console.log('📝 Found', relatedContent.length, 'related content items');
            for (const content of relatedContent) {
                try {
                    await database.destroy(content._id, content._rev);
                    console.log('✅ Deleted', content.type + ':', content.title);
                }
                catch (contentErr) {
                    console.warn('⚠️ Failed to delete', content.type + ':', content.title, contentErr instanceof Error ? contentErr.message : 'Unknown error');
                }
            }
        }
        catch (cleanupErr) {
            console.warn('⚠️ Cleanup warning:', cleanupErr instanceof Error ? cleanupErr.message : 'Unknown error');
        }
        try {
            const latestCourse = await database.get(courseId);
            console.log('🔄 Got latest course revision for deletion');
            await database.destroy(latestCourse._id, latestCourse._rev);
            console.log('✅ Course deleted successfully');
            res.json({
                success: true,
                message: 'Course deleted successfully'
            });
        }
        catch (deleteErr) {
            console.error('❌ Failed to delete course:', deleteErr instanceof Error ? deleteErr.message : 'Unknown error');
            if (deleteErr instanceof Error && 'error' in deleteErr && deleteErr.error === 'conflict') {
                return res.status(409).json({
                    success: false,
                    message: 'Course was modified by another user. Please refresh and try again.'
                });
            }
            if (deleteErr instanceof Error && 'error' in deleteErr && deleteErr.error === 'not_found') {
                return res.status(404).json({
                    success: false,
                    message: 'Course no longer exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Database error while deleting course: ' + (deleteErr instanceof Error ? deleteErr.message : 'Unknown error')
            });
        }
    }
    catch (error) {
        console.error('❌ General error in course deletion:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            message: 'Failed to delete course: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
    }
}));
router.get('/:courseId/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const database = await ensureDb();
    let course = await database.get(courseId);
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
    res.json({
        success: true,
        data: {
            totalEnrollments,
            completedModules,
            averageScore: Math.round(averageScore * 100) / 100,
            studentProgress: course.studentProgress || []
        }
    });
}));
router.get('/categories', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const result = await database.list({ include_docs: true });
        let categories = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'category');
        if (categories.length === 0) {
            const defaultCategories = [
                { _id: 'category_technology', _rev: '1-default', type: 'category', name: 'Technology', description: 'Programming, software development, and IT courses' },
                { _id: 'category_business', _rev: '1-default', type: 'category', name: 'Business', description: 'Business management, entrepreneurship, and finance' },
                { _id: 'category_language', _rev: '1-default', type: 'category', name: 'Language', description: 'Language learning and communication skills' },
                { _id: 'category_healthcare', _rev: '1-default', type: 'category', name: 'Healthcare', description: 'Medical, nursing, and health-related courses' },
                { _id: 'category_education', _rev: '1-default', type: 'category', name: 'Education', description: 'Teaching, training, and educational courses' },
                { _id: 'category_arts_design', _rev: '1-default', type: 'category', name: 'Arts & Design', description: 'Creative arts, design, and multimedia' },
                { _id: 'category_engineering', _rev: '1-default', type: 'category', name: 'Engineering', description: 'Engineering disciplines and technical skills' },
                { _id: 'category_finance', _rev: '1-default', type: 'category', name: 'Finance', description: 'Financial management and accounting' },
                { _id: 'category_marketing', _rev: '1-default', type: 'category', name: 'Marketing', description: 'Digital marketing and sales strategies' },
                { _id: 'category_general', _rev: '1-default', type: 'category', name: 'General', description: 'General knowledge and miscellaneous topics' }
            ];
            for (const category of defaultCategories) {
                try {
                    await database.insert(category);
                }
                catch (error) {
                    console.log('Category may already exist:', category.name);
                }
            }
            categories = defaultCategories;
        }
        res.json({ success: true, data: { categories } });
    }
    catch (error) {
        console.error('Error fetching categories:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
}));
router.get('/levels', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const levels = [
        { value: 'Beginner', label: 'Beginner', description: 'For those new to the subject' },
        { value: 'Intermediate', label: 'Intermediate', description: 'For those with some basic knowledge' },
        { value: 'Advanced', label: 'Advanced', description: 'For experienced learners' },
        { value: 'Expert', label: 'Expert', description: 'For professionals and experts' }
    ];
    res.json({ success: true, data: { levels } });
}));
router.post('/categories', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('description').optional().trim()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { name, description } = req.body;
    const existing = await database.get(name);
    if (existing) {
        return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    const category = await database.insert({ type: 'category', name, description });
    res.status(201).json({ success: true, message: 'Category created', data: { category } });
}));
router.get('/categories/:categoryId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const category = await database.get(req.params.categoryId);
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: { category } });
}));
router.patch('/categories/:categoryId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('description').optional().trim()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const updates = req.body;
    const category = await database.get(req.params.categoryId);
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const updatedCategory = await database.insert({ ...category, ...updates });
    res.json({ success: true, message: 'Category updated', data: { category: updatedCategory } });
}));
router.delete('/categories/:categoryId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const category = await database.get(req.params.categoryId);
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await database.destroy(req.params.categoryId, category._rev);
    res.json({ success: true, message: 'Category deleted' });
}));
router.get('/discussions', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const { course } = req.query;
        console.log('🔍 Discussions endpoint called, course filter:', course);
        const result = await database.list({ include_docs: true });
        let discussions = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'discussion');
        if (course) {
            discussions = discussions.filter((discussion) => discussion.course === course);
        }
        console.log('💬 Total discussions found:', discussions.length);
        res.json({ success: true, data: { discussions } });
    }
    catch (error) {
        console.error('Error fetching discussions:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
    }
}));
router.post('/discussions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), [
    (0, express_validator_1.body)('course').notEmpty().withMessage('Course is required'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('author').notEmpty().withMessage('Author is required'),
    (0, express_validator_1.body)('status').optional().isString().withMessage('Status must be a string')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { course, title, content, author, status } = req.body;
    const discussionId = `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDiscussion = await database.insert({
        _id: discussionId,
        type: 'discussion',
        course,
        title,
        content,
        author,
        status: status || 'submitted',
        createdAt: new Date().toISOString()
    });
    res.status(201).json({ success: true, message: 'Discussion created', data: { discussion: newDiscussion } });
}));
router.get('/discussions/:discussionId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const discussion = await database.get(req.params.discussionId);
    if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    res.json({ success: true, data: { discussion } });
}));
router.patch('/discussions/:discussionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('course').optional().notEmpty().withMessage('Course is required'),
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('content').optional().notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('author').optional().notEmpty().withMessage('Author is required'),
    (0, express_validator_1.body)('status').optional().isString().withMessage('Status must be a string')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const discussion = await database.get(req.params.discussionId);
    if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    const updates = req.body;
    const updatedDiscussion = await database.insert({ ...discussion, ...updates });
    res.json({ success: true, message: 'Discussion updated', data: { discussion: updatedDiscussion } });
}));
router.delete('/discussions/:discussionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const discussion = await database.get(req.params.discussionId);
    if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    if (discussion.author !== req.user._id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'instructor') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await database.destroy(req.params.discussionId, discussion._rev);
    res.json({ success: true, message: 'Discussion deleted' });
}));
router.post('/discussions/:discussionId/replies', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), [
    (0, express_validator_1.body)('content').trim().notEmpty().withMessage('Content is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const discussion = await database.get(req.params.discussionId);
    if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    if (!discussion.replies)
        discussion.replies = [];
    const reply = {
        user: req.user._id,
        content: req.body.content,
        createdAt: new Date()
    };
    discussion.replies.push(reply);
    discussion.updatedAt = new Date();
    const updatedDiscussion = await database.insert(discussion);
    res.status(201).json({ success: true, message: 'Reply added', data: { discussion: updatedDiscussion } });
}));
router.patch('/discussions/:discussionId/replies/:replyId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), [
    (0, express_validator_1.body)('content').trim().notEmpty().withMessage('Content is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const discussion = await database.get(req.params.discussionId);
    if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    if (!discussion.replies)
        discussion.replies = [];
    const reply = discussion.replies.find((r) => r._id === req.params.replyId);
    if (!reply) {
        return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    if (reply.user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    reply.content = req.body.content;
    reply.updatedAt = new Date();
    discussion.updatedAt = new Date();
    const updatedDiscussion = await database.insert(discussion);
    res.json({ success: true, message: 'Reply updated', data: { discussion: updatedDiscussion } });
}));
router.delete('/discussions/:discussionId/replies/:replyId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const discussion = await database.get(req.params.discussionId);
    if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    if (!discussion.replies)
        discussion.replies = [];
    const reply = discussion.replies.find((r) => r._id === req.params.replyId);
    if (!reply) {
        return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    if (reply.user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    discussion.replies = discussion.replies.filter((r) => r._id !== req.params.replyId);
    discussion.updatedAt = new Date();
    const updatedDiscussion = await database.insert(discussion);
    res.json({ success: true, message: 'Reply deleted', data: { discussion: updatedDiscussion } });
}));
router.get('/enrollments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin', 'instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const { user, course } = req.query;
        console.log('🔍 Enrollments endpoint called, filters:', { user, course });
        const result = await database.list({ include_docs: true });
        let enrollments = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'enrollment');
        if (user) {
            enrollments = enrollments.filter((enrollment) => enrollment.user === user);
        }
        if (course) {
            enrollments = enrollments.filter((enrollment) => enrollment.course === course);
        }
        console.log('📝 Total enrollments found:', enrollments.length);
        res.json({ success: true, data: { enrollments } });
    }
    catch (error) {
        console.error('Error fetching enrollments:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
    }
}));
router.post('/enrollments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('course').notEmpty().withMessage('Course is required'),
    (0, express_validator_1.body)('user').optional()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const userId = req.body.user || req.user._id.toString();
    const { course } = req.body;
    let existing = await database.get(course);
    if (existing.enrolledStudents && existing.enrolledStudents.includes(userId)) {
        return res.status(400).json({ success: false, message: 'Already enrolled' });
    }
    const enrollment = await database.insert({
        type: 'enrollment',
        user: userId,
        course,
        status: 'active',
        progress: 0,
        createdAt: new Date()
    });
    res.status(201).json({ success: true, message: 'Enrolled successfully', data: { enrollment } });
}));
router.get('/enrollments/:enrollmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const enrollment = await database.get(req.params.enrollmentId);
    if (!enrollment) {
        return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && enrollment.user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: { enrollment } });
}));
router.patch('/enrollments/:enrollmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('status').optional().isIn(['active', 'completed', 'dropped']),
    (0, express_validator_1.body)('progress').optional().isFloat({ min: 0, max: 100 })
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const enrollment = await database.get(req.params.enrollmentId);
    if (!enrollment) {
        return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && enrollment.user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updates = req.body;
    const updatedEnrollment = await database.insert({ ...enrollment, ...updates });
    res.json({ success: true, message: 'Enrollment updated', data: { enrollment: updatedEnrollment } });
}));
router.delete('/enrollments/:enrollmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const enrollment = await database.get(req.params.enrollmentId);
    if (!enrollment) {
        return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && enrollment.user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!enrollment._rev) {
        return res.status(500).json({ success: false, message: 'Cannot delete enrollment: missing revision' });
    }
    await database.destroy(req.params.enrollmentId, enrollment._rev);
    res.json({ success: true, message: 'Unenrolled successfully' });
}));
router.post('/assessments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('moduleId').trim().notEmpty().withMessage('Module ID is required'),
    (0, express_validator_1.body)('courseId').trim().notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
    (0, express_validator_1.body)('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { title, description, moduleId, courseId, timeLimit, questions } = req.body;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const assessment = {
        _id: assessmentId,
        type: 'assessment',
        title,
        description: description || '',
        moduleId,
        courseId,
        instructor: req.user._id.toString(),
        timeLimit,
        totalPoints,
        questions: questions.map((q, index) => ({
            ...q,
            id: q.id || `question_${Date.now()}_${index}`,
            order: index + 1
        })),
        isPublished: true,
        isActive: true,
        createdAt: new Date()
    };
    const result = await database.insert(assessment);
    res.status(201).json({
        success: true,
        message: 'Assessment created successfully',
        data: { assessment: { ...assessment, _id: result.id, _rev: result.rev } }
    });
}));
router.get('/assessments/:assessmentId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const assessment = await database.get(req.params.assessmentId);
        res.json({ success: true, data: { assessment } });
    }
    catch (err) {
        res.status(404).json({ success: false, message: 'Assessment not found' });
    }
}));
router.put('/assessments/:assessmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
    (0, express_validator_1.body)('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { assessmentId } = req.params;
    const { title, description, timeLimit, questions } = req.body;
    try {
        const existingAssessment = await database.get(assessmentId);
        if (existingAssessment.instructor !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this assessment' });
        }
        const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
        const updatedAssessment = {
            ...existingAssessment,
            title,
            description: description || '',
            timeLimit,
            totalPoints,
            questions: questions.map((q, index) => ({
                ...q,
                id: q.id || `question_${Date.now()}_${index}`,
                order: index + 1
            }))
        };
        const result = await database.insert(updatedAssessment);
        res.json({
            success: true,
            message: 'Assessment updated successfully',
            data: { assessment: { ...updatedAssessment, _rev: result.rev } }
        });
    }
    catch (err) {
        console.error('Error updating assessment:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to update assessment' });
    }
}));
router.delete('/assessments/:assessmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { assessmentId } = req.params;
    try {
        const existingAssessment = await database.get(assessmentId);
        if (existingAssessment.instructor !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this assessment' });
        }
        await database.destroy(existingAssessment._id, existingAssessment._rev);
        res.json({ success: true, message: 'Assessment deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting assessment:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to delete assessment' });
    }
}));
router.post('/assessments/:assessmentId/submit', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user'), [
    (0, express_validator_1.body)('answers').isArray().withMessage('Answers must be an array'),
    (0, express_validator_1.body)('timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a non-negative integer')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { assessmentId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user._id.toString();
    try {
        const assessment = await database.get(assessmentId);
        let score = 0;
        const results = assessment.questions.map((question, index) => {
            const userAnswer = answers[index];
            let isCorrect = false;
            if (question.type === 'multiple_choice') {
                isCorrect = userAnswer === question.correctAnswer;
            }
            else if (question.type === 'short_answer') {
                isCorrect = userAnswer?.toString().toLowerCase().trim() ===
                    question.correctAnswer?.toString().toLowerCase().trim();
            }
            else if (question.type === 'true_false') {
                isCorrect = userAnswer?.toString() === question.correctAnswer?.toString();
            }
            if (isCorrect) {
                score += question.points;
            }
            return {
                questionId: question.id,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                points: isCorrect ? question.points : 0,
                explanation: question.explanation
            };
        });
        const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const attempt = {
            _id: attemptId,
            type: 'user_assessment_attempt',
            userId,
            assessmentId,
            moduleId: assessment.moduleId,
            courseId: assessment.courseId,
            answers,
            score,
            totalPoints: assessment.totalPoints,
            timeSpent,
            completed: true,
            submittedAt: new Date()
        };
        await database.insert(attempt);
        res.json({
            success: true,
            data: {
                score,
                totalPoints: assessment.totalPoints,
                percentage: Math.round((score / assessment.totalPoints) * 100),
                results,
                timeSpent
            }
        });
    }
    catch (err) {
        console.error('Error submitting assessment:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to submit assessment' });
    }
}));
router.get('/assessments/:assessmentId/attempts', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const userId = req.user._id.toString();
    try {
        const database = await ensureDb();
        const result = await database.find({
            selector: {
                type: 'user_assessment_attempt',
                userId,
                assessmentId
            }
        });
        res.json({ success: true, data: { attempts: result.docs } });
    }
    catch (err) {
        console.error('Error fetching attempts:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch attempts' });
    }
}));
router.get('/:courseId/assessments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    try {
        const database = await ensureDb();
        const result = await database.find({
            selector: {
                type: 'assessment',
                courseId,
                isActive: true
            },
            sort: [{ createdAt: 'asc' }]
        });
        res.json({ success: true, data: { assessments: result.docs } });
    }
    catch (err) {
        console.error('Error fetching course assessments:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch assessments' });
    }
}));
router.get('/modules', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const { course } = req.query;
        console.log('🔍 Modules endpoint called, course filter:', course);
        const result = await database.list({ include_docs: true });
        let modules = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'module');
        if (course) {
            modules = modules.filter((module) => module.course === course || module.courseId === course);
            console.log('🔍 Filtered modules by course:', course, 'found:', modules.length);
        }
        console.log('📚 Total modules found:', modules.length);
        res.json({ success: true, data: { modules } });
    }
    catch (error) {
        console.error('Error fetching modules:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch modules' });
    }
}));
router.post('/modules/comprehensive', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), upload_1.default.any(), [
    (0, express_validator_1.body)('courseId').notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('content_type').isIn(["video", "assignment", "links", "audio", "pdf", "interactive content", "quiz", "text content", "article"]).withMessage('Invalid content_type'),
    (0, express_validator_1.body)('duration').trim().notEmpty().withMessage('Duration is required'),
    (0, express_validator_1.body)('isMandatory').isBoolean().withMessage('isMandatory must be true or false'),
    (0, express_validator_1.body)('order').isInt({ min: 1 }).withMessage('Order is required'),
    (0, express_validator_1.body)('content_text').optional().isString(),
    (0, express_validator_1.body)('content_file').optional(),
    (0, express_validator_1.body)('contentItems').optional().isString()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        console.log('🔧 Creating comprehensive module');
        console.log('📝 Data received:', Object.keys(req.body));
        const { courseId, title, description, overview, content_type, content_text, duration, isMandatory, isPublished, order, videoUrl, videoTitle, resources, assignments, assessments, quizzes, learningObjectives, prerequisites, tags, discussions, contentItems } = req.body;
        let content = '';
        let contentDetails = { type: content_type, hasFile: false, hasText: false, filePath: '', fileName: '' };
        console.log('📝 Processing content type:', content_type);
        console.log('📝 Request files:', req.files ? 'Files present' : 'No files');
        console.log('📝 Content text length:', content_text ? content_text.length : 0);
        if (content_type === 'text content' || content_type === 'text' || content_type === 'article') {
            if (!content_text) {
                return res.status(400).json({ success: false, message: 'content_text is required for text content type' });
            }
            content = content_text;
            contentDetails.hasText = true;
            console.log('✅ Text content processed, length:', content.length);
        }
        else {
            if (!req.files || (Array.isArray(req.files) && req.files.length === 0) || (!Array.isArray(req.files) && !('content_file' in req.files))) {
                return res.status(400).json({ success: false, message: 'content_file is required for this content type' });
            }
            let file;
            if (Array.isArray(req.files)) {
                file = req.files[0];
            }
            else {
                const filesObj = req.files;
                file = Array.isArray(filesObj['content_file']) ? filesObj['content_file'][0] : filesObj['content_file'];
            }
            content = file.path || file.filename || '';
            contentDetails.hasFile = true;
            contentDetails.filePath = file.path || '';
            contentDetails.fileName = file.originalname || file.filename || '';
            console.log('✅ File content processed:', {
                originalName: file.originalname,
                fileName: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            });
        }
        const parseArrayField = (field) => {
            if (typeof field === 'string') {
                try {
                    return JSON.parse(field);
                }
                catch (e) {
                    return [];
                }
            }
            return Array.isArray(field) ? field : [];
        };
        let parsedContentItems = [];
        if (contentItems) {
            try {
                parsedContentItems = JSON.parse(contentItems);
                console.log('✅ ContentItems parsed:', parsedContentItems.length, 'items');
            }
            catch (e) {
                console.warn('Failed to parse contentItems:', e);
            }
        }
        const moduleId = `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const module = {
            _id: moduleId,
            type: 'module',
            course: courseId,
            courseId,
            title,
            description,
            content_type,
            content,
            duration,
            isMandatory: isMandatory === 'true' || isMandatory === true,
            order: Number(order),
            overview: overview || '',
            isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : true,
            videoUrl: videoUrl || '',
            videoTitle: videoTitle || '',
            resources: parseArrayField(resources),
            assignments: parseArrayField(assignments),
            assessments: parseArrayField(assessments),
            quizzes: parseArrayField(quizzes),
            learningObjectives: parseArrayField(learningObjectives),
            prerequisites: parseArrayField(prerequisites),
            tags: parseArrayField(tags),
            contentItems: parsedContentItems,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        module.contentDetails = contentDetails;
        module.createdAt = new Date();
        module.updatedAt = new Date();
        console.log('📦 Creating module with enhanced content tracking:', {
            title: module.title,
            content_type: module.content_type,
            hasContent: !!module.content,
            contentDetails: contentDetails,
            resourcesCount: module.resources?.length || 0,
            assessmentsCount: module.assessments?.length || 0,
            videoUrl: module.videoUrl || 'none'
        });
        const moduleResult = await database.insert(module);
        console.log('✅ Module created successfully:', moduleResult.id);
        try {
            const course = await database.get(courseId);
            if (course) {
                if (!course.modules) {
                    course.modules = [];
                }
                if (!course.modules.includes(moduleResult.id)) {
                    course.modules.push(moduleResult.id);
                    course.updatedAt = new Date();
                    await database.put(course);
                    console.log('✅ Module added to course modules array');
                }
            }
        }
        catch (courseUpdateError) {
            console.warn('⚠️ Failed to update course with new module:', courseUpdateError);
        }
        const createdDiscussions = [];
        if (discussions) {
            const discussionsArray = parseArrayField(discussions);
            for (const discussion of discussionsArray) {
                if (discussion.title && discussion.content) {
                    try {
                        const discussionId = `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        const discussionDoc = {
                            _id: discussionId,
                            type: 'discussion',
                            title: discussion.title,
                            content: discussion.content,
                            category: discussion.category || 'general',
                            moduleId: moduleId,
                            module: moduleId,
                            course: courseId,
                            user: req.user._id.toString(),
                            replies: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        const discussionResult = await database.insert(discussionDoc);
                        createdDiscussions.push({ ...discussionDoc, _id: discussionResult.id, _rev: discussionResult.rev });
                        console.log('💬 Discussion created:', discussion.title);
                    }
                    catch (discussionError) {
                        console.warn('⚠️ Failed to create discussion:', discussion.title, discussionError);
                    }
                }
            }
        }
        res.status(201).json({
            success: true,
            message: 'Comprehensive module created successfully',
            data: {
                module: { ...module, _id: moduleResult.id, _rev: moduleResult.rev },
                discussions: createdDiscussions
            }
        });
    }
    catch (error) {
        console.error('❌ Error creating comprehensive module:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            success: false,
            message: (error instanceof Error ? error.message : 'Unknown error') || 'Internal server error while creating module'
        });
    }
}));
router.post('/modules', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), upload_1.default.any(), [
    (0, express_validator_1.body)('courseId').notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('content_type').isIn(["video", "assignment", "links", "audio", "pdf", "interactive content", "quiz", "text content"]).withMessage('Invalid content_type'),
    (0, express_validator_1.body)('duration').trim().notEmpty().withMessage('Duration is required'),
    (0, express_validator_1.body)('isMandatory').isBoolean().withMessage('isMandatory must be true or false'),
    (0, express_validator_1.body)('order').isInt({ min: 1 }).withMessage('Order is required'),
    (0, express_validator_1.body)('content_text').optional().isString(),
    (0, express_validator_1.body)('content_file').optional(),
    (0, express_validator_1.body)('contentItems').optional().isString()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { courseId, title, description, content_type, duration, isMandatory, order, content_text, contentItems } = req.body;
    let content = '';
    if (content_type === 'text content') {
        if (!content_text) {
            return res.status(400).json({ success: false, message: 'content_text is required for text content type' });
        }
        content = content_text;
    }
    else {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0) || (!Array.isArray(req.files) && !('content_file' in req.files))) {
            return res.status(400).json({ success: false, message: 'content_file is required for this content type' });
        }
        let file;
        if (Array.isArray(req.files)) {
            file = req.files[0];
        }
        else {
            const filesObj = req.files;
            file = Array.isArray(filesObj['content_file']) ? filesObj['content_file'][0] : filesObj['content_file'];
        }
        content = file.path || file.filename || '';
    }
    let parsedContentItems = [];
    if (contentItems) {
        try {
            parsedContentItems = JSON.parse(contentItems);
        }
        catch (e) {
            console.warn('Failed to parse contentItems:', e);
        }
    }
    const module = {
        _id: `module_${Date.now()}`,
        type: 'module',
        course: courseId,
        courseId,
        title,
        description,
        content_type,
        content,
        contentItems: parsedContentItems,
        duration,
        isMandatory: isMandatory === 'true' || isMandatory === true,
        order: Number(order)
    };
    const result = await database.insert(module);
    try {
        const course = await database.get(courseId);
        if (course) {
            if (!course.modules) {
                course.modules = [];
            }
            if (!course.modules.includes(result.id)) {
                course.modules.push(result.id);
                course.updatedAt = new Date();
                await database.put(course);
                console.log('✅ Module added to course modules array (basic endpoint)');
            }
        }
    }
    catch (courseUpdateError) {
        console.warn('⚠️ Failed to update course with new module (basic endpoint):', courseUpdateError);
    }
    res.status(201).json({ success: true, message: 'Module created', data: { module: result } });
}));
router.get('/modules/:moduleId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const module = await database.get(req.params.moduleId);
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }
    console.log('📚 Retrieved module content:', {
        title: module.title,
        content_type: module.content_type,
        hasContent: !!module.content,
        contentLength: module.content ? module.content.length : 0,
        contentDetails: module.contentDetails || 'none',
        videoUrl: module.videoUrl || 'none',
        resourcesCount: module.resources?.length || 0
    });
    res.json({ success: true, data: { module } });
}));
router.get('/modules/:moduleId/content-check', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const module = await database.get(req.params.moduleId);
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }
    const fs = require('fs');
    const contentInfo = {
        moduleTitle: module.title,
        contentType: module.content_type,
        hasContent: !!module.content,
        contentPath: module.content || 'none',
        fileExists: false,
        fileSize: 0,
        contentDetails: module.contentDetails || 'none'
    };
    if (module.content && module.content_type !== 'text content' && module.content_type !== 'article') {
        try {
            if (fs.existsSync(module.content)) {
                contentInfo.fileExists = true;
                const stats = fs.statSync(module.content);
                contentInfo.fileSize = stats.size;
            }
        }
        catch (error) {
            console.log('File check error:', error);
        }
    }
    res.json({ success: true, data: contentInfo });
}));
router.put('/modules/:moduleId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), upload_1.default.any(), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const moduleId = req.params.moduleId;
    let module = await database.get(moduleId);
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }
    const { courseId, title, description, content_type, duration, isMandatory, order, content_text, contentItems } = req.body;
    let content = module.content;
    if (content_type === 'text content') {
        if (content_text) {
            content = content_text;
        }
    }
    else if (req.files && ((Array.isArray(req.files) && req.files.length > 0) || (!Array.isArray(req.files) && 'content_file' in req.files))) {
        let file;
        if (Array.isArray(req.files)) {
            file = req.files[0];
        }
        else {
            const filesObj = req.files;
            file = Array.isArray(filesObj['content_file']) ? filesObj['content_file'][0] : filesObj['content_file'];
        }
        content = file.path || file.filename || '';
    }
    let parsedContentItems = module.contentItems || [];
    if (contentItems) {
        try {
            parsedContentItems = JSON.parse(contentItems);
        }
        catch (e) {
            console.warn('Failed to parse contentItems:', e);
        }
    }
    const updatedModule = {
        ...module,
        type: 'module',
        course: courseId ?? module.course,
        courseId: courseId ?? module.courseId,
        title: title ?? module.title,
        description: description ?? module.description,
        content_type: content_type ?? module.content_type,
        content,
        contentItems: parsedContentItems,
        duration: duration ?? module.duration,
        isMandatory: isMandatory !== undefined ? (isMandatory === 'true' || isMandatory === true) : module.isMandatory,
        order: order !== undefined ? Number(order) : module.order
    };
    const result = await database.insert(updatedModule);
    res.json({ success: true, message: 'Module updated', data: { module: result } });
}));
router.delete('/modules/:moduleId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const module = await database.get(req.params.moduleId);
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }
    await database.destroy(req.params.moduleId, module._rev);
    res.json({ success: true, message: 'Module deleted' });
}));
router.get('/questions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        const { course, module } = req.query;
        console.log('🔍 Questions endpoint called, filters:', { course, module });
        const result = await database.list({ include_docs: true });
        let questions = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'question');
        if (course) {
            questions = questions.filter((question) => question.course === course);
        }
        if (module) {
            questions = questions.filter((question) => question.module === module);
        }
        console.log('❓ Total questions found:', questions.length);
        res.json({ success: true, data: { questions } });
    }
    catch (error) {
        console.error('Error fetching questions:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
}));
router.post('/questions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('assessment').isInt().withMessage('Assessment is required and must be an integer'),
    (0, express_validator_1.body)('course').trim().notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('module').trim().notEmpty().withMessage('Module ID is required'),
    (0, express_validator_1.body)('question').trim().notEmpty().withMessage('Question text is required'),
    (0, express_validator_1.body)('question_type').isIn(['Multiple Choice', 'True/False', 'Short Answer', 'Essay']).withMessage('Invalid question type'),
    (0, express_validator_1.body)('options').isArray().withMessage('Options must be an array'),
    (0, express_validator_1.body)('correct_answer').trim().notEmpty().withMessage('Correct answer is required'),
    (0, express_validator_1.body)('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    (0, express_validator_1.body)('order').isInt({ min: 1 }).withMessage('Order is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { assessment, course, module, question, question_type, options, correct_answer, points, order } = req.body;
    const questionId = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newQuestion = await database.insert({
        _id: questionId,
        type: 'question',
        assessment,
        course,
        module,
        question,
        question_type,
        options,
        correct_answer,
        points,
        order
    });
    res.status(201).json({ success: true, message: 'Question created', data: { question: newQuestion } });
}));
router.get('/questions/:questionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const question = await database.get(req.params.questionId);
    if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: { question } });
}));
router.patch('/questions/:questionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('assessment').optional().isInt().withMessage('Assessment must be an integer'),
    (0, express_validator_1.body)('course').optional().trim().notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('module').optional().trim().notEmpty().withMessage('Module ID is required'),
    (0, express_validator_1.body)('question').optional().trim().notEmpty().withMessage('Question text is required'),
    (0, express_validator_1.body)('question_type').optional().isIn(['Multiple Choice', 'True/False', 'Short Answer', 'Essay']).withMessage('Invalid question type'),
    (0, express_validator_1.body)('options').optional().isArray().withMessage('Options must be an array'),
    (0, express_validator_1.body)('correct_answer').optional().trim().notEmpty().withMessage('Correct answer is required'),
    (0, express_validator_1.body)('points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    (0, express_validator_1.body)('order').optional().isInt({ min: 1 }).withMessage('Order is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const question = await database.get(req.params.questionId);
    if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
    }
    const updates = req.body;
    const updatedQuestion = await database.insert({ ...question, ...updates });
    res.json({ success: true, message: 'Question updated', data: { question: updatedQuestion } });
}));
router.delete('/questions/:questionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const question = await database.get(req.params.questionId);
    if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await database.destroy(req.params.questionId, question._rev);
    res.json({ success: true, message: 'Question deleted' });
}));
router.get('/progress', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin', 'instructor'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { user, course, module } = req.query;
    const allDocsResult = await database.list({ include_docs: true });
    let progress = allDocsResult.rows
        .map((row) => row.doc)
        .filter((doc) => doc && doc.type === 'progress');
    if (user) {
        progress = progress.filter((doc) => doc.user === user);
    }
    if (course) {
        progress = progress.filter((doc) => doc.course === course);
    }
    if (module) {
        progress = progress.filter((doc) => doc.module === module);
    }
    res.json({ success: true, data: { progress } });
}));
router.post('/user-progress', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('user_id').notEmpty().withMessage('user_id is required'),
    (0, express_validator_1.body)('course_id').notEmpty().withMessage('course_id is required'),
    (0, express_validator_1.body)('module_id').notEmpty().withMessage('module_id is required'),
    (0, express_validator_1.body)('progress_percentage').isNumeric().withMessage('Progress percentage must be a number'),
    (0, express_validator_1.body)('is_active').isBoolean().withMessage('is_active must be a boolean'),
    (0, express_validator_1.body)('completed').isBoolean().withMessage('completed must be a boolean')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { user_id, course_id, module_id, progress_percentage, is_active, completed } = req.body;
    const uniqueId = `userprogress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let userProgress = await database.insert({
        _id: uniqueId,
        type: 'user-progress',
        user_id: user_id,
        course_id: course_id.toString(),
        module_id: module_id.toString(),
        progress_percentage: Number(progress_percentage),
        is_active: Boolean(is_active),
        completed: Boolean(completed)
    });
    res.status(201).json({ success: true, message: 'Progress saved', data: { userProgress } });
}));
router.get('/user-progress/:userProgressId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    let userProgress = await database.get(req.params.userProgressId);
    if (!userProgress) {
        return res.status(404).json({ success: false, message: 'User progress not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && userProgress.user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: { userProgress } });
}));
router.delete('/user-progress/:userProgressId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    let userProgress = await database.get(req.params.userProgressId);
    if (!userProgress) {
        return res.status(404).json({ success: false, message: 'User progress not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && userProgress.user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await database.destroy(req.params.userProgressId, userProgress._rev);
    res.json({ success: true, message: 'User progress deleted' });
}));
router.get('/user/:userId/stats', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    console.log('📊 Stats endpoint called for user:', userId, 'by user:', req.user?._id);
    console.log('🔍 Request user object:', {
        _id: req.user?._id,
        role: req.user?.role,
        email: req.user?.email
    });
    if (req.user?._id.toString() !== userId && req.user?.role !== 'admin') {
        console.log('❌ Authorization failed - user requesting:', req.user?._id, 'for userId:', userId);
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    try {
        const database = await ensureDb();
        let user;
        try {
            user = await database.get(userId);
            console.log('✅ User found in database:', {
                _id: user._id,
                email: user.email || 'no email',
                role: user.role || 'no role'
            });
        }
        catch (err) {
            console.error('❌ Error fetching user for stats:', err instanceof Error ? err.message : 'Unknown error');
            console.log('🔍 User ID being searched:', userId);
            if (err instanceof Error && 'error' in err && err.error === 'not_found') {
                console.log('🔍 User not found in database. This might be a new user who hasn\'t been created in the database yet.');
                return res.json({
                    success: true,
                    data: {
                        completedCourses: 0,
                        totalCourses: 0,
                        certificates: 0,
                        assessmentsCompleted: 0,
                        learningPathProgress: 0,
                        peerLearningSessions: 0,
                        jobApplications: 0
                    },
                    message: 'New user - returning default stats'
                });
            }
            console.warn('⚠️ Database error, returning zero stats');
            return res.json({
                success: true,
                data: {
                    completedCourses: 0,
                    totalCourses: 0,
                    certificates: 0,
                    assessmentsCompleted: 0,
                    learningPathProgress: 0,
                    peerLearningSessions: 0,
                    jobApplications: 0
                },
                message: 'Database error - returning default stats'
            });
        }
        const enrolledCourses = user.enrolledCourses || [];
        const totalCourses = enrolledCourses.length;
        console.log('User enrolled courses count:', totalCourses);
        let completedCourses = 0;
        let assessmentsCompleted = 0;
        let certificates = 0;
        let learningPathProgress = 0;
        try {
            if (enrolledCourses.length > 0) {
                const allProgressResult = await database.list({ include_docs: true });
                const userProgress = allProgressResult.rows
                    .map((row) => row.doc)
                    .filter((doc) => doc && doc.type === 'user-progress' && doc.user_id === userId && doc.completed === true);
                completedCourses = userProgress.length;
                const allAssessmentResult = await database.list({ include_docs: true });
                const userAssessments = allAssessmentResult.rows
                    .map((row) => row.doc)
                    .filter((doc) => doc && doc.type === 'user_assessment' && doc.user === userId && doc.completed === true);
                assessmentsCompleted = userAssessments.length;
                const allCertificateResult = await database.list({ include_docs: true });
                const userCertificates = allCertificateResult.rows
                    .map((row) => row.doc)
                    .filter((doc) => doc && doc.type === 'certificate' && doc.student === userId);
                certificates = userCertificates.length;
                if (totalCourses > 0) {
                    learningPathProgress = Math.floor((completedCourses / totalCourses) * 100);
                }
            }
            else {
                completedCourses = 0;
                assessmentsCompleted = 0;
                certificates = 0;
                learningPathProgress = 0;
            }
            console.log('Real stats calculated:', {
                totalCourses,
                completedCourses,
                assessmentsCompleted,
                certificates,
                learningPathProgress
            });
        }
        catch (statsError) {
            console.warn('Error calculating real stats, using zero values:', statsError);
            completedCourses = 0;
            assessmentsCompleted = 0;
            certificates = 0;
            learningPathProgress = 0;
        }
        const peerLearningSessions = 0;
        const jobApplications = 0;
        console.log('Stats calculated successfully:', {
            totalCourses,
            completedCourses,
            learningPathProgress
        });
        res.json({
            success: true,
            data: {
                completedCourses,
                totalCourses,
                certificates,
                assessmentsCompleted,
                learningPathProgress,
                peerLearningSessions,
                jobApplications
            }
        });
    }
    catch (error) {
        console.error('Error in stats endpoint:', error instanceof Error ? error.message : 'Unknown error');
        res.json({
            success: true,
            data: {
                completedCourses: 0,
                totalCourses: 0,
                certificates: 0,
                assessmentsCompleted: 0,
                learningPathProgress: 0,
                peerLearningSessions: 0,
                jobApplications: 0
            }
        });
    }
}));
router.get('/:courseId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const courseId = req.params['courseId'];
        console.log('🔍 Fetching course with ID:', courseId);
        const database = await ensureDb();
        let course;
        try {
            course = await database.get(courseId);
            console.log('✅ Course found:', course ? course.title : 'No course found');
        }
        catch (dbError) {
            console.error('❌ Error fetching course from database:', dbError instanceof Error ? dbError.message : 'Unknown error');
            if (dbError instanceof Error && 'error' in dbError && dbError.error === 'not_found') {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch course from database'
            });
        }
        let modules = [];
        try {
            console.log('🔧 Fetching modules for course:', courseId);
            const allDocsResult = await database.list({ include_docs: true });
            const allModules = allDocsResult.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'module' &&
                (doc.course === courseId || doc.courseId === courseId));
            modules = allModules.sort((a, b) => (a.order || 0) - (b.order || 0));
            console.log('📚 Found', modules.length, 'modules for course');
            const allDocs = allDocsResult.rows.map((row) => row.doc);
            for (const module of modules) {
                const assessments = allDocs.filter((doc) => doc && doc.type === 'assessment' && doc.moduleId === module._id);
                module.assessments = assessments.map((assessment) => ({
                    _id: assessment._id,
                    title: assessment.title,
                    description: assessment.description,
                    totalPoints: assessment.totalPoints,
                    timeLimit: assessment.timeLimit,
                    dueDate: assessment.dueDate,
                    isPublished: assessment.isPublished,
                    isActive: assessment.isActive
                }));
                const quizzes = allDocs.filter((doc) => doc && doc.type === 'quiz' && doc.moduleId === module._id);
                module.quizzes = quizzes.map((quiz) => ({
                    _id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    totalPoints: quiz.totalPoints,
                    duration: quiz.duration,
                    dueDate: quiz.dueDate,
                    isPublished: quiz.isPublished,
                    isActive: quiz.isActive,
                    questions: quiz.questions || []
                }));
                const discussions = allDocs.filter((doc) => doc && doc.type === 'discussion' && doc.moduleId === module._id);
                module.discussions = discussions.map((discussion) => ({
                    _id: discussion._id,
                    title: discussion.title,
                    content: discussion.content,
                    createdAt: discussion.createdAt,
                    updatedAt: discussion.updatedAt
                }));
                console.log(`📚 Module ${module.title}: ${module.assessments.length} assessments, ${module.quizzes.length} quizzes, ${module.discussions.length} discussions`);
                console.log(`📚 Module contentItems:`, module.contentItems ? module.contentItems.length : 'undefined', module.contentItems);
            }
        }
        catch (moduleError) {
            console.error('❌ Error fetching modules:', moduleError instanceof Error ? moduleError.message : 'Unknown error');
            modules = [];
        }
        course.modules = modules;
        res.json({
            success: true,
            data: {
                course: course
            }
        });
    }
    catch (error) {
        console.error('Error fetching course:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ success: false, message: 'Failed to fetch course' });
    }
}));
router.post('/submissions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user', 'instructor'), upload_1.default.any(), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { assessmentId, courseId, moduleId, submissionType, submissionText, submissionLink } = req.body;
        const userId = req.user?.id || req.user?._id;
        const files = req.files;
        console.log('🔍 User object from auth middleware:', req.user);
        console.log('📝 Assignment submission received:', {
            assessmentId,
            courseId,
            moduleId,
            submissionType,
            userId,
            hasFile: files && files.length > 0,
            submissionText,
            submissionLink
        });
        if (!assessmentId || !courseId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: 'Assessment ID, Course ID, and Module ID are required'
            });
        }
        const database = await ensureDb();
        const existingSubmissions = await database.find({
            selector: {
                type: 'assignment_submission',
                userId,
                assessmentId
            }
        });
        if (existingSubmissions.docs.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Assignment has already been submitted'
            });
        }
        const submissionDoc = {
            type: 'assignment_submission',
            userId,
            assessmentId,
            courseId,
            moduleId,
            submissionType,
            submissionText: submissionText || '',
            submissionLink: submissionLink || '',
            submittedAt: new Date(),
            status: 'submitted',
            grade: null,
            feedback: null,
            createdAt: new Date()
        };
        if (files && files.length > 0) {
            const uploadedFile = files[0];
            submissionDoc.filePath = uploadedFile.path;
            submissionDoc.fileName = uploadedFile.originalname;
            submissionDoc.fileSize = uploadedFile.size;
        }
        const savedSubmission = await database.insert(submissionDoc);
        console.log('✅ Assignment submission saved:', savedSubmission);
        res.json({
            success: true,
            message: 'Assignment submitted successfully',
            data: {
                submissionId: savedSubmission.id,
                submittedAt: submissionDoc.submittedAt,
                status: submissionDoc.status
            }
        });
    }
    catch (error) {
        console.error('Error submitting assignment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Failed to submit assignment',
            error: errorMessage
        });
    }
}));
router.get('/submissions/:submissionId/test', (req, res) => {
    console.log('🧪 TEST ROUTE HIT - Submission ID:', req.params.submissionId);
    res.json({ success: true, message: 'Test route works', submissionId: req.params.submissionId });
});
router.get('/test-simple', (req, res) => {
    console.log('🔍 SIMPLE TEST ROUTE HIT');
    res.json({ message: 'Simple test route working' });
});
router.get('/submissions/:submissionId/download', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('📁 DOWNLOAD ROUTE HIT - Submission ID:', req.params.submissionId);
    console.log('📁 Request URL:', req.originalUrl);
    console.log('📁 Request method:', req.method);
    try {
        const { submissionId } = req.params;
        const database = await ensureDb();
        console.log('📁 File view request for submission:', submissionId);
        const submission = await database.get(submissionId);
        console.log('📁 Found submission:', submission);
        if (!submission || submission.type !== 'assignment_submission') {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        if (submission.submissionType !== 'file' || !submission.filePath) {
            return res.status(400).json({
                success: false,
                message: 'This submission does not contain a file'
            });
        }
        console.log('📁 File path:', submission.filePath);
        console.log('📁 File name:', submission.fileName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${submission.fileName || 'submission'}"`);
        const fs = require('fs');
        const path = require('path');
        const filePath = submission.filePath;
        console.log('📁 Attempting to serve file:', filePath);
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found at path:', filePath);
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
    catch (error) {
        console.error('❌ Error viewing submission file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to view file',
            error: error.message
        });
    }
}));
router.put('/submissions/:submissionId/grade', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;
        const database = await ensureDb();
        const existingSubmission = await database.get(submissionId);
        const updatedSubmission = {
            ...existingSubmission,
            grade,
            feedback: feedback || '',
            gradedAt: new Date(),
            status: 'graded'
        };
        await database.put(updatedSubmission);
        res.json({
            success: true,
            message: 'Submission graded successfully',
            data: {
                submissionId,
                grade,
                feedback
            }
        });
    }
    catch (error) {
        console.error('Error grading submission:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Failed to grade submission',
            error: errorMessage
        });
    }
}));
router.get('/test-route', (req, res) => {
    console.log('🔍 TEST ROUTE HIT');
    res.json({ message: 'Test route working' });
});
router.get('/:courseId/submissions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user', 'instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        console.log('📋 GET submissions endpoint called');
        const { courseId } = req.params;
        const { assessmentId } = req.query;
        const userId = req.user?.id || req.user?._id;
        const userRole = req.user?.role;
        console.log('📋 Submissions GET request:', {
            courseId,
            assessmentId,
            userId,
            userRole,
            userObject: req.user
        });
        console.log('📋 About to get database...');
        const database = await ensureDb();
        console.log('📋 Database obtained successfully');
        let selector = {
            type: 'assignment_submission',
            courseId
        };
        if (userRole === 'refugee' || userRole === 'user') {
            selector.userId = userId;
        }
        if (assessmentId) {
            selector.assessmentId = assessmentId;
        }
        console.log('📋 Database selector:', selector);
        const submissions = await database.find({
            selector
        });
        console.log('📋 Raw submissions found:', submissions.docs.length);
        console.log('📋 Raw submissions data:', submissions.docs);
        console.log('📋 Starting enrichment process...');
        const enrichedSubmissions = submissions.docs.map((submission) => {
            return {
                ...submission,
                studentName: `User ${submission.userId}`,
                assessmentTitle: `Assessment ${submission.assessmentId}`,
                student: {
                    firstName: `User ${submission.userId}`,
                    lastName: ''
                }
            };
        });
        console.log('📋 Enrichment completed, returning', enrichedSubmissions.length, 'submissions');
        console.log('📋 Final enriched submissions being returned:', enrichedSubmissions.length);
        res.json({
            success: true,
            data: {
                submissions: enrichedSubmissions
            }
        });
    }
    catch (error) {
        console.error('❌ CRITICAL ERROR in GET submissions:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions',
            error: errorMessage
        });
    }
}));
router.all('*', (req, res) => {
    console.log('🔍 CATCH-ALL ROUTE HIT:', req.method, req.originalUrl);
    res.status(404).json({ message: 'Route not found in course routes', path: req.originalUrl });
});
exports.default = router;
//# sourceMappingURL=course.routes.js.map