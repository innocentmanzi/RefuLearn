import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadAny, handleUploadError } from '../middleware/upload';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

const router = express.Router();

// Setup PouchDB
PouchDB.plugin(PouchDBFind);
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

interface AuthenticatedRequest extends Request {
  user?: { _id: string; role?: string; email?: string; [key: string]: any; };
}

const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user?._id) throw new Error('User authentication required');
  return { userId: req.user._id.toString(), user: req.user as NonNullable<AuthenticatedRequest['user']> };
};

interface HelpTicketDoc {
  _id: string;
  _rev: string;
  type: 'help_ticket';
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  user: string;
  assignedTo?: string;
  attachments?: string[];
  messages?: Array<{
    _id?: string;
    sender: string;
    message: string;
    isInternal: boolean;
    createdAt: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// Get user's help tickets
router.get('/tickets', authenticateToken, [
  query('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { status, priority, page = 1, limit = 10 } = req.query;
  
  console.log('🎫 Fetching help tickets for user:', userId);
  
  const selector: any = { type: 'help_ticket', user: userId };
  
  if (status) {
    selector.status = status;
  }
  
  if (priority) {
    selector.priority = priority;
  }

  console.log('🎫 Database selector:', selector);

  const result = await db.find({ selector });
  const tickets = result.docs;

  console.log('🎫 Found tickets:', tickets.length);

  // Pagination
  const total = tickets.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedTickets = tickets.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  console.log('🎫 Returning tickets:', pagedTickets.length);

  res.json({
    success: true,
    data: {
      tickets: pagedTickets,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalTickets: total
      }
    }
  });
}));

// Create help ticket
router.post('/tickets', authenticateToken, uploadAny, handleUploadError, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['technical', 'account', 'course', 'payment', 'general']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignedTo').optional().isIn(['instructor', 'admin', 'employer']).withMessage('Invalid assigned role')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, category, priority, assignedTo } = req.body;

  // Handle file uploads
  const attachments = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      attachments.push(file.path);
    }
  }

  const ticket = {
    title,
    description,
    category,
    priority,
    assignedTo: assignedTo || undefined,
    attachments,
    user: ensureAuth(req).userId,
    status: 'open',
    type: 'help_ticket',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const createdTicket = await db.post(ticket);

  res.status(201).json({
    success: true,
    message: 'Help ticket created successfully',
    data: { ticket: createdTicket }
  });
}));

// Get help ticket by ID
router.get('/tickets/:ticketId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const { ticketId } = req.params;

  try {
    const ticket = await db.get(ticketId) as HelpTicketDoc;

    // Check if user is authorized to view this ticket
    if (ticket.user !== userId && 
        !['admin', 'instructor'].includes((user.role || ''))) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }

    res.json({
      success: true,
      data: { ticket }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Help ticket not found'
    });
  }
}));

// Update help ticket
router.put('/tickets/:ticketId', authenticateToken, uploadAny, handleUploadError, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('category').optional().isIn(['technical', 'account', 'course', 'payment', 'general']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('assignedTo').optional().isIn(['instructor', 'admin', 'employer']).withMessage('Invalid assigned role')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const { ticketId } = req.params;
  const updates = req.body;

  const ticket = await db.get(ticketId) as HelpTicketDoc;
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Help ticket not found'
    });
  }

  // Check if user is authorized to update this ticket
  if (ticket.user !== userId && 
      !['admin', 'instructor'].includes((user.role || ''))) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this ticket'
    });
  }

  // Handle file uploads
  if (req.files && Array.isArray(req.files)) {
    const newAttachments = [];
    for (const file of req.files) {
      newAttachments.push(file.path);
    }
    // Append new attachments to existing ones
    if (ticket.attachments) {
      ticket.attachments.push(...newAttachments);
    } else {
      ticket.attachments = newAttachments;
    }
  }

  Object.assign(ticket, updates);
  ticket.updatedAt = new Date();
  const latest = await db.get(ticket._id);
  ticket._rev = latest._rev;
  const updatedTicket = await db.put(ticket);

  res.json({
    success: true,
    message: 'Help ticket updated successfully',
    data: { ticket: updatedTicket }
  });
}));

