const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Error:', { error: err.message, stack: err.stack, path: req.path, method: req.method });

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, error: 'Errore validazione', details: errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'ID non valido' });
  }

  if (err.code === 11000) {
    return res. status(409).json({ success: false, error: 'Risorsa già esistente', field: Object.keys(err.keyPattern)[0] });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Errore server';

  const response = {
    success: false,
    error: message
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module. exports = errorHandler;