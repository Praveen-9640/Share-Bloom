// routes/admin.js
import express from "express";
import {
  getUsers,
  changeRole,
  removeUser,
  getStats,
  getReports,
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// all routes protected + admin only
router.use(authenticateToken, isAdmin);

router.get("/users", getUsers);
router.put("/users/:id/role", changeRole);
router.delete("/users/:id", removeUser);

router.get("/stats", getStats);
router.get("/reports", getReports);

export default router;
