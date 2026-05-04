//POST /api/stocks
//GET /api/stocks
//GET /api/stocks/:id
//PUT /api/stocks/:id
//GET /api/stocks/search/:keyword or use query param on GET /api/stocks?search=tcs

import express from 'express';
import { createStock, getAllStocks, getStockById, updateStock, searchStocks } from '../controller/stock.controller.js';
const router = express.Router();

router.post('/create-Stock', createStock);
router.get('/All-Stocks', getAllStocks);
router.get('/search', searchStocks);
router.get('/stock', getStockById);
router.put('/updatestock', updateStock);

export default router; 