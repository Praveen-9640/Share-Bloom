import express from 'express';
import { body, validationResult } from 'express-validator';
import DonationDrive from '../models/DonationDrive.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all donation drives
router.get('/', async (req, res) => {
  try {
    const { status, category, isEmergency, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (isEmergency !== undefined) filter.isEmergency = isEmergency === 'true';

    const drives = await DonationDrive.find(filter)
      .populate('organizer', 'name email phone')
      .populate('logistics', 'name email phone organization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DonationDrive.countDocuments(filter);

    res.json({
      drives,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get drives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single drive
router.get('/:id', async (req, res) => {
  try {
    const drive = await DonationDrive.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('logistics', 'name email phone organization')
      .populate('volunteers.user', 'name email phone')
      .populate('currentDonations');

    if (!drive) {
      return res.status(404).json({ message: 'Donation drive not found' });
    }

    res.json(drive);
  } catch (error) {
    console.error('Get drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create donation drive (admin only)
router.post('/', authenticateToken, isAdmin, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['food', 'clothing', 'medical', 'shelter', 'education', 'mixed']).withMessage('Valid category required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const drive = new DonationDrive({
      ...req.body,
      organizer: req.user._id
    });

    await drive.save();
    await drive.populate('organizer', 'name email phone');

    res.status(201).json({
      message: 'Donation drive created successfully',
      drive
    });
  } catch (error) {
    console.error('Create drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation drive (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const drive = await DonationDrive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email phone');

    if (!drive) {
      return res.status(404).json({ message: 'Donation drive not found' });
    }

    res.json({
      message: 'Donation drive updated successfully',
      drive
    });
  } catch (error) {
    console.error('Update drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete donation drive (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const drive = await DonationDrive.findByIdAndDelete(req.params.id);

    if (!drive) {
      return res.status(404).json({ message: 'Donation drive not found' });
    }

    res.json({ message: 'Donation drive deleted successfully' });
  } catch (error) {
    console.error('Delete drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join drive as volunteer
router.post('/:id/volunteer', authenticateToken, async (req, res) => {
  try {
    const drive = await DonationDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ message: 'Donation drive not found' });
    }

    // Check if user is already a volunteer
    const existingVolunteer = drive.volunteers.find(
      v => v.user.toString() === req.user._id.toString()
    );

    if (existingVolunteer) {
      return res.status(400).json({ message: 'Already a volunteer for this drive' });
    }

    drive.volunteers.push({
      user: req.user._id,
      role: req.body.role || 'volunteer'
    });

    await drive.save();

    res.json({ message: 'Successfully joined as volunteer' });
  } catch (error) {
    console.error('Join drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
