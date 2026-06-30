import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/file.routes.js';
import appRoutes from './routes/app.routes.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// Production CORS — allow Vercel frontend and localhost dev
const allowedOrigins = [
    process.env.FRONTEND_URL,           // e.g. https://nerdyos.vercel.app
    'http://localhost:5173',             // Vite dev server
    'http://localhost:4173',             // Vite preview
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in initial deployment; tighten later
        }
    },
    credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/apps', appRoutes);

// Health check for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('NerdyOS API is running...');
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Required for Render

app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));

