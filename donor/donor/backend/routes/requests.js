import express from 'express';
import { body, validationResult } from 'express-validator';
import Request from '../models/Request.js';
import { authenticateToken, isRecipient, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { category, status, priority, urgency, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (urgency) filter.urgency = urgency;

    const requests = await Request.find(filter)
      .populate('recipient', 'name email phone address')
      .populate('matchedDonation')
      .populate('logistics', 'name email phone organization')
      .sort({ priority: 1, urgency: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Request.countDocuments(filter);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('recipient', 'name email phone address')
      .populate('matchedDonation')
      .populate('logistics', 'name email phone organization');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create request (recipients only)
router.post('/', authenticateToken, isRecipient, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['food', 'clothing', 'medical', 'shelter', 'education', 'other']).withMessage('Valid category required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('urgency').optional().isIn(['normal', 'emergency', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = new Request({
      ...req.body,
      recipient: req.user._id
    });

    await request.save();
    await request.populate('recipient', 'name email phone address');

    res.status(201).json({
      message: 'Request created successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request (recipient or admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user can update this request
    if (request.recipient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('recipient', 'name email phone address');

    res.json({
      message: 'Request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete request (recipient or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user can delete this request
    if (request.recipient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's requests
router.get('/user/my-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find({ recipient: req.user._id })
      .populate('matchedDonation')
      .populate('logistics', 'name email phone organization')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Match request with donation (admin or logistics)
router.post('/:id/match', authenticateToken, async (req, res) => {
  try {
    const { donationId } = req.body;
    
    if (!donationId) {
      return res.status(400).json({ message: 'Donation ID required' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'logistics') {
      return res.status(403).json({ message: 'Not authorized to match requests' });
    }

    request.matchedDonation = donationId;
    request.status = 'matched';
    request.logistics = req.user._id;

    await request.save();

    res.json({
      message: 'Request matched successfully',
      request
    });
  } catch (error) {
    console.error('Match request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
