require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const farmerRoutes = require('./routes/farmerRoutes');
const treeRoutes = require('./routes/treeRoutes');
const updateRoutes = require('./routes/updateRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
/** Railway injects PORT; local dev often uses 5000 (see .env) */
const PORT = Number(process.env.PORT) || 5000;

const clientOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

/**
 * Browsers call the API from another origin (Vercel → Railway). If CLIENT_ORIGINS is a
 * short list, mobile / preview URLs can still be blocked — always allow *.vercel.app.
 */
function corsOrigin(origin, callback) {
  if (!origin) {
    return callback(null, true);
  }
  if (!clientOrigins || clientOrigins.length === 0) {
    return callback(null, true);
  }
  if (clientOrigins.includes(origin)) {
    return callback(null, true);
  }
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname.endsWith('.vercel.app')) {
      return callback(null, true);
    }
  } catch {
    // ignore invalid origin
  }
  callback(new Error(`CORS blocked for origin: ${origin}`));
}

app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
});

app.use('/api/farmers', farmerRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/auth', authRoutes);

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use. Stop the other process or set PORT in .env to a free port.`
        );
      } else {
        console.error('HTTP server error:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
