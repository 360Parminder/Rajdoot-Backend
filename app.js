const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');


const userRoutes = require('./routes/userRoutes');
const apiKey = require('./routes/apiKeyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const waitlistRoutes = require('./routes/waitListRoutes');
const planRoutes = require('./routes/plansRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const app = express();

const allowedOrigins = [
    "https://rajdoot.parminder.info",
    "http://localhost:5173",
    "https://rajdoot-testing.vercel.app",
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      console.log('Requested Origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
  // Enable CORS
  app.use(cors(corsOptions));
  
  // CORS preflight
  app.options('*', cors(corsOptions))

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API 
const limiter = rateLimit({
    max: 250,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many Request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({
    limit: '15kb'
}));

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());
// Server Status Route

// Routes
app.use('/api/v1', require('./routes/statusRoutes'));
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/api-keys', apiKey);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/plans', planRoutes );
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// handle undefined Routes
app.use('*', (req, res, next) => {
    const err = new AppError(404, 'fail', 'undefined route');
    next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;