import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/optimize.routes';
import { initDatabase } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'PackAI Backend' });
});

app.listen(PORT, async () => {
  console.log(`📦 PackAI Backend server running on http://localhost:${PORT}`);
  // Initialize SQLite tables and default presets automatically
  await initDatabase();
});
