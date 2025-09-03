require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10
});
app.use('/api/', limiter);

// Benchmark data
const BENCHMARK_DATA = {
  conversion: {
    'Education': { installTrial: 6.83, trialPaid: 29.31, installPaid: 0.83 },
    'Health & Fitness': { installTrial: 4.79, trialPaid: 38.56, installPaid: 1.55 },
    'Lifestyle': { installTrial: 3.96, trialPaid: 21.8, installPaid: 1.83 },
    'Photo & Video': { installTrial: 6.06, trialPaid: 18.35, installPaid: 3.15 },
    'Productivity': { installTrial: 4.85, trialPaid: 23.32, installPaid: 0.66 },
    'Utilities': { installTrial: 2.82, trialPaid: 19.29, installPaid: 0.33 }
  },
  pricing: {
    weekly: { 'US': 8.1, 'Europe': 8.3, 'APAC': 6.4, 'LATAM': 6.1, 'MEA': 7.1 },
    monthly: { 'US': 15.2, 'Europe': 13.3, 'APAC': 8.1, 'LATAM': 6.7, 'MEA': 9.5 },
    annual: { 'US': 44.6, 'Europe': 42.0, 'APAC': 38.1, 'LATAM': 31.9, 'MEA': 37.0 }
  },
  ltv: {
    'Education': { weekly: 43.7, monthly: 36.0, annual: 45.8 },
    'Health & Fitness': { weekly: 43.6, monthly: 40.9, annual: 46.1 },
    'Lifestyle': { weekly: 30.0, monthly: 42.8, annual: 39.9 },
    'Photo & Video': { weekly: 24.8, monthly: 53.2, annual: 42.4 },
    'Productivity': { weekly: 53.2, monthly: 48.8, annual: 54.8 },
    'Utilities': { weekly: 58.4, monthly: 45.0, annual: 54.3 }
  },
  refundRate: {
    'Education': 2.8, 'Health & Fitness': 2.9, 'Lifestyle': 3.1,
    'Photo & Video': 3.2, 'Productivity': 2.7, 'Utilities': 3.0
  }
};

// Email configuration
let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// API Routes
app.post('/api/benchmark', async (req, res) => {
  try {
    const {
      category,
      region,
      planType,
      price,
      conversionRate,
      ltv,
      refundRate,
      email,
      hasTrial
    } = req.body;

    // Validate required fields
    if (!category || !region || !planType || !price || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get benchmark data
    const benchmarkPrice = BENCHMARK_DATA.pricing[planType]?.[region] || 0;
    const benchmarkConversion = hasTrial 
      ? BENCHMARK_DATA.conversion[category]?.trialPaid || 0
      : BENCHMARK_DATA.conversion[category]?.installPaid || 0;
    const benchmarkLTV = BENCHMARK_DATA.ltv[category]?.[planType] || 0;
    const benchmarkRefund = BENCHMARK_DATA.refundRate[category] || 0;

    // Calculate differences
    const results = {
      pricing: {
        user: parseFloat(price),
        benchmark: benchmarkPrice,
        diff: benchmarkPrice ? ((parseFloat(price) - benchmarkPrice) / benchmarkPrice * 100).toFixed(1) : 0
      },
      conversion: {
        user: parseFloat(conversionRate) || 0,
        benchmark: benchmarkConversion,
        diff: benchmarkConversion ? ((parseFloat(conversionRate) - benchmarkConversion) / benchmarkConversion * 100).toFixed(1) : 0
      },
      ltv: {
        user: parseFloat(ltv) || 0,
        benchmark: benchmarkLTV,
        diff: benchmarkLTV ? ((parseFloat(ltv) - benchmarkLTV) / benchmarkLTV * 100).toFixed(1) : 0
      },
      refund: {
        user: parseFloat(refundRate) || 0,
        benchmark: benchmarkRefund,
        diff: benchmarkRefund ? ((parseFloat(refundRate) - benchmarkRefund) / benchmarkRefund * 100).toFixed(1) : 0
      }
    };

    // Generate recommendations
    const recommendations = generateRecommendations(results, category, planType);

    // Send email if configured
    if (transporter) {
      await sendBenchmarkEmail(email, results, recommendations, {
        category,
        region,
        planType
      });
    }

    res.json({
      success: true,
      results,
      recommendations
    });

  } catch (error) {
    console.error('Benchmark calculation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function generateRecommendations(results, category, planType) {
  const recommendations = [];

  if (parseFloat(results.conversion.diff) < -10) {
    recommendations.push({
      type: 'conversion',
      priority: 'high',
      message: `Increase your conversion rate by ${Math.abs(results.conversion.diff)}% to generate additional monthly revenue`,
      action: 'A/B test different trial lengths and paywall designs'
    });
  }

  if (parseFloat(results.pricing.diff) < -20) {
    recommendations.push({
      type: 'pricing',
      priority: 'medium',
      message: 'Consider testing a price increase - market shows tolerance',
      action: 'Test 10-15% price increase with A/B testing'
    });
  }

  if (parseFloat(results.ltv.diff) < -15) {
    recommendations.push({
      type: 'retention',
      priority: 'high',
      message: 'Review your retention strategies to optimize LTV',
      action: 'Focus on onboarding and feature adoption'
    });
  }

  if (parseFloat(results.refund.diff) > 15) {
    recommendations.push({
      type: 'refund',
      priority: 'medium',
      message: 'Your refund rate is above industry average',
      action: 'Review onboarding flow and set proper expectations'
    });
  }

  recommendations.push({
    type: 'platform',
    priority: 'low',
    message: 'Track and optimize all these metrics automatically with Adapty',
    action: 'Schedule a demo to see how Adapty can improve your metrics'
  });

  return recommendations;
}

async function sendBenchmarkEmail(email, results, recommendations, appInfo) {
  const htmlContent = generateEmailHTML(results, recommendations, appInfo);
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'benchmark@example.com',
    to: email,
    subject: `Your ${appInfo.category} App Benchmark Report`,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Benchmark email sent to:', email);
  } catch (error) {
    console.error('Email send error:', error);
  }
}

function generateEmailHTML(results, recommendations, appInfo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your App Benchmark Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h1>Your App Benchmark Report</h1>
      <p>Here are your benchmark results for ${appInfo.category} in ${appInfo.region}:</p>
      
      <div style="margin: 20px 0;">
        <h2>Metrics Comparison</h2>
        ${Object.entries(results).map(([key, value]) => `
          <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
            <h3 style="margin: 0;">${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
            <p>Your value: ${value.user}</p>
            <p>Benchmark: ${value.benchmark}</p>
            <p>Difference: ${value.diff}%</p>
          </div>
        `).join('')}
      </div>

      <div style="margin: 20px 0;">
        <h2>Recommendations</h2>
        ${recommendations.map(rec => `
          <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
            <h3 style="margin: 0; color: ${rec.priority === 'high' ? '#dc2626' : rec.priority === 'medium' ? '#d97706' : '#4f46e5'}">
              ${rec.priority.toUpperCase()} Priority
            </h3>
            <p>${rec.message}</p>
            <p style="font-style: italic;">💡 ${rec.action}</p>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; text-align: center;">
        <p>Want to improve these metrics?</p>
        <a href="https://adapty.io/demo" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">
          Schedule Demo
        </a>
      </div>
    </body>
    </html>
  `;
}

// Get benchmark data endpoint
app.get('/api/benchmarks/:category/:region/:planType', (req, res) => {
  const { category, region, planType } = req.params;
  
  const data = {
    pricing: BENCHMARK_DATA.pricing[planType]?.[region],
    conversion: BENCHMARK_DATA.conversion[category]?.trialPaid,
    ltv: BENCHMARK_DATA.ltv[category]?.[planType],
    refundRate: BENCHMARK_DATA.refundRate[category]
  };

  res.json(data);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;