import express from 'express';
import { body, validationResult } from 'express-validator';
import Donation from '../models/Donation.js';
import { authenticateToken, isDonor, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all donations (public)
router.get('/', async (req, res) => {
  try {
    const { category, status, location, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter['location.city'] = new RegExp(location, 'i');

    const donations = await Donation.find(filter)
      .populate('donor', 'name email phone')
      .populate('recipient', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Donation.countDocuments(filter);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single donation
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('recipient', 'name email phone address')
      .populate('logistics', 'name email phone organization');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create donation (donors only)
router.post('/', authenticateToken, isDonor, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['food', 'clothing', 'medical', 'shelter', 'education', 'other']).withMessage('Valid category required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('condition').isIn(['new', 'like_new', 'good', 'fair', 'poor']).withMessage('Valid condition required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const donation = new Donation({
      ...req.body,
      donor: req.user._id
    });

    await donation.save();
    await donation.populate('donor', 'name email phone');

    res.status(201).json({
      message: 'Donation created successfully',
      donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation (donor or admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user can update this donation
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('donor', 'name email phone');

    res.json({
      message: 'Donation updated successfully',
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete donation (donor or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user can delete this donation
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's donations
router.get('/user/my-donations', authenticateToken, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('recipient', 'name email phone')
      .populate('logistics', 'name email phone organization')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
