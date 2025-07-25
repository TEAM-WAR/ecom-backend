import express from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from "../controllers/TransactionController.js";

const router = express.Router();

// Routes CRUD pour les transactions
router.post("/", createTransaction);
router.get("/", getAllTransactions);
router.get("/stats", getTransactionStats);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router; 