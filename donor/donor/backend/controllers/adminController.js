// controllers/adminController.js
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Request from "../models/Request.js";
import DonationDrive from "../models/DonationDrive.js";

export const getUsers = async (req, res) => {
  try {
    const { page = 1, perPage = 20, q = "" } = req.query;
    const skip = (page - 1) * perPage;

    const filter = q
      ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(perPage)).lean(),
      User.countDocuments(filter),
    ]);

    res.json({ users, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "donor", "recipient", "logistics"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStats = async (req, res) => {
  try {
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const totals = {};
    usersByRole.forEach((r) => (totals[r._id] = r.count));
    totals.users = await User.countDocuments();
    totals.donations = await Donation.countDocuments();
    totals.requests = await Request.countDocuments();
    totals.activeDrives = await DonationDrive.countDocuments({ status: { $in: ["active", "upcoming"] } });

    // more specific stats
    const pendingRequests = await Request.countDocuments({ status: "pending" });
    const availableDonations = await Donation.countDocuments({ status: "available" });

    const recentDrives = await DonationDrive.find().sort({ createdAt: -1 }).limit(5).select("title startDate endDate").lean();

    res.json({
      totals,
      pendingRequests,
      availableDonations,
      recentDrives,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReports = async (req, res) => {
  try {
    // Example: return recent activities (donations/requests/drive updates)
    const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(20).lean();
    const recentRequests = await Request.find().sort({ createdAt: -1 }).limit(20).lean();

    // build simple report entries
    const entries = [
      ...recentDonations.map((d) => ({ type: "donation", createdAt: d.createdAt, title: d.title, summary: d.description })),
      ...recentRequests.map((r) => ({ type: "request", createdAt: r.createdAt, title: r.title, summary: r.description })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ reports: entries.slice(0, 100) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
    