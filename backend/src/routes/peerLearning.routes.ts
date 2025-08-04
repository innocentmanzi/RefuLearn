import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

const router = express.Router();

// Setup PouchDB
PouchDB.plugin(PouchDBFind);
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

interface AuthenticatedRequest extends Request {
  user?: { _id: string; role?: string; name?: string; [key: string]: any; };
}

const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user?._id) throw new Error('User authentication required');
  return { userId: req.user._id.toString(), user: req.user as NonNullable<AuthenticatedRequest['user']> };
};

interface PeerGroupDoc {
  _id: string;
  _rev?: string;
  type: 'peer_group';
  name: string;
  description: string;
  category: string;
  maxMembers: number;
  currentMembers: string[];
  tags: string[];
  creator: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface UserDoc {
  _id: string;
  _rev?: string;
  type: 'user';
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePic?: string;
  [key: string]: any;
}

// Validation schemas
const createGroupValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Group name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('maxMembers')
    .isInt({ min: 2, max: 50 })
    .withMessage('Max members must be between 2 and 50'),
  body('tags')
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty')
];

const createPostValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('type')
    .isIn(['question', 'discussion', 'resource', 'announcement'])
    .withMessage('Invalid post type'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const createCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// Get all peer learning groups (public)
router.get('/groups', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('tags').optional().isArray().withMessage('Tags must be an array')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    tags
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  // Build selector
  const selector: any = { type: 'peer_group', isActive: true };
  
  if (category) {
    selector.category = category;
  }

  const result = await db.find({ selector });
  let groups = result.docs;

  // Manual filtering for search and tags (since pouchdb-find doesn't support regex)
  if (search) {
    const s = (search as string).toLowerCase();
    groups = groups.filter((group: any) =>
      group.name?.toLowerCase().includes(s) ||
      group.description?.toLowerCase().includes(s) ||
      group.tags?.some((tag: string) => tag.toLowerCase().includes(s))
    );
  }
  
  if (tags && Array.isArray(tags)) {
    groups = groups.filter((group: any) =>
      group.tags?.some((tag: string) => tags.includes(tag))
    );
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

// Create a peer learning group
router.post('/groups', authenticateToken, authorizeRoles('refugee'), validate(createGroupValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, category, maxMembers, tags } = req.body;
  const { userId, user } = ensureAuth(req);

  // Check if user has sufficient activity
  if (user.role !== 'refugee') {
    // Check user's activity level (posts, comments, etc.)
    const userActivity = await getUserActivity(userId);
    if (userActivity.totalPosts < 5) {
      return res.status(403).json({
        success: false,
        message: 'You need at least 5 posts to create a group'
      });
    }
  }

  // Check if user is already in a group for this category
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

// Get group details
router.get('/groups/:groupId', asyncHandler(async (req: Request, res: Response) => {
  const { groupId } = req.params;

  // Get group details logic would go here
  // For now, return a mock response
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

// Join a group
router.post('/groups/:groupId/join', authenticateToken, authorizeRoles('refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;
  const { userId, user } = ensureAuth(req);

  // Join group logic would go here
  // Check if group exists, if user is already a member, if group is full, etc.

  res.json({
    success: true,
    message: 'Successfully joined the group'
  });
}));

// Leave a group
router.post('/groups/:groupId/leave', authenticateToken, authorizeRoles('refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;
  const { userId, user } = ensureAuth(req);

  // Leave group logic would go here
  // Check if user is a member, handle group deletion if creator leaves, etc.

  res.json({
    success: true,
    message: 'Successfully left the group'
  });
}));

// Get group posts
router.get('/groups/:groupId/posts', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('type').optional().isIn(['question', 'discussion', 'resource', 'announcement']).withMessage('Invalid post type'),
  query('tags').optional().isArray().withMessage('Tags must be an array')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { page = 1, limit = 10, type, tags } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Get posts logic would go here
  // For now, return a mock response
  const posts: any[] = [];
  const total: number = 0;

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

// Create a post in a group
router.post('/groups/:groupId/posts', authenticateToken, authorizeRoles('refugee'), validate(createPostValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;
  const { content, type, tags } = req.body;
  const { userId, user } = ensureAuth(req);

  // Check if user is a member of the group
  // Create post logic would go here

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

// Get post details
router.get('/posts/:postId', asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;

  // Get post details logic would go here
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

// Update a post
router.put('/posts/:postId', authenticateToken, authorizeRoles('refugee'), [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { userId, user } = ensureAuth(req);

  // Check if user is the author of the post
  // Update post logic would go here

  res.json({
    success: true,
    message: 'Post updated successfully'
  });
}));

// Delete a post
router.delete('/posts/:postId', authenticateToken, authorizeRoles('refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;
  const { userId, user } = ensureAuth(req);

  // Check if user is the author of the post or group admin
  // Delete post logic would go here

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
}));

// Like/unlike a post
router.post('/posts/:postId/like', authenticateToken, authorizeRoles('refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;
  const { userId, user } = ensureAuth(req);

  // Like/unlike logic would go here
  // Check if user already liked the post, toggle like status

  res.json({
    success: true,
    message: 'Post liked successfully'
  });
}));

// Add comment to a post
router.post('/posts/:postId/comments', authenticateToken, authorizeRoles('refugee'), validate(createCommentValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { userId, user } = ensureAuth(req);

  // Add comment logic would go here
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

// Update a comment
router.put('/comments/:commentId', authenticateToken, authorizeRoles('refugee'), validate(createCommentValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const { userId, user } = ensureAuth(req);

  // Check if user is the author of the comment
  // Update comment logic would go here

  res.json({
    success: true,
    message: 'Comment updated successfully'
  });
}));

// Delete a comment
router.delete('/comments/:commentId', authenticateToken, authorizeRoles('refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const { userId, user } = ensureAuth(req);

  // Check if user is the author of the comment or post author
  // Delete comment logic would go here

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
}));

// Get user's groups
router.get('/user/groups', authenticateToken, authorizeRoles('refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  // Get user's groups logic would go here
  const groups: any[] = [];

  res.json({
    success: true,
    data: { groups }
  });
}));

// Get user's posts
router.get('/user/posts', authenticateToken, authorizeRoles('refugee'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const { userId, user } = ensureAuth(req);

  // Get user's posts logic would go here
  const posts: any[] = [];
  const total: number = 0;

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

// Search for users to invite to groups
router.get('/search/users', authenticateToken, authorizeRoles('refugee'), [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { q, limit = 10 } = req.query;
  const { userId, user } = ensureAuth(req);

  const result = await db.find({ 
    selector: { 
      type: 'user',
      isActive: true
    }
  });
  
  let users = result.docs.filter((user: any) => 
    user._id !== userId &&
    (user.firstName?.toLowerCase().includes((q as string).toLowerCase()) ||
     user.lastName?.toLowerCase().includes((q as string).toLowerCase()) ||
     user.email?.toLowerCase().includes((q as string).toLowerCase()))
  ).slice(0, Number(limit));

  res.json({
    success: true,
    data: { users }
  });
}));

// Get peer learning statistics
router.get('/stats', authenticateToken, authorizeRoles('refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  // Get user's peer learning statistics
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

// Add comment to group
router.post('/groups/:groupId/comments', authenticateToken, authorizeRoles('refugee'), [
  body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;
  const { text } = req.body;
  const { userId, user } = ensureAuth(req);

  // Mock comment creation
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

// Add reply to comment
router.post('/groups/:groupId/comments/:commentId/replies', authenticateToken, authorizeRoles('refugee'), [
  body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Reply must be between 1 and 1000 characters')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId, commentId } = req.params;
  const { text } = req.body;
  const { userId, user } = ensureAuth(req);

  // Mock reply creation
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

// Helper function to get user activity
async function getUserActivity(userId: string) {
  // Query the database for user activity
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
    totalLikes: 0, // Would need to implement likes tracking
    groupsJoined: groupsResult.docs.length
  };
}

export default router; 