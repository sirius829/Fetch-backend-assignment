import { Router } from "express";
import { getPoints, processReceipt } from "../controllers/receiptController";

const router = Router();

router.get('/:id/points', getPoints);
router.post('/process', processReceipt);

export default router;