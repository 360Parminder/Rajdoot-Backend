const express = require('express');
const router = express.Router();
const { formatMemory, formatUptime } = require('../utils/format');

router.get('/status', (req, res) => {
  const uptime = process.uptime();
  const { heapUsed, heapTotal, rss } = process.memoryUsage();
  const memoryUsagePercent = ((heapUsed / heapTotal) * 100).toFixed(2);

  const acceptHeader = req.headers.accept || '';

  if (acceptHeader.includes('application/json')) {
    return res.status(200).json({
      status: 'online',
      message: '✅ Server is running perfectly!',
      server: {
        uptime: {
          raw: Math.floor(uptime),
          formatted: formatUptime(uptime),
        },
        memory: {
          used: formatMemory(heapUsed),
          total: formatMemory(heapTotal),
          rss: formatMemory(rss),
          usagePercentage: `${memoryUsagePercent}%`,
        },
        environment: process.env.NODE_ENV || 'development',
      },
      timestamp: new Date().toISOString(),
      version: process.version,
    });
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rajdoot Server Status</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 25px; margin-top: 20px; }
        .header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .status-badge { display: inline-block; background-color: #4CAF50; color: white; padding: 8px 16px; border-radius: 50px; font-weight: bold; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-card { background-color: #f9f9f9; border-radius: 6px; padding: 15px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
        .info-card h3 { margin-top: 0; color: #555; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .progress-bar { height: 20px; background-color: #e0e0e0; border-radius: 10px; margin: 10px 0; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #4CAF50; width: ${memoryUsagePercent}%; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #777; }
        .stat-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .stat-label { font-weight: 500; color: #666; }
        .stat-value { font-family: monospace; background-color: #eef; padding: 2px 6px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="status-badge">✅ ONLINE</div>
          <h1>Rajdoot Server Status</h1>
          <p>The server is up and running perfectly!</p>
        </div>
        
        <div class="info-grid">
          <div class="info-card">
            <h3>Server Information</h3>
            <div class="stat-row"><span class="stat-label">Environment:</span> <span class="stat-value">${process.env.NODE_ENV || 'development'}</span></div>
            <div class="stat-row"><span class="stat-label">Node Version:</span> <span class="stat-value">${process.version}</span></div>
            <div class="stat-row"><span class="stat-label">Server Time:</span> <span class="stat-value">${new Date().toLocaleString()}</span></div>
          </div>
          
          <div class="info-card">
            <h3>Uptime</h3>
            <div class="stat-row"><span class="stat-label">Total Uptime:</span> <span class="stat-value">${formatUptime(uptime)}</span></div>
            <div class="stat-row"><span class="stat-label">Raw Seconds:</span> <span class="stat-value">${Math.floor(uptime)}</span></div>
          </div>
          
          <div class="info-card">
            <h3>Memory Usage</h3>
            <div class="stat-row"><span class="stat-label">Heap Used:</span> <span class="stat-value">${formatMemory(heapUsed)}</span></div>
            <div class="stat-row"><span class="stat-label">Heap Total:</span> <span class="stat-value">${formatMemory(heapTotal)}</span></div>
            <div class="stat-row"><span class="stat-label">RSS:</span> <span class="stat-value">${formatMemory(rss)}</span></div>
            <div class="stat-row"><span class="stat-label">Usage:</span> <span class="stat-value">${memoryUsagePercent}%</span></div>
            <div class="progress-bar"><div class="progress-fill"></div></div>
          </div>
        </div>
        
        <div class="footer">
          <p>Rajdoot Server | Last Updated: ${new Date().toISOString()}</p>
          <p><small>For JSON response, set Accept: application/json in request header</small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

module.exports = router;