// Add message to help ticket
router.post('/tickets/:ticketId/messages', authenticateToken, [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('isInternal').optional().isBoolean()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const { ticketId } = req.params;
  const { message, isInternal = false } = req.body;

  const ticket = await db.get(ticketId) as HelpTicketDoc;
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Help ticket not found'
    });
  }

  // Check if user is authorized to add messages to this ticket
  if (ticket.user !== userId && 
      !['admin', 'instructor'].includes((user.role || ''))) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add messages to this ticket'
    });
  }

  // Only staff can add internal messages
  if (isInternal && !['admin', 'instructor'].includes((user.role || ''))) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add internal messages'
    });
  }

  if (!ticket.messages) {
    ticket.messages = [];
  }

  ticket.messages.push({
    sender: userId,
    message,
    isInternal,
    createdAt: new Date()
  });

  // Update ticket status if it was resolved and user is adding a new message
  if (ticket.status === 'resolved' && !isInternal) {
    ticket.status = 'open';
  }

  ticket.updatedAt = new Date();
  const latest = await db.get(ticket._id);
  ticket._rev = latest._rev;
  const updatedTicket = await db.put(ticket);

  res.json({
    success: true,
    message: 'Message added successfully',
    data: { ticket: updatedTicket }
  });
}));

// Assign ticket to staff member (admin/instructor only)
router.put('/tickets/:ticketId/assign', authenticateToken, authorizeRoles('admin', 'instructor'), [
  body('assignedTo').isMongoId().withMessage('Valid user ID is required')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { user } = ensureAuth(req);
  const { ticketId } = req.params;
  const { assignedTo } = req.body;

  const ticket = await db.get(ticketId) as HelpTicketDoc;
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Help ticket not found'
    });
  }

  // Verify the assigned user exists and has appropriate role
  const assignedUser = await db.get(assignedTo) as HelpTicketDoc;
  if (!assignedUser || !['admin', 'instructor'].includes((user.role || ''))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user for assignment'
    });
  }

  ticket.assignedTo = assignedTo;
  ticket.status = 'in-progress';
  ticket.assignedAt = new Date();

  const updatedTicket = await db.put(ticket);

  res.json({
    success: true,
    message: 'Ticket assigned successfully',
    data: { ticket: updatedTicket }
  });
}));

// Get all tickets (admin/instructor only)
router.get('/all-tickets', authenticateToken, authorizeRoles('admin', 'instructor'), [
  query('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('category').optional().isIn(['technical', 'account', 'course', 'payment', 'general']),
  query('assignedTo').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, priority, category, assignedTo, page = 1, limit = 10 } = req.query;
  
  const query: any = { type: 'help_ticket' };
  
  if (status) {
    query.status = status;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  const result = await db.find({ selector: query });
  const tickets = result.docs;

  // Pagination
  const total = tickets.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedTickets = tickets.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      tickets: pagedTickets,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalTickets: total
      }
    }
  });
}));

