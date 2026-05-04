import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './route/user.route.js';
import otpRoutes from './route/otp.route.js';
import stockRoutes from './route/stock.route.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/stocks', stockRoutes);

app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });
