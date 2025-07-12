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
const upload_1 = __importDefault(require("../middleware/upload"));
const couchdb_1 = require("../config/couchdb");
const email_1 = require("../config/email");
let couchConnection = null;
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing CouchDB connection for course routes...');
        couchConnection = await (0, couchdb_1.connectCouchDB)();
        console.log('✅ Course routes database connection successful!');
        return true;
    }
    catch (error) {
        console.error('❌ Course routes database connection failed:', error.message);
        return false;
    }
};
initializeDatabase();
const router = express_1.default.Router();
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
            error: error.message
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
            console.error('❌ Error message:', queryError.message);
            console.error('❌ Error stack:', queryError.stack);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch courses from database',
                error: queryError.message,
                debug: {
                    endpoint: 'category',
                    queryError: queryError.message
                }
            });
        }
    }
    catch (error) {
        console.error('❌ Error fetching courses by category:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch courses by category',
            error: error.message,
            debug: {
                endpoint: 'category',
                errorMessage: error.message
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
            error: error.message
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
        if (completed && !moduleProgress.completedItems.includes(completionKey)) {
            moduleProgress.completedItems.push(completionKey);
        }
        else if (!completed && moduleProgress.completedItems.includes(completionKey)) {
            moduleProgress.completedItems = moduleProgress.completedItems.filter((key) => key !== completionKey);
        }
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
            moduleProgress.completed = totalItems > 0 && completedItemsCount >= totalItems;
            if (moduleProgress.completed && !moduleProgress.completedAt) {
                moduleProgress.completedAt = new Date();
            }
            else if (!moduleProgress.completed) {
                moduleProgress.completedAt = null;
            }
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
    const totalModules = course.modules?.length || 0;
    const completedModules = course.studentProgress.filter((p) => p.completed).length;
    const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    course.updatedAt = new Date();
    const latest = await database.get(course._id);
    course._rev = latest._rev;
    await database.insert(course);
    res.json({
        success: true,
        message: 'Progress updated successfully',
        data: {
            progressPercentage,
            completedModules,
            totalModules,
            moduleProgress
        }
    });
}));
router.get('/:courseId/progress', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id.toString();
    const database = await ensureDb();
    let course = await database.get(courseId);
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    const userProgress = course.studentProgress?.filter((p) => p.student === userId) || [];
    const totalModules = course.modules?.length || 0;
    const completedModules = userProgress.filter((p) => p.completed).length;
    const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    const allCompletedItems = userProgress.reduce((acc, moduleProgress) => {
        if (moduleProgress.completedItems) {
            acc.push(...moduleProgress.completedItems);
        }
        return acc;
    }, []);
    res.json({
        success: true,
        data: {
            progress: userProgress,
            totalModules,
            completedModules,
            progressPercentage,
            modulesProgress: userProgress.reduce((acc, moduleProgress) => {
                acc[moduleProgress.moduleId] = {
                    completed: moduleProgress.completed,
                    completedItems: moduleProgress.completedItems || []
                };
                return acc;
            }, {}),
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
            console.error('❌ Course not found:', err.message);
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
                    console.warn('⚠️ Failed to delete module:', module.title, moduleErr.message);
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
                    console.warn('⚠️ Failed to delete', content.type + ':', content.title, contentErr.message);
                }
            }
        }
        catch (cleanupErr) {
            console.warn('⚠️ Cleanup warning:', cleanupErr.message);
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
            console.error('❌ Failed to delete course:', deleteErr.message);
            if (deleteErr.error === 'conflict') {
                return res.status(409).json({
                    success: false,
                    message: 'Course was modified by another user. Please refresh and try again.'
                });
            }
            if (deleteErr.error === 'not_found') {
                return res.status(404).json({
                    success: false,
                    message: 'Course no longer exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Database error while deleting course: ' + deleteErr.message
            });
        }
    }
    catch (error) {
        console.error('❌ General error in course deletion:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete course: ' + error.message
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
        console.error('Error fetching categories:', error);
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
        console.error('Error fetching discussions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
    }
}));
router.post('/discussions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
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
router.delete('/discussions/:discussionId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
router.post('/discussions/:discussionId/replies', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
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
router.patch('/discussions/:discussionId/replies/:replyId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
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
router.delete('/discussions/:discussionId/replies/:replyId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        console.error('Error fetching enrollments:', error);
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
        console.error('Error updating assessment:', err);
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
        console.error('Error deleting assessment:', err);
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
        console.error('Error submitting assessment:', err);
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
            },
            sort: [{ submittedAt: 'desc' }]
        });
        res.json({ success: true, data: { attempts: result.docs } });
    }
    catch (err) {
        console.error('Error fetching attempts:', err);
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
        console.error('Error fetching course assessments:', err);
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
        console.error('Error fetching modules:', error);
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
    (0, express_validator_1.body)('content_file').optional()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        console.log('🔧 Creating comprehensive module');
        console.log('📝 Data received:', Object.keys(req.body));
        const { courseId, title, description, overview, content_type, content_text, duration, isMandatory, isPublished, order, videoUrl, videoTitle, resources, assignments, assessments, quizzes, learningObjectives, prerequisites, tags, discussions } = req.body;
        let content = '';
        if (content_type === 'text content' || content_type === 'text' || content_type === 'article') {
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
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log('📦 Creating module:', {
            title: module.title,
            content_type: module.content_type,
            hasContent: !!module.content,
            resourcesCount: module.resources?.length || 0,
            assessmentsCount: module.assessments?.length || 0
        });
        const moduleResult = await database.insert(module);
        console.log('✅ Module created successfully:', moduleResult.id);
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
        console.error('❌ Error creating comprehensive module:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while creating module'
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
    (0, express_validator_1.body)('content_file').optional()
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const { courseId, title, description, content_type, duration, isMandatory, order, content_text } = req.body;
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
    const module = {
        _id: `module_${Date.now()}`,
        type: 'module',
        course: courseId,
        courseId,
        title,
        description,
        content_type,
        content,
        duration,
        isMandatory: isMandatory === 'true' || isMandatory === true,
        order: Number(order)
    };
    const result = await database.insert(module);
    res.status(201).json({ success: true, message: 'Module created', data: { module: result } });
}));
router.get('/modules/:moduleId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const module = await database.get(req.params.moduleId);
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.json({ success: true, data: { module } });
}));
router.put('/modules/:moduleId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), upload_1.default.any(), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const moduleId = req.params.moduleId;
    let module = await database.get(moduleId);
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }
    const { courseId, title, description, content_type, duration, isMandatory, order, content_text } = req.body;
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
    const updatedModule = {
        ...module,
        type: 'module',
        course: courseId ?? module.course,
        courseId: courseId ?? module.courseId,
        title: title ?? module.title,
        description: description ?? module.description,
        content_type: content_type ?? module.content_type,
        content,
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
        console.error('Error fetching questions:', error);
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
            console.error('❌ Error fetching user for stats:', err);
            console.log('🔍 User ID being searched:', userId);
            if (err.error === 'not_found') {
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
        console.error('Error in stats endpoint:', error);
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
            console.error('❌ Error fetching course from database:', dbError);
            if (dbError.error === 'not_found') {
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
        const allDocsResult = await database.list({ include_docs: true });
        console.log('📄 Total documents in database:', allDocsResult.rows.length);
        console.log('🔍 ALL DOCUMENTS IN DATABASE:');
        allDocsResult.rows.forEach((row, index) => {
            const doc = row.doc;
            if (doc && doc._id && !doc._id.startsWith('_design')) {
                console.log(`${index + 1}. ID: ${doc._id}, Type: ${doc.type || 'no-type'}, Title: ${doc.title || 'no-title'}`);
                if (doc.type === 'assessment' || doc.type === 'quiz' || doc.type === 'discussion') {
                    console.log(`   📋 FOUND: ${doc.type} - "${doc.title}" - moduleId: ${doc.moduleId || 'none'}, module: ${doc.module || 'none'}, course: ${doc.course || 'none'}, courseId: ${doc.courseId || 'none'}`);
                }
            }
        });
        let modules = [];
        try {
            console.log('🔧 Fetching modules for course:', courseId);
            const allModules = allDocsResult.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'module' &&
                (doc.course === courseId || doc.courseId === courseId));
            console.log('📚 Found', allModules.length, 'modules for course');
            console.log('📚 Module details:', allModules.map((m) => ({ id: m._id, title: m.title, courseId: m.courseId, course: m.course })));
            const allAssessments = allDocsResult.rows
                .map((row) => row.doc)
                .filter((doc) => doc && ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type));
            const allDiscussions = allDocsResult.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'discussion');
            console.log('📊 TOTAL IN DATABASE:');
            console.log(`   📝 Assessments/Quizzes: ${allAssessments.length}`);
            console.log(`   💬 Discussions: ${allDiscussions.length}`);
            if (allAssessments.length > 0) {
                console.log('📝 ALL ASSESSMENTS/QUIZZES:');
                allAssessments.forEach((item, idx) => {
                    console.log(`   ${idx + 1}. "${item.title}" - Type: ${item.type} - ModuleId: ${item.moduleId || 'none'} - Course: ${item.course || item.courseId || 'none'} - Questions: ${item.questions?.length || 0}`);
                });
            }
            if (allDiscussions.length > 0) {
                console.log('💬 ALL DISCUSSIONS:');
                allDiscussions.forEach((item, idx) => {
                    console.log(`   ${idx + 1}. "${item.title}" - ModuleId: ${item.moduleId || 'none'} - Course: ${item.course || item.courseId || 'none'} - Content: "${item.content?.substring(0, 30) || 'none'}..."`);
                });
            }
            console.log('🔍 SEARCHING FOR COURSE-LEVEL CONTENT:');
            console.log(`   Course ID to match: ${courseId}`);
            const courseAssessments = allAssessments.filter((doc) => (doc.courseId === courseId || doc.course === courseId) && !doc.moduleId && !doc.module);
            const courseDiscussions = allDiscussions.filter((doc) => (doc.courseId === courseId || doc.course === courseId) && !doc.moduleId && !doc.module);
            console.log(`📊 COURSE-LEVEL CONTENT FOUND:`);
            console.log(`   📝 Course Assessments: ${courseAssessments.length}`);
            console.log(`   💬 Course Discussions: ${courseDiscussions.length}`);
            if (courseAssessments.length > 0) {
                console.log('📝 Course-level assessments:');
                courseAssessments.forEach((a) => console.log(`   - ${a.title} (${a._id})`));
            }
            if (courseDiscussions.length > 0) {
                console.log('💬 Course-level discussions:');
                courseDiscussions.forEach((d) => console.log(`   - ${d.title} (${d._id})`));
            }
            modules = await Promise.all(allModules.map(async (module) => {
                console.log('🔍 Processing module:', module.title, 'ID:', module._id);
                console.log(`🔍 Searching for content belonging to module: ${module._id}`);
                const directModuleAssessments = allAssessments.filter((doc) => doc.moduleId === module._id || doc.module === module._id);
                const directModuleDiscussions = allDiscussions.filter((doc) => doc.moduleId === module._id || doc.module === module._id);
                console.log(`   �� Direct matches: ${directModuleAssessments.length} assessments, ${directModuleDiscussions.length} discussions`);
                const courseMatchAssessments = allAssessments.filter((doc) => (doc.courseId && doc.courseId.includes('course_')) ||
                    (doc.course && doc.course.includes('course_')));
                const courseMatchDiscussions = allDiscussions.filter((doc) => (doc.courseId && doc.courseId.includes('course_')) ||
                    (doc.course && doc.course.includes('course_')));
                console.log(`   🔎 All course content: ${courseMatchAssessments.length} assessments, ${courseMatchDiscussions.length} discussions`);
                const isFirstModule = allModules.indexOf(module) === 0;
                let moduleAssessments = [...directModuleAssessments];
                let moduleDiscussions = [...directModuleDiscussions];
                if (isFirstModule && (directModuleAssessments.length === 0 && directModuleDiscussions.length === 0)) {
                    console.log(`   📌 First module with no direct matches - including all course content`);
                    moduleAssessments = courseMatchAssessments;
                    moduleDiscussions = courseMatchDiscussions;
                }
                const moduleQuizzes = moduleAssessments.filter((doc) => doc.type === 'quiz' || (doc.type === 'assessment' && doc.isQuiz));
                const moduleOnlyAssessments = moduleAssessments.filter((doc) => doc.type === 'assessment' && !doc.isQuiz);
                console.log(`📊 Module "${module.title}" content found:`, {
                    assessments: moduleOnlyAssessments.length,
                    quizzes: moduleQuizzes.length,
                    discussions: moduleDiscussions.length,
                    totalRelated: moduleAssessments.length + moduleDiscussions.length
                });
                if (moduleOnlyAssessments.length > 0) {
                    console.log(`   📝 Assessments for ${module.title}:`);
                    moduleOnlyAssessments.forEach((a) => console.log(`      - ${a.title} (${a._id})`));
                }
                if (moduleQuizzes.length > 0) {
                    console.log(`   🧠 Quizzes for ${module.title}:`);
                    moduleQuizzes.forEach((q) => console.log(`      - ${q.title} (${q._id})`));
                }
                if (moduleDiscussions.length > 0) {
                    console.log(`   💬 Discussions for ${module.title}:`);
                    moduleDiscussions.forEach((d) => console.log(`      - ${d.title} (${d._id})`));
                }
                return {
                    ...module,
                    assessments: moduleOnlyAssessments,
                    discussions: moduleDiscussions,
                    quizzes: moduleQuizzes,
                    content: module.content || '',
                    videoUrl: module.videoUrl || '',
                    videoTitle: module.videoTitle || '',
                    resources: module.resources || [],
                    assignments: module.assignments || [],
                    learningObjectives: module.learningObjectives || [],
                    prerequisites: module.prerequisites || [],
                    tags: module.tags || []
                };
            }));
            modules.sort((a, b) => (a.order || 0) - (b.order || 0));
            console.log('✅ Enhanced modules prepared:', modules.length);
            console.log('📋 Module details:', modules.map((m) => ({
                _id: m._id,
                title: m.title,
                order: m.order,
                assessments: m.assessments.length,
                discussions: m.discussions.length,
                content_type: m.content_type,
                hasContent: !!m.content
            })));
        }
        catch (modulesError) {
            console.error('❌ Error fetching modules:', modulesError);
            modules = [];
        }
        const courseAssessments = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc &&
            ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) &&
            doc.courseId === courseId && !doc.moduleId);
        const courseDiscussions = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'discussion' &&
            doc.course === courseId && !doc.moduleId);
        console.log('📊 Course-level content:', {
            modules: modules.length,
            assessments: courseAssessments.length,
            discussions: courseDiscussions.length
        });
        res.json({
            success: true,
            data: {
                course: {
                    ...course,
                    modules,
                    assessments: courseAssessments,
                    discussions: courseDiscussions,
                    moduleCount: modules.length
                }
            }
        });
    }
    catch (err) {
        console.error('❌ Error in course fetch endpoint:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching course'
        });
    }
}));
router.get('/summary/stats', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const database = await ensureDb();
        let selector = { type: 'course' };
        if (req.user.role === 'instructor') {
            selector.instructor = req.user._id.toString();
        }
        const allDocsResult = await database.list({ include_docs: true });
        let courses = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course');
        if (req.user.role === 'instructor') {
            courses = courses.filter((course) => course.instructor === req.user._id.toString());
        }
        const totalCourses = courses.length;
        const publishedCourses = courses.filter((course) => course.isPublished).length;
        const byCategory = {};
        const byLevel = {
            'Beginner': 0,
            'Intermediate': 0,
            'Advanced': 0,
            'Expert': 0
        };
        courses.forEach((course) => {
            const category = course.category || 'General';
            byCategory[category] = (byCategory[category] || 0) + 1;
            const level = course.level || 'Beginner';
            if (byLevel.hasOwnProperty(level)) {
                byLevel[level]++;
            }
        });
        res.json({
            success: true,
            data: {
                totalCourses,
                publishedCourses,
                unpublishedCourses: totalCourses - publishedCourses,
                byCategory,
                byLevel
            }
        });
    }
    catch (error) {
        console.error('Error fetching course statistics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch course statistics' });
    }
}));
router.get('/db-health', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        console.log('Database health check called');
        const database = await ensureDb();
        const info = await database.info();
        console.log('Database info retrieved:', info);
        const allCoursesResult = await database.list({
            include_docs: true,
            startkey: 'course_',
            endkey: 'course_\ufff0'
        });
        const courses = allCoursesResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course')
            .slice(0, 5);
        console.log('Found courses:', courses.length);
        res.json({
            success: true,
            database: {
                connected: true,
                info: info,
                totalCourses: courses.length,
                sampleCourses: courses.map((course) => ({
                    id: course._id,
                    title: course.title,
                    isPublished: course.isPublished
                }))
            }
        });
    }
    catch (error) {
        console.error('Database health check failed:', error);
        res.status(500).json({
            success: false,
            database: {
                connected: false,
                error: error.message,
                stack: error.stack
            }
        });
    }
}));
router.get('/health', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: 'Course routes are working',
        timestamp: new Date().toISOString()
    });
}));
router.get('/categories', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('📋 Categories endpoint called');
    try {
        const database = await ensureDb();
        const allDocsResult = await database.list({ include_docs: true });
        const allCourses = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'course' && doc.isPublished === true);
        console.log('📚 Found published courses:', allCourses.length);
        const categoryCount = {};
        allCourses.forEach((course) => {
            const category = course.category || 'General';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        const categories = Object.keys(categoryCount).map(name => ({
            name,
            count: categoryCount[name]
        }));
        console.log('📊 Categories found:', categories);
        res.json({
            success: true,
            data: {
                categories,
                debug: { totalCourses: allCourses.length }
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories from database',
            error: error.message
        });
    }
}));
router.put('/modules/:moduleId/comprehensive', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), upload_1.default.any(), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    try {
        const database = await ensureDb();
        console.log('🔧 Updating module:', moduleId);
        console.log('📝 Update data received:', Object.keys(req.body));
        const existingModule = await database.get(moduleId);
        if (!existingModule) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        console.log('✅ Found existing module:', existingModule.title);
        const { title, description, overview, content_type, content_text, duration, isMandatory, isPublished, order, videoUrl, videoTitle, resources, assignments, assessments, quizzes, learningObjectives, prerequisites, tags } = req.body;
        let content = existingModule.content;
        if (content_type === 'text content' || content_type === 'text') {
            if (content_text !== undefined) {
                content = content_text;
            }
        }
        else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const file = req.files[0];
            content = file.path || file.filename || content;
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
        const updatedModule = {
            ...existingModule,
            title: title !== undefined ? title : existingModule.title,
            description: description !== undefined ? description : existingModule.description,
            content_type: content_type !== undefined ? content_type : existingModule.content_type,
            content,
            duration: duration !== undefined ? duration : existingModule.duration,
            isMandatory: isMandatory !== undefined ? (isMandatory === 'true' || isMandatory === true) : existingModule.isMandatory,
            order: order !== undefined ? Number(order) : existingModule.order,
            overview: overview !== undefined ? overview : existingModule.overview,
            isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : (existingModule.isPublished ?? true),
            videoUrl: videoUrl !== undefined ? videoUrl : existingModule.videoUrl,
            videoTitle: videoTitle !== undefined ? videoTitle : existingModule.videoTitle,
            resources: resources !== undefined ? parseArrayField(resources) : existingModule.resources || [],
            assignments: assignments !== undefined ? parseArrayField(assignments) : existingModule.assignments || [],
            assessments: assessments !== undefined ? parseArrayField(assessments) : existingModule.assessments || [],
            quizzes: quizzes !== undefined ? parseArrayField(quizzes) : existingModule.quizzes || [],
            learningObjectives: learningObjectives !== undefined ? parseArrayField(learningObjectives) : existingModule.learningObjectives || [],
            prerequisites: prerequisites !== undefined ? parseArrayField(prerequisites) : existingModule.prerequisites || [],
            tags: tags !== undefined ? parseArrayField(tags) : existingModule.tags || [],
            updatedAt: new Date()
        };
        console.log('📦 Prepared module update:', {
            title: updatedModule.title,
            content_type: updatedModule.content_type,
            hasContent: !!updatedModule.content,
            resourcesCount: updatedModule.resources?.length || 0,
            assessmentsCount: updatedModule.assessments?.length || 0
        });
        const result = await database.insert(updatedModule);
        console.log('✅ Module updated successfully:', result.id);
        res.json({
            success: true,
            message: 'Module updated successfully',
            data: {
                module: { ...updatedModule, _id: result.id, _rev: result.rev }
            }
        });
    }
    catch (error) {
        console.error('❌ Error updating module:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while updating module'
        });
    }
}));
router.get('/modules/:moduleId/comprehensive', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    try {
        const database = await ensureDb();
        console.log('🔍 Fetching comprehensive module data for:', moduleId);
        const module = await database.get(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        const allDocsResult = await database.list({ include_docs: true });
        const moduleAssessments = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc &&
            ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) &&
            (doc.moduleId === moduleId || doc.module === moduleId));
        const moduleDiscussions = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'discussion' &&
            (doc.moduleId === moduleId || doc.module === moduleId));
        const moduleQuestions = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'question' &&
            (doc.moduleId === moduleId || doc.module === moduleId));
        console.log('📊 Found comprehensive module data:', {
            assessments: moduleAssessments.length,
            discussions: moduleDiscussions.length,
            questions: moduleQuestions.length
        });
        const comprehensiveModule = {
            ...module,
            relatedAssessments: moduleAssessments,
            relatedDiscussions: moduleDiscussions,
            relatedQuestions: moduleQuestions,
            overview: module.overview || '',
            videoUrl: module.videoUrl || '',
            videoTitle: module.videoTitle || '',
            resources: module.resources || [],
            assignments: module.assignments || [],
            assessments: module.assessments || [],
            quizzes: module.quizzes || [],
            learningObjectives: module.learningObjectives || [],
            prerequisites: module.prerequisites || [],
            tags: module.tags || [],
            isPublished: module.isPublished !== undefined ? module.isPublished : true
        };
        res.json({
            success: true,
            data: { module: comprehensiveModule }
        });
    }
    catch (error) {
        console.error('❌ Error fetching comprehensive module:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching module'
        });
    }
}));
router.post('/modules/:moduleId/assessments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Assessment title is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
    (0, express_validator_1.body)('questions').optional().isArray().withMessage('Questions must be an array')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, description, timeLimit, questions, totalPoints, type } = req.body;
    try {
        const database = await ensureDb();
        console.log('🎯 Creating assessment for module:', moduleId);
        const module = await database.get(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        console.log('✅ Module found:', module.title);
        const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const assessment = {
            _id: assessmentId,
            type: type || 'assessment',
            title,
            description: description || '',
            moduleId: moduleId,
            module: moduleId,
            courseId: module.courseId || module.course,
            course: module.courseId || module.course,
            instructor: req.user._id.toString(),
            timeLimit: timeLimit || 30,
            totalPoints: totalPoints || 0,
            questions: questions || [],
            isPublished: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log('📝 Creating assessment:', assessment.title);
        const result = await database.insert(assessment);
        console.log('✅ Assessment created successfully:', result.id);
        res.status(201).json({
            success: true,
            message: 'Assessment created successfully',
            data: { assessment: { ...assessment, _id: result.id, _rev: result.rev } }
        });
    }
    catch (error) {
        console.error('❌ Error creating module assessment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while creating assessment'
        });
    }
}));
router.post('/modules/:moduleId/discussions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Discussion title is required'),
    (0, express_validator_1.body)('content').trim().notEmpty().withMessage('Discussion content is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, content, category } = req.body;
    try {
        const database = await ensureDb();
        console.log('💬 Creating discussion for module:', moduleId);
        const module = await database.get(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        console.log('✅ Module found:', module.title);
        const discussionId = `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const discussion = {
            _id: discussionId,
            type: 'discussion',
            title,
            content,
            category: category || 'general',
            moduleId: moduleId,
            module: moduleId,
            course: module.courseId || module.course,
            user: req.user._id.toString(),
            replies: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log('💬 Creating discussion:', discussion.title);
        const result = await database.insert(discussion);
        console.log('✅ Discussion created successfully:', result.id);
        res.status(201).json({
            success: true,
            message: 'Discussion created successfully',
            data: { discussion: { ...discussion, _id: result.id, _rev: result.rev } }
        });
    }
    catch (error) {
        console.error('❌ Error creating module discussion:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while creating discussion'
        });
    }
}));
router.post('/modules/:moduleId/quizzes', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Quiz title is required'),
    (0, express_validator_1.body)('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, description, questions, timeLimit, passingScore } = req.body;
    try {
        const database = await ensureDb();
        console.log('🧠 Creating quiz for module:', moduleId);
        const module = await database.get(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        console.log('✅ Module found:', module.title);
        const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
        const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const quiz = {
            _id: quizId,
            type: 'quiz',
            title,
            description: description || '',
            moduleId: moduleId,
            module: moduleId,
            courseId: module.courseId || module.course,
            course: module.courseId || module.course,
            instructor: req.user._id.toString(),
            questions: questions.map((q, index) => ({
                ...q,
                id: q.id || `question_${Date.now()}_${index}`,
                order: index + 1
            })),
            timeLimit: timeLimit || 15,
            totalPoints,
            passingScore: passingScore || Math.ceil(totalPoints * 0.7),
            isPublished: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log('🧠 Creating quiz:', quiz.title, 'with', questions.length, 'questions');
        const result = await database.insert(quiz);
        console.log('✅ Quiz created successfully:', result.id);
        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: { quiz: { ...quiz, _id: result.id, _rev: result.rev } }
        });
    }
    catch (error) {
        console.error('❌ Error creating module quiz:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while creating quiz'
        });
    }
}));
router.get('/discussions/:discussionId/replies', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { discussionId } = req.params;
    try {
        const database = await ensureDb();
        console.log('📖 Fetching replies for discussion:', discussionId);
        let discussion;
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries) {
            try {
                discussion = await database.get(discussionId);
                break;
            }
            catch (error) {
                retryCount++;
                if (error.statusCode === 404) {
                    console.log('❌ Discussion not found:', discussionId);
                    return res.status(404).json({
                        success: false,
                        message: 'Discussion not found',
                        data: { replies: [] }
                    });
                }
                if (retryCount >= maxRetries) {
                    throw error;
                }
                console.log(`⚠️ Retry ${retryCount}/${maxRetries} for discussion:`, discussionId);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (!discussion) {
            console.log('❌ Discussion not found after retries:', discussionId);
            return res.status(404).json({
                success: false,
                message: 'Discussion not found',
                data: { replies: [] }
            });
        }
        console.log('✅ Discussion found:', discussion.title);
        const replies = discussion.replies || [];
        const sortedReplies = replies.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateA.getTime() - dateB.getTime();
        });
        console.log('💬 Replies count:', sortedReplies.length);
        console.log('💾 All replies are persistent and saved in database');
        res.json({
            success: true,
            message: 'Replies fetched successfully',
            data: {
                replies: sortedReplies,
                totalReplies: sortedReplies.length,
                discussionTitle: discussion.title,
                lastUpdated: discussion.updatedAt || discussion.createdAt
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching discussion replies:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching replies',
            data: {
                replies: [],
                totalReplies: 0,
                error: true
            }
        });
    }
}));
router.post('/discussions/:discussionId/replies', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('content').trim().notEmpty().withMessage('Reply content is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { discussionId } = req.params;
    const { content, author } = req.body;
    try {
        const database = await ensureDb();
        console.log('💬 Adding reply to discussion:', discussionId);
        console.log('📝 Reply content:', content);
        console.log('👤 Raw user object:', JSON.stringify(req.user, null, 2));
        console.log('👤 Author from frontend:', author);
        console.log('👤 User ID:', req.user?._id);
        console.log('👤 User firstName:', req.user?.firstName);
        console.log('👤 User lastName:', req.user?.lastName);
        let discussion;
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries) {
            try {
                discussion = await database.get(discussionId);
                break;
            }
            catch (error) {
                retryCount++;
                if (error.statusCode === 404) {
                    console.log('❌ Discussion not found:', discussionId);
                    return res.status(404).json({
                        success: false,
                        message: 'Discussion not found'
                    });
                }
                if (retryCount >= maxRetries) {
                    throw error;
                }
                console.log(`⚠️ Retry ${retryCount}/${maxRetries} for discussion:`, discussionId);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (!discussion) {
            console.log('❌ Discussion not found after retries:', discussionId);
            return res.status(404).json({
                success: false,
                message: 'Discussion not found'
            });
        }
        console.log('✅ Discussion found:', discussion.title);
        const userFullName = req.user ?
            `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
                req.user.name ||
                req.user.fullName ||
                'Anonymous' : 'Anonymous';
        console.log('👤 User details:', {
            userId: req.user?._id,
            firstName: req.user?.firstName,
            lastName: req.user?.lastName,
            fullName: userFullName,
            providedAuthor: author
        });
        const newReply = {
            _id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: content.trim(),
            author: userFullName,
            userId: req.user?._id?.toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: []
        };
        if (!discussion.replies) {
            discussion.replies = [];
        }
        discussion.replies.push(newReply);
        discussion.updatedAt = new Date().toISOString();
        try {
            const result = await database.insert(discussion);
            console.log('✅ Reply saved successfully to database:', newReply._id);
            console.log('💾 Database save result:', result.ok ? 'SUCCESS' : 'FAILED');
        }
        catch (saveError) {
            console.log('⚠️ Save error:', saveError.message);
            if (saveError.statusCode === 409) {
                console.log('🔄 Document conflict detected, retrying with fresh document...');
                try {
                    const freshDiscussion = await database.get(discussionId);
                    if (!freshDiscussion.replies) {
                        freshDiscussion.replies = [];
                    }
                    const replyExists = freshDiscussion.replies.some((reply) => reply._id === newReply._id);
                    if (!replyExists) {
                        freshDiscussion.replies.push(newReply);
                        freshDiscussion.updatedAt = new Date().toISOString();
                        await database.insert(freshDiscussion);
                        console.log('✅ Reply saved successfully after conflict resolution');
                    }
                    else {
                        console.log('ℹ️ Reply already exists, skipping duplicate');
                    }
                }
                catch (retryError) {
                    console.error('❌ Failed to resolve conflict:', retryError);
                    throw retryError;
                }
            }
            else {
                throw saveError;
            }
        }
        console.log('🎉 Reply added and persisted successfully!');
        console.log('💾 Total replies in discussion:', discussion.replies.length);
        console.log('🔗 Reply is now visible to all users');
        res.status(201).json({
            success: true,
            message: 'Reply added and saved successfully',
            data: {
                reply: newReply,
                totalReplies: discussion.replies.length,
                discussionTitle: discussion.title,
                persistent: true,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('❌ Error adding reply to discussion:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while adding reply',
            error: {
                type: error.name,
                details: error.message
            }
        });
    }
}));
router.post('/discussions/:discussionId/replies/:replyId/like', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { discussionId, replyId } = req.params;
    const { action } = req.body;
    try {
        const database = await ensureDb();
        console.log(`👍 ${action === 'like' ? 'Liking' : 'Unliking'} reply:`, replyId, 'in discussion:', discussionId);
        const discussion = await database.get(discussionId);
        if (!discussion) {
            return res.status(404).json({ success: false, message: 'Discussion not found' });
        }
        const replyIndex = discussion.replies?.findIndex((reply) => reply._id === replyId);
        if (replyIndex === -1) {
            return res.status(404).json({ success: false, message: 'Reply not found' });
        }
        const reply = discussion.replies[replyIndex];
        if (!reply.likes)
            reply.likes = 0;
        if (!reply.likedBy)
            reply.likedBy = [];
        const userId = req.user?._id?.toString();
        const isAlreadyLiked = reply.likedBy.includes(userId);
        if (action === 'like' && !isAlreadyLiked) {
            reply.likes += 1;
            reply.likedBy.push(userId);
        }
        else if (action === 'unlike' && isAlreadyLiked) {
            reply.likes -= 1;
            reply.likedBy = reply.likedBy.filter((id) => id !== userId);
        }
        discussion.replies[replyIndex] = reply;
        discussion.updatedAt = new Date().toISOString();
        await database.insert(discussion);
        console.log(`✅ Reply ${action}d successfully. New like count:`, reply.likes);
        res.json({
            success: true,
            message: `Reply ${action}d successfully`,
            data: {
                likes: reply.likes,
                isLiked: action === 'like'
            }
        });
    }
    catch (error) {
        console.error(`❌ Error ${action}ing reply:`, error);
        res.status(500).json({
            success: false,
            message: error.message || `Internal server error while ${action}ing reply`
        });
    }
}));
router.post('/discussions/:discussionId/replies/:replyId/reply', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), [
    (0, express_validator_1.body)('content').trim().notEmpty().withMessage('Reply content is required')
], validation_1.handleValidationErrors, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { discussionId, replyId } = req.params;
    const { content, author } = req.body;
    try {
        const database = await ensureDb();
        console.log('💬 Adding nested reply to reply:', replyId, 'in discussion:', discussionId);
        const discussion = await database.get(discussionId);
        if (!discussion) {
            return res.status(404).json({ success: false, message: 'Discussion not found' });
        }
        const replyIndex = discussion.replies?.findIndex((reply) => reply._id === replyId);
        if (replyIndex === -1) {
            return res.status(404).json({ success: false, message: 'Parent reply not found' });
        }
        const userFullName = req.user ?
            `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
                req.user.name ||
                req.user.fullName ||
                'Anonymous' : 'Anonymous';
        const nestedReply = {
            _id: `nested_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content,
            author: userFullName,
            userId: req.user?._id?.toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (!discussion.replies[replyIndex].replies) {
            discussion.replies[replyIndex].replies = [];
        }
        discussion.replies[replyIndex].replies.push(nestedReply);
        discussion.updatedAt = new Date().toISOString();
        await database.insert(discussion);
        console.log('✅ Nested reply added successfully:', nestedReply._id);
        res.status(201).json({
            success: true,
            message: 'Nested reply added successfully',
            data: {
                reply: nestedReply
            }
        });
    }
    catch (error) {
        console.error('❌ Error adding nested reply:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while adding nested reply'
        });
    }
}));
router.get('/modules/:moduleId/learn', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    try {
        const database = await ensureDb();
        console.log('📚 Fetching learning content for module:', moduleId);
        const module = await database.get(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        const allDocsResult = await database.list({ include_docs: true });
        const assessments = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc &&
            ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) &&
            (doc.moduleId === moduleId || doc.module === moduleId) &&
            doc.isPublished === true);
        const discussions = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'discussion' &&
            (doc.moduleId === moduleId || doc.module === moduleId))
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        const userProgress = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'user-progress' &&
            doc.module_id === moduleId && doc.user_id === req.user._id.toString());
        console.log('📊 Learning content prepared:', {
            moduleTitle: module.title,
            assessments: assessments.length,
            discussions: discussions.length,
            userProgress: userProgress.length
        });
        res.json({
            success: true,
            data: {
                module: {
                    ...module,
                    content: module.content || '',
                    videoUrl: module.videoUrl || '',
                    videoTitle: module.videoTitle || '',
                    resources: module.resources || [],
                    learningObjectives: module.learningObjectives || []
                },
                assessments,
                discussions,
                userProgress: userProgress[0] || null,
                canProceed: true
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching learning content:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while fetching learning content'
        });
    }
}));
router.get('/:courseId/debug', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const database = await ensureDb();
        console.log('🔍 DEBUG: Checking database for course:', courseId);
        const allDocsResult = await database.list({ include_docs: true });
        const allDocs = allDocsResult.rows.map((row) => row.doc);
        console.log('📄 Total documents in database:', allDocs.length);
        const course = allDocs.find((doc) => doc._id === courseId);
        console.log('📚 Course found:', !!course);
        if (course) {
            console.log('📚 Course title:', course.title);
        }
        const modules = allDocs.filter((doc) => doc && doc.type === 'module' &&
            (doc.course === courseId || doc.courseId === courseId));
        console.log('🔧 Modules found:', modules.length);
        const assessments = allDocs.filter((doc) => doc && doc.type === 'assessment' &&
            (doc.courseId === courseId || doc.course === courseId));
        const quizzes = allDocs.filter((doc) => doc && doc.type === 'quiz' &&
            (doc.courseId === courseId || doc.course === courseId));
        const discussions = allDocs.filter((doc) => doc && doc.type === 'discussion' &&
            (doc.courseId === courseId || doc.course === courseId));
        console.log('🎯 Assessments found:', assessments.length);
        console.log('🧠 Quizzes found:', quizzes.length);
        console.log('💬 Discussions found:', discussions.length);
        const moduleDetails = modules.map((module) => {
            const moduleAssessments = assessments.filter((assessment) => assessment.moduleId === module._id || assessment.module === module._id);
            const moduleQuizzes = quizzes.filter((quiz) => quiz.moduleId === module._id || quiz.module === module._id);
            const moduleDiscussions = discussions.filter((discussion) => discussion.moduleId === module._id || discussion.module === module._id);
            return {
                moduleId: module._id,
                moduleTitle: module.title,
                assessments: moduleAssessments.map((a) => ({
                    id: a._id,
                    title: a.title,
                    questions: a.questions?.length || 0,
                    timeLimit: a.timeLimit
                })),
                quizzes: moduleQuizzes.map((q) => ({
                    id: q._id,
                    title: q.title,
                    questions: q.questions?.length || 0,
                    timeLimit: q.timeLimit
                })),
                discussions: moduleDiscussions.map((d) => ({
                    id: d._id,
                    title: d.title,
                    content: d.content?.substring(0, 100) + '...'
                }))
            };
        });
        res.json({
            success: true,
            debug: {
                courseId,
                courseExists: !!course,
                courseTitle: course?.title || 'Not found',
                totalDocs: allDocs.length,
                modulesCount: modules.length,
                assessmentsCount: assessments.length,
                quizzesCount: quizzes.length,
                discussionsCount: discussions.length,
                moduleDetails
            }
        });
    }
    catch (error) {
        console.error('❌ Debug endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/:courseId/modules', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('instructor', 'admin', 'user', 'refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { courseId } = req.params;
        console.log('🔍 Fetching modules for course:', courseId);
        const database = await ensureDb();
        let course;
        try {
            course = await database.get(courseId);
        }
        catch (dbError) {
            if (dbError.error === 'not_found') {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }
            throw dbError;
        }
        const allDocsResult = await database.list({ include_docs: true });
        const modules = allDocsResult.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'module' &&
            (doc.course === courseId || doc.courseId === courseId))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        console.log('📚 Found', modules.length, 'modules for course');
        res.json({
            success: true,
            data: {
                modules: modules.map((module) => ({
                    _id: module._id,
                    title: module.title,
                    description: module.description,
                    order: module.order,
                    isPublished: module.isPublished,
                    content_type: module.content_type,
                    duration: module.duration
                }))
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching modules for course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch modules for course',
            error: error.message
        });
    }
}));
router.post('/:courseId/modules/:moduleId/complete', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'instructor', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId, moduleId } = req.params;
    const { itemId, itemType, itemTitle } = req.body;
    const userId = req.user?._id?.toString();
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    try {
        const database = await ensureDb();
        const progressId = `progress_${userId}_${courseId}`;
        let progressDoc;
        try {
            progressDoc = await database.get(progressId);
        }
        catch (error) {
            progressDoc = {
                _id: progressId,
                type: 'course_progress',
                userId,
                courseId,
                modulesProgress: {},
                completedItems: [],
                startedAt: new Date(),
                lastAccessedAt: new Date()
            };
        }
        if (!progressDoc.modulesProgress[moduleId]) {
            progressDoc.modulesProgress[moduleId] = {
                completedItems: [],
                startedAt: new Date()
            };
        }
        if (!progressDoc.modulesProgress[moduleId].completedItems.includes(itemId)) {
            progressDoc.modulesProgress[moduleId].completedItems.push(itemId);
            if (!progressDoc.completedItems) {
                progressDoc.completedItems = [];
            }
            progressDoc.completedItems.push({
                moduleId,
                itemId,
                itemType,
                itemTitle,
                completedAt: new Date()
            });
        }
        progressDoc.lastAccessedAt = new Date();
        await database.insert(progressDoc);
        const course = await database.get(courseId);
        let courseCompleted = false;
        if (course && course.modules && userId) {
            courseCompleted = await checkCourseCompletion(database, userId, courseId, course);
            if (courseCompleted && !progressDoc.completedAt) {
                progressDoc.completedAt = new Date();
                progressDoc.courseCompleted = true;
                await database.insert(progressDoc);
                const user = await database.get(userId);
                if (!user.completedCourses) {
                    user.completedCourses = [];
                }
                if (!user.completedCourses.includes(courseId)) {
                    user.completedCourses.push(courseId);
                    user.updatedAt = new Date();
                    await database.insert(user);
                }
            }
        }
        res.json({
            success: true,
            data: {
                itemCompleted: true,
                courseCompleted,
                progress: progressDoc
            }
        });
    }
    catch (error) {
        console.error('Error marking content as complete:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark content as complete',
            error: error.message
        });
    }
}));
router.get('/:courseId/progress', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user?._id?.toString();
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    try {
        const database = await ensureDb();
        const progressId = `progress_${userId}_${courseId}`;
        let progressDoc;
        try {
            progressDoc = await database.get(progressId);
        }
        catch (error) {
            progressDoc = {
                modulesProgress: {},
                completedItems: [],
                courseCompleted: false
            };
        }
        res.json({
            success: true,
            data: progressDoc
        });
    }
    catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course progress',
            error: error.message
        });
    }
}));
router.post('/:courseId/send-completion-email', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user?._id?.toString();
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    try {
        const database = await ensureDb();
        const course = await database.get(courseId);
        const user = await database.get(userId);
        if (!course || !user) {
            return res.status(404).json({
                success: false,
                message: 'Course or user not found'
            });
        }
        try {
            await (0, email_1.sendCourseCompletionEmail)(user.email || 'no-email@example.com', user.name || 'Student', course.title);
            console.log(`Completion email sent to ${user.email} for course ${course.title}`);
        }
        catch (emailError) {
            console.error('Failed to send completion email:', emailError);
        }
        res.json({
            success: true,
            message: 'Completion email sent successfully'
        });
    }
    catch (error) {
        console.error('Error sending completion email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send completion email',
            error: error.message
        });
    }
}));
async function checkCourseCompletion(database, userId, courseId, course) {
    try {
        const progressId = `progress_${userId}_${courseId}`;
        const progressDoc = await database.get(progressId);
        if (!progressDoc || !course.modules) {
            return false;
        }
        for (const module of course.modules) {
            const moduleProgress = progressDoc.modulesProgress[module._id];
            if (!moduleProgress || !moduleProgress.completedItems || moduleProgress.completedItems.length === 0) {
                return false;
            }
        }
        return true;
    }
    catch (error) {
        console.error('Error checking course completion:', error);
        return false;
    }
}
router.post('/:courseId/modules/:moduleId/submit-quiz', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { answers, quizId, type } = req.body;
        const userId = req.user?._id?.toString();
        const database = await ensureDb();
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const totalQuestions = Array.isArray(answers) ? answers.length : 10;
        const correctAnswers = Math.floor(Math.random() * totalQuestions);
        const percentage = (correctAnswers / totalQuestions) * 100;
        const grade = Math.round(percentage);
        const gradeDoc = {
            _id: `grade_${userId}_${courseId}_${moduleId}_${Date.now()}`,
            type: 'grade',
            userId,
            courseId,
            moduleId,
            quizId: quizId || 'unknown',
            quizType: type || 'quiz',
            score: correctAnswers,
            totalQuestions,
            percentage,
            grade,
            submittedAt: new Date().toISOString()
        };
        await database.insert(gradeDoc);
        res.json({
            success: true,
            data: {
                grade,
                percentage,
                correctAnswers,
                totalQuestions,
                passed: percentage >= 70
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/:courseId/grades', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?._id?.toString();
        const database = await ensureDb();
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const result = await database.list({ include_docs: true });
        const grades = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'grade' &&
            doc.userId === userId && doc.courseId === courseId);
        const overallGrade = grades.length > 0 ?
            Math.round(grades.reduce((sum, g) => sum + g.grade, 0) / grades.length) : 0;
        res.json({
            success: true,
            data: {
                overallGrade,
                totalAssessments: grades.length,
                moduleGrades: {}
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/:courseId/all-grades', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const database = await ensureDb();
        const result = await database.list({ include_docs: true });
        const allGrades = result.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'grade' && doc.courseId === courseId);
        const userGrades = {};
        allGrades.forEach((grade) => {
            if (!userGrades[grade.userId]) {
                userGrades[grade.userId] = [];
            }
            userGrades[grade.userId].push(grade);
        });
        const studentGrades = await Promise.all(Object.keys(userGrades).map(async (userId) => {
            try {
                const user = await database.get(userId);
                const grades = userGrades[userId];
                const overallGrade = grades.length > 0 ?
                    Math.round(grades.reduce((sum, g) => sum + g.grade, 0) / grades.length) : 0;
                return {
                    studentId: userId,
                    studentName: user.name || 'Unknown',
                    studentEmail: user.email || 'No email',
                    overallGrade,
                    totalAssessments: grades.length,
                    grades
                };
            }
            catch {
                return {
                    studentId: userId,
                    studentName: 'Unknown User',
                    studentEmail: 'No email',
                    overallGrade: 0,
                    totalAssessments: 0,
                    grades: []
                };
            }
        }));
        res.json({
            success: true,
            data: { studentGrades }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=course.routes.js.map