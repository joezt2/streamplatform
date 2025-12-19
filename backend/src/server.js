const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const contentRoutes = require('./routes/contentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 500, // 500 richieste
  message: { success: false, error: 'Troppe richieste, riprova più tardi' },
  standardHeaders: true,
  legacyHeaders: false,
  // Escludi alcune route dal rate limiting
  skip: (req) => {
    // Non limitare le richieste di health check
    return req.path === '/health';
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(limiter); // ← Applica rate limiter

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/contents', contentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint non trovato' });
});

// Error Handler
app.use(errorHandler);

// MongoDB Connection
mongoose.connect(process. env.MONGODB_URI)
  .then(() => {
    logger.info('Connesso a MongoDB');
    logger.info(`Database: ${mongoose.connection.name}`);
    
    app.listen(PORT, () => {
      logger.info(`Server avviato sulla porta ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API: http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    logger.error('Errore connessione MongoDB:', err);
    process.exit(1);
  });

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM ricevuto, chiusura server...');
  mongoose.connection.close();
  process.exit(0);
});