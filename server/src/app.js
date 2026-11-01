const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');

/**
 * Build an explicit allow-list for browser origins.
 * CLIENT_URL accepts comma-separated origins, for example:
 * http://localhost:5174,https://tyagiji.example.com
 *
 * Vite can move from 5173 to 5174 when the default port is occupied, so both
 * local development ports are allowed by default. Production origins must
 * still be added explicitly through CLIENT_URL.
 */
function getAllowedOrigins() {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaults = process.env.NODE_ENV === 'production'
    ? []
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
      ];

  return new Set([...defaults, ...configured]);
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');

  const proxyHops = process.env.TRUST_PROXY_HOPS !== undefined
    ? Number(process.env.TRUST_PROXY_HOPS)
    : (process.env.NODE_ENV === 'production' ? 1 : 0);

  if (Number.isInteger(proxyHops) && proxyHops >= 0) {
    app.set('trust proxy', proxyHops);
  }

  app.use(helmet({ crossOriginEmbedderPolicy: false }));

  const allowedOrigins = getAllowedOrigins();
  const corsOptions = {
    origin(origin, callback) {
      // Requests from curl, health checks and server-to-server clients have no
      // Origin header and are not subject to browser CORS enforcement.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  };

  // CORS must run before parsers, rate limits and API routes so that browser
  // preflight OPTIONS requests receive the required CORS response headers.
  const corsMiddleware = cors(corsOptions);
  const applyCors = (req, res, next) => {
    // Same-origin requests do not need CORS headers. This also allows the
    // single-service Render deployment to work without hardcoding its URL.
    const origin = req.get('origin');
    const requestOrigin = `${req.protocol}://${req.get('host')}`;
    if (origin && origin === requestOrigin) return next();
    return corsMiddleware(req, res, next);
  };
  app.use(applyCors);
  app.options('*', applyCors);

  app.use(express.json({ limit: '1mb', strict: true }));
  app.use(cookieParser());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use(
    '/api/v1',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests. Please wait before trying again.',
      },
      handler(req, res, next, options) {
        res.status(options.statusCode).json(options.message);
      },
    })
  );

  app.use('/api/v1', routes);

  // In production, serve the built React app from the same origin as the API.
  // This keeps HTTP-only session cookies first-party and avoids a second host.
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res, next) => {
      if (req.path === '/api' || req.path.startsWith('/api/')) return next();
      if (req.method !== 'GET') return next();
      return res.sendFile(path.join(clientDist, 'index.html'), (error) => {
        if (error) next(error);
      });
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp, getAllowedOrigins };
