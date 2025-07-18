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
const ensureAuth = (req) => {
    if (!req.user?._id)
        throw new Error('User authentication required');
    return { userId: req.user._id.toString(), user: req.user };
};
const createGroupValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Group name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    (0, express_validator_1.body)('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    (0, express_validator_1.body)('maxMembers')
        .isInt({ min: 2, max: 50 })
        .withMessage('Max members must be between 2 and 50'),
    (0, express_validator_1.body)('tags')
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*')
        .trim()
        .notEmpty()
        .withMessage('Tag cannot be empty')
];
const createPostValidation = [
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Content must be between 1 and 2000 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['question', 'discussion', 'resource', 'announcement'])
        .withMessage('Invalid post type'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
];
const createCommentValidation = [
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters')
];
router.get('/groups', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
    (0, express_validator_1.query)('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    (0, express_validator_1.query)('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
    (0, express_validator_1.query)('tags').optional().isArray().withMessage('Tags must be an array')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, category, search, tags } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const selector = { type: 'peer_group', isActive: true };
    if (category) {
        selector.category = category;
    }
    const result = await db.find({ selector });
    let groups = result.docs;
    if (search) {
        const s = search.toLowerCase();
        groups = groups.filter((group) => group.name?.toLowerCase().includes(s) ||
            group.description?.toLowerCase().includes(s) ||
            group.tags?.some((tag) => tag.toLowerCase().includes(s)));
    }
    if (tags && Array.isArray(tags)) {
        groups = groups.filter((group) => group.tags?.some((tag) => tags.includes(tag)));
    }
    const total = groups.length;
    res.json({
        success: true,
        data: {
            groups,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
router.post('/groups', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, validation_1.validate)(createGroupValidation), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, category, maxMembers, tags } = req.body;
    const { userId, user } = ensureAuth(req);
    if (user.role !== 'refugee') {
        const userActivity = await getUserActivity(userId);
        if (userActivity.totalPosts < 5) {
            return res.status(403).json({
                success: false,
                message: 'You need at least 5 posts to create a group'
            });
        }
    }
    const existingGroupResult = await db.find({
        selector: {
            type: 'peer_group',
            category: category,
            currentMembers: userId
        }
    });
    if (existingGroupResult.docs.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'You are already in a peer learning group for this category'
        });
    }
    const groupData = {
        type: 'peer_group',
        name,
        description,
        category,
        maxMembers,
        tags,
        creator: userId,
        currentMembers: [userId],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const group = await db.put(groupData);
    res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: { group }
    });
}));
router.get('/groups/:groupId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { groupId } = req.params;
    const group = {
        _id: groupId,
        name: 'Sample Group',
        description: 'A sample peer learning group',
        category: 'Technology',
        maxMembers: 20,
        currentMembers: 5,
        tags: ['programming', 'web-development'],
        creator: 'mock-creator-id',
        members: ['mock-member-1', 'mock-member-2'],
        createdAt: new Date(),
        isActive: true
    };
    res.json({
        success: true,
        data: { group }
    });
}));
router.post('/groups/:groupId/join', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { groupId } = req.params;
    const { userId, user } = ensureAuth(req);
    res.json({
        success: true,
        message: 'Successfully joined the group'
    });
}));
router.post('/groups/:groupId/leave', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { groupId } = req.params;
    const { userId, user } = ensureAuth(req);
    res.json({
        success: true,
        message: 'Successfully left the group'
    });
}));
router.get('/groups/:groupId/posts', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
    (0, express_validator_1.query)('type').optional().isIn(['question', 'discussion', 'resource', 'announcement']).withMessage('Invalid post type'),
    (0, express_validator_1.query)('tags').optional().isArray().withMessage('Tags must be an array')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { groupId } = req.params;
    const { page = 1, limit = 10, type, tags } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const posts = [];
    const total = 0;
    res.json({
        success: true,
        data: {
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
router.post('/groups/:groupId/posts', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, validation_1.validate)(createPostValidation), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { groupId } = req.params;
    const { content, type, tags } = req.body;
    const { userId, user } = ensureAuth(req);
    const post = {
        _id: 'mock-post-id',
        content,
        type,
        tags: tags || [],
        author: userId,
        group: groupId,
        likes: [],
        comments: [],
        createdAt: new Date()
    };
    res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post }
    });
}));
router.get('/posts/:postId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const post = {
        _id: postId,
        content: 'Sample post content',
        type: 'question',
        tags: ['sample'],
        author: 'mock-author-id',
        group: 'mock-group-id',
        likes: [],
        comments: [],
        createdAt: new Date()
    };
    res.json({
        success: true,
        data: { post }
    });
}));
router.put('/posts/:postId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), [
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Content must be between 1 and 2000 characters')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { userId, user } = ensureAuth(req);
    res.json({
        success: true,
        message: 'Post updated successfully'
    });
}));
router.delete('/posts/:postId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const { userId, user } = ensureAuth(req);
    res.json({
        success: true,
        message: 'Post deleted successfully'
    });
}));
router.post('/posts/:postId/like', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const { userId, user } = ensureAuth(req);
    res.json({
        success: true,
        message: 'Post liked successfully'
    });
}));
router.post('/posts/:postId/comments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, validation_1.validate)(createCommentValidation), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { userId, user } = ensureAuth(req);
    const comment = {
        _id: 'mock-comment-id',
        content,
        author: userId,
        post: postId,
        likes: [],
        createdAt: new Date()
    };
    res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: { comment }
    });
}));
router.put('/comments/:commentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, validation_1.validate)(createCommentValidation), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const { userId, user } = ensureAuth(req);
    res.json({
        success: true,
        message: 'Comment updated successfully'
    });
}));
router.delete('/comments/:commentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { commentId } = req.params;
    const { userId, user } = ensureAuth(req);
    res.json({
        success: true,
        message: 'Comment deleted successfully'
    });
}));
router.get('/user/groups', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
    const groups = [];
    res.json({
        success: true,
        data: { groups }
    });
}));
router.get('/user/posts', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { userId, user } = ensureAuth(req);
    const posts = [];
    const total = 0;
    res.json({
        success: true,
        data: {
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
router.get('/search/users', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), [
    (0, express_validator_1.query)('q').trim().notEmpty().withMessage('Search query is required'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { q, limit = 10 } = req.query;
    const { userId, user } = ensureAuth(req);
    const result = await db.find({
        selector: {
            type: 'user',
            isActive: true
        }
    });
    let users = result.docs.filter((user) => user._id !== userId &&
        (user.firstName?.toLowerCase().includes(q.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(q.toLowerCase()) ||
            user.email?.toLowerCase().includes(q.toLowerCase()))).slice(0, Number(limit));
    res.json({
        success: true,
        data: { users }
    });
}));
router.get('/stats', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
    const stats = {
        totalGroups: 0,
        totalPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        groupsCreated: 0,
        postsCreated: 0
    };
    res.json({
        success: true,
        data: { stats }
    });
}));
router.post('/groups/:groupId/comments', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), [
    (0, express_validator_1.body)('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { groupId } = req.params;
    const { text } = req.body;
    const { userId, user } = ensureAuth(req);
    const comment = {
        _id: Date.now().toString(),
        user: user.name || 'User',
        text,
        timestamp: new Date().toISOString(),
        replies: []
    };
    res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: { comment }
    });
}));
router.post('/groups/:groupId/comments/:commentId/replies', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee'), [
    (0, express_validator_1.body)('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Reply must be between 1 and 1000 characters')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { groupId, commentId } = req.params;
    const { text } = req.body;
    const { userId, user } = ensureAuth(req);
    const reply = {
        _id: Date.now().toString(),
        user: user.name || 'User',
        text,
        timestamp: new Date().toISOString()
    };
    res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: { reply }
    });
}));
async function getUserActivity(userId) {
    const postsResult = await db.find({
        selector: {
            type: 'post',
            author: userId
        }
    });
    const commentsResult = await db.find({
        selector: {
            type: 'comment',
            author: userId
        }
    });
    const groupsResult = await db.find({
        selector: {
            type: 'peer_group',
            currentMembers: userId
        }
    });
    return {
        totalPosts: postsResult.docs.length,
        totalComments: commentsResult.docs.length,
        totalLikes: 0,
        groupsJoined: groupsResult.docs.length
    };
}
exports.default = router;
//# sourceMappingURL=peerLearning.routes.js.map