// Get help analytics (admin only)
router.get('/analytics', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  // Ticket statistics
  const totalTicketsResult = await db.find({ selector: { type: 'help_ticket' } });
  const totalTickets = totalTicketsResult.docs.length;
  
  const openTicketsResult = await db.find({ selector: { type: 'help_ticket', status: 'open' } });
  const openTickets = openTicketsResult.docs.length;
  
  const inProgressTicketsResult = await db.find({ selector: { type: 'help_ticket', status: 'in-progress' } });
  const inProgressTickets = inProgressTicketsResult.docs.length;
  
  const resolvedTicketsResult = await db.find({ selector: { type: 'help_ticket', status: 'resolved' } });
  const resolvedTickets = resolvedTicketsResult.docs.length;
  
  const closedTicketsResult = await db.find({ selector: { type: 'help_ticket', status: 'closed' } });
  const closedTickets = closedTicketsResult.docs.length;

  // New tickets in period
  const newTicketsResult = await db.find({ selector: { type: 'help_ticket', createdAt: { $gte: daysAgo } } });
  const newTickets = newTicketsResult.docs.length;

  // Tickets by category
  const ticketsByCategoryResult = await db.find({ selector: { type: 'help_ticket' } });
  const ticketsByCategory = ticketsByCategoryResult.docs.map((doc: any) => ({
    _id: doc.category,
    count: 1
  }));

  // Tickets by priority
  const ticketsByPriorityResult = await db.find({ selector: { type: 'help_ticket' } });
  const ticketsByPriority = ticketsByPriorityResult.docs.map((doc: any) => ({
    _id: doc.priority,
    count: 1
  }));

  // Average resolution time
  const resolvedTicketsWithTimeResult = await db.find({ selector: { type: 'help_ticket', status: 'resolved', resolvedAt: { $exists: true } } });
  const resolvedTicketsWithTime = resolvedTicketsWithTimeResult.docs;

  const totalResolutionTime = resolvedTicketsWithTime.reduce((sum: number, ticket: any) => {
    const resolutionTime = new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
    return sum + resolutionTime;
  }, 0);

  const averageResolutionTime = resolvedTicketsWithTime.length > 0 
    ? totalResolutionTime / resolvedTicketsWithTime.length 
    : 0;

  // Recent tickets
  const recentTicketsResult = await db.find({ selector: { type: 'help_ticket' } });
  const recentTickets = recentTicketsResult.docs
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((ticket: any) => ({
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt
    }));

  res.json({
    success: true,
    data: {
      overview: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        new: newTickets
      },
      byCategory: ticketsByCategory,
      byPriority: ticketsByPriority,
      averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60 * 24)), // in days
      recentTickets
    }
  });
}));

// Get FAQ categories (public)
router.get('/faq', asyncHandler(async (req: Request, res: Response) => {
  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Register" button and fill in your details to create a new account.'
        },
        {
          question: 'How do I enroll in a course?',
          answer: 'Browse available courses and click "Enroll" on any course you\'re interested in.'
        }
      ]
    },
    {
      category: 'Courses',
      questions: [
        {
          question: 'Are the courses free?',
          answer: 'Most courses are free, but some premium courses may require payment.'
        },
        {
          question: 'Can I get a certificate?',
          answer: 'Yes, you can earn certificates upon successful completion of courses.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          question: 'What if I can\'t access my account?',
          answer: 'Use the "Forgot Password" feature or contact support for assistance.'
        },
        {
          question: 'The video is not playing',
          answer: 'Check your internet connection and try refreshing the page.'
        }
      ]
    }
  ];

  res.json({
    success: true,
    data: { faqCategories }
  });
}));

// Admin: Create help ticket
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const help = req.body;
  const createdHelp = await db.put(help);
  res.status(201).json({ success: true, message: 'Help ticket created successfully', data: { help: createdHelp } });
}));

// Admin: Get all help tickets
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await db.find({ selector: { type: 'help_ticket' } });
  const helps = result.docs;
  res.json({ success: true, data: { helps } });
}));

// Admin: Get help ticket by ID
router.get('/admin/:helpId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const help = await db.get(req.params.helpId) as HelpTicketDoc;
  if (!help) {
    return res.status(404).json({ success: false, message: 'Help ticket not found' });
  }
  res.json({ success: true, data: { help } });
}));

// Admin: Update help ticket
router.put('/admin/:helpId', authenticateToken, authorizeRoles('admin'), [
  body('subject').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { helpId } = req.params;
  const updates = req.body;
  const help = await db.get(helpId) as HelpTicketDoc;
  if (!help) {
    return res.status(404).json({ success: false, message: 'Help ticket not found' });
  }
  Object.assign(help, updates);
  help.updatedAt = new Date();
  const latest = await db.get(help._id);
  help._rev = latest._rev;
  const updatedHelp = await db.put(help);
  res.json({ success: true, message: 'Help ticket updated successfully', data: { help: updatedHelp } });
}));

// Admin: Delete help ticket
router.delete('/admin/:helpId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { helpId } = req.params;
  const help = await db.get(helpId) as HelpTicketDoc;
  if (!help) {
    return res.status(404).json({ success: false, message: 'Help ticket not found' });
  }
  const latest = await db.get(help._id);
  help._rev = latest._rev;
  await db.remove(help);
  res.json({ success: true, message: 'Help ticket deleted successfully' });
}));

