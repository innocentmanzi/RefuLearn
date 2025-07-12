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
const upload_1 = require("../middleware/upload");
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
const db = new pouchdb_1.default('http://Manzi:Clarisse101@localhost:5984/refulearn');
router.get('/tickets', auth_1.authenticateToken, [
    (0, express_validator_1.query)('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
    (0, express_validator_1.query)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const selector = { type: 'help_ticket', user: req.user._id.toString() };
    if (status) {
        selector.status = status;
    }
    if (priority) {
        selector.priority = priority;
    }
    const result = await db.find({ selector });
    const tickets = result.docs;
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
router.post('/tickets', auth_1.authenticateToken, upload_1.uploadAny, upload_1.handleUploadError, [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('category').isIn(['technical', 'account', 'course', 'payment', 'general']).withMessage('Invalid category'),
    (0, express_validator_1.body)('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('assignedTo').optional().isIn(['instructor', 'admin', 'employer']).withMessage('Invalid assigned role')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, category, priority, assignedTo } = req.body;
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
        user: req.user._id.toString(),
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
router.get('/tickets/:ticketId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    try {
        const ticket = await db.get(ticketId);
        if (ticket.user !== req.user._id.toString() &&
            !['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this ticket'
            });
        }
        res.json({
            success: true,
            data: { ticket }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Help ticket not found'
        });
    }
}));
router.put('/tickets/:ticketId', auth_1.authenticateToken, upload_1.uploadAny, upload_1.handleUploadError, [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('category').optional().isIn(['technical', 'account', 'course', 'payment', 'general']),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
    (0, express_validator_1.body)('assignedTo').optional().isIn(['instructor', 'admin', 'employer']).withMessage('Invalid assigned role')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const updates = req.body;
    const ticket = await db.get(ticketId);
    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Help ticket not found'
        });
    }
    if (ticket.user !== req.user._id.toString() &&
        !['admin', 'instructor'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this ticket'
        });
    }
    if (req.files && Array.isArray(req.files)) {
        const newAttachments = [];
        for (const file of req.files) {
            newAttachments.push(file.path);
        }
        if (ticket.attachments) {
            ticket.attachments.push(...newAttachments);
        }
        else {
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
router.post('/tickets/:ticketId/messages', auth_1.authenticateToken, [
    (0, express_validator_1.body)('message').trim().notEmpty().withMessage('Message is required'),
    (0, express_validator_1.body)('isInternal').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const { message, isInternal = false } = req.body;
    const ticket = await db.get(ticketId);
    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Help ticket not found'
        });
    }
    if (ticket.user !== req.user._id.toString() &&
        !['admin', 'instructor'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to add messages to this ticket'
        });
    }
    if (isInternal && !['admin', 'instructor'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to add internal messages'
        });
    }
    if (!ticket.messages) {
        ticket.messages = [];
    }
    ticket.messages.push({
        sender: req.user._id.toString(),
        message,
        isInternal,
        createdAt: new Date()
    });
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
router.put('/tickets/:ticketId/assign', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin', 'instructor'), [
    (0, express_validator_1.body)('assignedTo').isMongoId().withMessage('Valid user ID is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const { assignedTo } = req.body;
    const ticket = await db.get(ticketId);
    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Help ticket not found'
        });
    }
    const assignedUser = await db.get(assignedTo);
    if (!assignedUser || !['admin', 'instructor'].includes(req.user.role)) {
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
router.get('/all-tickets', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin', 'instructor'), [
    (0, express_validator_1.query)('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
    (0, express_validator_1.query)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    (0, express_validator_1.query)('category').optional().isIn(['technical', 'account', 'course', 'payment', 'general']),
    (0, express_validator_1.query)('assignedTo').optional().isMongoId(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, priority, category, assignedTo, page = 1, limit = 10 } = req.query;
    const query = { type: 'help_ticket' };
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
router.get('/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));
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
    const newTicketsResult = await db.find({ selector: { type: 'help_ticket', createdAt: { $gte: daysAgo } } });
    const newTickets = newTicketsResult.docs.length;
    const ticketsByCategoryResult = await db.find({ selector: { type: 'help_ticket' } });
    const ticketsByCategory = ticketsByCategoryResult.docs.map((doc) => ({
        _id: doc.category,
        count: 1
    }));
    const ticketsByPriorityResult = await db.find({ selector: { type: 'help_ticket' } });
    const ticketsByPriority = ticketsByPriorityResult.docs.map((doc) => ({
        _id: doc.priority,
        count: 1
    }));
    const resolvedTicketsWithTimeResult = await db.find({ selector: { type: 'help_ticket', status: 'resolved', resolvedAt: { $exists: true } } });
    const resolvedTicketsWithTime = resolvedTicketsWithTimeResult.docs;
    const totalResolutionTime = resolvedTicketsWithTime.reduce((sum, ticket) => {
        const resolutionTime = new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
        return sum + resolutionTime;
    }, 0);
    const averageResolutionTime = resolvedTicketsWithTime.length > 0
        ? totalResolutionTime / resolvedTicketsWithTime.length
        : 0;
    const recentTicketsResult = await db.find({ selector: { type: 'help_ticket' } });
    const recentTickets = recentTicketsResult.docs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((ticket) => ({
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
            averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60 * 24)),
            recentTickets
        }
    });
}));
router.get('/faq', (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('user').isMongoId().withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('subject').trim().notEmpty().withMessage('Subject is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high']),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const help = req.body;
    const createdHelp = await db.put(help);
    res.status(201).json({ success: true, message: 'Help ticket created successfully', data: { help: createdHelp } });
}));
router.get('/admin/all', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await db.find({ selector: { type: 'help_ticket' } });
    const helps = result.docs;
    res.json({ success: true, data: { helps } });
}));
router.get('/admin/:helpId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const help = await db.get(req.params.helpId);
    if (!help) {
        return res.status(404).json({ success: false, message: 'Help ticket not found' });
    }
    res.json({ success: true, data: { help } });
}));
router.put('/admin/:helpId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('subject').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high']),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { helpId } = req.params;
    const updates = req.body;
    const help = await db.get(helpId);
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
router.delete('/admin/:helpId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { helpId } = req.params;
    const help = await db.get(helpId);
    if (!help) {
        return res.status(404).json({ success: false, message: 'Help ticket not found' });
    }
    const latest = await db.get(help._id);
    help._rev = latest._rev;
    await db.remove(help);
    res.json({ success: true, message: 'Help ticket deleted successfully' });
}));
router.patch('/tickets/:ticketId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const updates = req.body;
    const ticket = await db.get(ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Help ticket not found' });
    }
    if (ticket.user !== req.user._id.toString() && !['admin', 'instructor'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this ticket' });
    }
    Object.assign(ticket, updates);
    ticket.updatedAt = new Date();
    const latest = await db.get(ticket._id);
    ticket._rev = latest._rev;
    const updatedTicket = await db.put(ticket);
    res.json({ success: true, message: 'Help ticket updated', data: { ticket: updatedTicket } });
}));
router.delete('/tickets/:ticketId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const ticket = await db.get(ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Help ticket not found' });
    }
    if (ticket.user !== req.user._id.toString() && !['admin', 'instructor'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this ticket' });
    }
    const latest = await db.get(ticket._id);
    ticket._rev = latest._rev;
    await db.remove(ticket);
    res.json({ success: true, message: 'Help ticket deleted' });
}));
router.patch('/tickets/:ticketId/update_status', auth_1.authenticateToken, [
    (0, express_validator_1.body)('status').isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;
    const ticket = await db.get(ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Help ticket not found' });
    }
    if (ticket.user.toString() !== req.user._id.toString() && !['admin', 'instructor'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this ticket' });
    }
    ticket.status = status;
    ticket.updatedAt = new Date();
    const latest = await db.get(ticket._id);
    ticket._rev = latest._rev;
    const updatedTicket = await db.put(ticket);
    res.json({ success: true, message: 'Help ticket status updated', data: { ticket: updatedTicket } });
}));
router.get('/help-tickets', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, assignedTo, search, category, course } = req.query;
    let selector = { type: 'help-ticket' };
    if (status)
        selector.status = status;
    if (assignedTo)
        selector.assignedTo = assignedTo;
    if (category)
        selector.category = category;
    if (course)
        selector.course = course;
    const result = await db.find({ selector });
    let tickets = result.docs;
    if (search) {
        const s = search.toLowerCase();
        tickets = tickets.filter((t) => t.title?.toLowerCase().includes(s) ||
            t.content?.toLowerCase().includes(s) ||
            (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(s))));
    }
    res.json({ success: true, data: { tickets } });
}));
router.post('/help-tickets', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').notEmpty(),
    (0, express_validator_1.body)('content').notEmpty(),
    (0, express_validator_1.body)('assignedTo').notEmpty(),
    (0, express_validator_1.body)('category').notEmpty(),
    (0, express_validator_1.body)('priority').notEmpty(),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, content, assignedTo, category, priority, tags, course } = req.body;
    const ticket = await db.put({
        _id: `help_ticket_${Date.now()}`,
        type: 'help-ticket',
        title,
        content,
        author: req.user._id,
        email: req.user.email,
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
router.get('/help-tickets/:ticketId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const ticket = await db.get(req.params.ticketId);
    if (!ticket)
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: { ticket } });
}));
router.patch('/help-tickets/:ticketId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const ticket = await db.get(req.params.ticketId);
    if (!ticket)
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (req.user.role !== 'admin' &&
        ticket.author !== req.user._id &&
        ticket.assignedTo !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updates = req.body;
    const updatedTicket = await db.put({ ...ticket, ...updates });
    res.json({ success: true, message: 'Ticket updated', data: { ticket: updatedTicket } });
}));
router.delete('/help-tickets/:ticketId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const ticket = await db.get(req.params.ticketId);
    if (!ticket)
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (req.user.role !== 'admin' &&
        ticket.author !== req.user._id &&
        ticket.assignedTo !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await db.remove(req.params.ticketId, ticket._rev);
    res.json({ success: true, message: 'Ticket deleted' });
}));
exports.default = router;
//# sourceMappingURL=help.routes.js.map