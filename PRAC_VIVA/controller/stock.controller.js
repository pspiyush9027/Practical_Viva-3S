
import Stock from '../models/stock.model.js';

export const createStock = async (req, res) => {
    try {
        const { StockName, StockSymbol, CurrentPrice, Sector } = req.body;
        if (!StockName || !StockSymbol || CurrentPrice === undefined) {
            return res.status(400).json({ message: 'StockName, StockSymbol and CurrentPrice are required' });
        }
        const existingStock = await Stock.findOne({ StockSymbol });
        if (existingStock) {
            return res.status(400).json({ message: 'Stock with this symbol already exists' });
        }
        const newStock = new Stock({ StockName, StockSymbol, CurrentPrice, Sector });
        await newStock.save();
        return res.status(201).json({ message: 'Stock created successfully', stock: newStock });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create stock', error: error.message });
    }
};

export const getAllStocks = async (req, res) => {
    try {
        const stocks = await Stock.find();  
        return res.status(200).json({ stocks });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve stocks', error: error.message });
    }
};

export const getStockById = async (req, res) => {
    try {
        const stockId = req.params.id;
        const stock = await Stock.findById(stockId);
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        return res.status(200).json({ stock });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve stock', error: error.message });
    }
};


export const updateStock = async (req, res) => {
    try {
        const stockId = req.params.id;
        const { StockName, StockSymbol, CurrentPrice, Sector } = req.body;
        const stock = await Stock.findById(stockId);
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        if (StockName) stock.StockName = StockName;
        if (StockSymbol) stock.StockSymbol = StockSymbol;
        if (CurrentPrice !== undefined) stock.CurrentPrice = CurrentPrice;
        if (Sector) stock.Sector = Sector;
        await stock.save();
        return res.status(200).json({ message: 'Stock updated successfully', stock });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update stock', error: error.message });
    }
};

export const searchStocks = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const stocks = await Stock.find({  
            $or: [
                { StockName: { $regex: query, $options: 'i' } }, //  
                { StockSymbol: { $regex: query, $options: 'i' } },
                { Sector: { $regex: query, $options: 'i' } },
            ],
        });
        return res.status(200).json({ stocks });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to search stocks', error: error.message });
    }
};