// PATCH (partial update) help ticket
router.patch('/tickets/:ticketId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const { ticketId } = req.params;
  const updates = req.body;

  const ticket = await db.get(ticketId) as HelpTicketDoc;
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Help ticket not found' });
  }
  if (ticket.user !== userId && !['admin', 'instructor'].includes((user.role || ''))) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this ticket' });
  }
  Object.assign(ticket, updates);
  ticket.updatedAt = new Date();
  const latest = await db.get(ticket._id);
  ticket._rev = latest._rev;
  const updatedTicket = await db.put(ticket);
  res.json({ success: true, message: 'Help ticket updated', data: { ticket: updatedTicket } });
}));

// DELETE help ticket
router.delete('/tickets/:ticketId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const { ticketId } = req.params;
  const ticket = await db.get(ticketId) as HelpTicketDoc;
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Help ticket not found' });
  }
  if (ticket.user !== userId && !['admin', 'instructor'].includes((user.role || ''))) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this ticket' });
  }
  const latest = await db.get(ticket._id);
  ticket._rev = latest._rev;
  await db.remove(ticket);
  res.json({ success: true, message: 'Help ticket deleted' });
}));

// PATCH update_status endpoint
router.patch('/tickets/:ticketId/update_status', authenticateToken, [
  body('status').isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const { ticketId } = req.params;
  const { status } = req.body;
  const ticket = await db.get(ticketId) as HelpTicketDoc;
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Help ticket not found' });
  }
  if ((ticket as any).user.toString() !== userId && !['admin', 'instructor'].includes((user.role || ''))) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this ticket' });
  }
  ticket.status = status;
  ticket.updatedAt = new Date();
  const latest = await db.get(ticket._id);
  ticket._rev = latest._rev;
  const updatedTicket = await db.put(ticket);
  res.json({ success: true, message: 'Help ticket status updated', data: { ticket: updatedTicket } });
}));

// List all help tickets (with filters)
router.get('/help-tickets', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, assignedTo, search, category, course } = req.query;
  let selector: any = { type: 'help-ticket' };
  if (status) selector.status = status;
  if (assignedTo) selector.assignedTo = assignedTo;
  if (category) selector.category = category;
  if (course) selector.course = course;
  // For search, filter after fetch
  const result = await db.find({ selector });
  let tickets = result.docs;
  if (search) {
    const s = (search as string).toLowerCase();
    tickets = tickets.filter((t: any) =>
      t.title?.toLowerCase().includes(s) ||
      t.content?.toLowerCase().includes(s) ||
      (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(s)))
    );
  }
  res.json({ success: true, data: { tickets } });
}));

// Create a help ticket
router.post('/help-tickets', authenticateToken, [
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('assignedTo').notEmpty(),
  body('category').notEmpty(),
  body('priority').notEmpty(),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const { title, content, assignedTo, category, priority, tags, course } = req.body;
  const ticket = await db.put({
    _id: `help_ticket_${Date.now()}`,
    type: 'help-ticket',
    title,
    content,
    author: userId,
    email: (user.email || ''),
    date: new Date().toISOString(),
    status: 'open',
    priority,
    category,
    tags,
    assignedTo,
    course: course || null
  });
  res.status(201).json({ success: true, message: 'Help ticket created', data: { ticket } });
}));

// Get help ticket by ID
router.get('/help-tickets/:ticketId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const ticket = await db.get(req.params.ticketId) as any;
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, data: { ticket } });
}));

// Update help ticket (only creator, assignedTo, or admin)
router.patch('/help-tickets/:ticketId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const ticket = await db.get(req.params.ticketId) as any;
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (
    (user.role || '') !== 'admin' &&
    ticket.author !== userId &&
    ticket.assignedTo !== userId
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const updates = req.body;
  const updatedTicket = await db.put({ ...ticket, ...updates });
  res.json({ success: true, message: 'Ticket updated', data: { ticket: updatedTicket } });
}));

// Delete help ticket (only creator, assignedTo, or admin)
router.delete('/help-tickets/:ticketId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const ticket = await db.get(req.params.ticketId) as any;
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (
    (user.role || '') !== 'admin' &&
    ticket.author !== userId &&
    ticket.assignedTo !== userId
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await db.remove(req.params.ticketId, ticket._rev);
  res.json({ success: true, message: 'Ticket deleted' });
}));

export default router; 