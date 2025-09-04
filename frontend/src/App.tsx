import React, { useState } from 'react';
import { Mail, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

// Benchmark data extracted from Adapty report
const BENCHMARKS = {
  conversion: {
    'Education': { installTrial: 6.83, trialPaid: 29.31, installPaid: 0.83 },
    'Health & Fitness': { installTrial: 4.79, trialPaid: 38.56, installPaid: 1.55 },
    'Lifestyle': { installTrial: 3.96, trialPaid: 21.8, installPaid: 1.83 },
    'Photo & Video': { installTrial: 6.06, trialPaid: 18.35, installPaid: 3.15 },
    'Productivity': { installTrial: 4.85, trialPaid: 23.32, installPaid: 0.66 },
    'Utilities': { installTrial: 2.82, trialPaid: 19.29, installPaid: 0.33 }
  },
  pricing: {
    weekly: {
      'US': 8.1, 'Europe': 8.3, 'APAC': 6.4, 'LATAM': 6.1, 'MEA': 7.1
    },
    monthly: {
      'US': 15.2, 'Europe': 13.3, 'APAC': 8.1, 'LATAM': 6.7, 'MEA': 9.5
    },
    annual: {
      'US': 44.6, 'Europe': 42.0, 'APAC': 38.1, 'LATAM': 31.9, 'MEA': 37.0
    }
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

const BenchmarkTool = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    region: '',
    planType: '',
    price: '',
    hasTrial: false,
    email: '',
    conversionRate: '',
    ltv: '',
    refundRate: ''
  });
  const [results, setResults] = useState(null);

  const categories = ['Education', 'Health & Fitness', 'Lifestyle', 'Photo & Video', 'Productivity', 'Utilities'];
  const regions = ['US', 'Europe', 'APAC', 'LATAM', 'MEA'];
  const planTypes = ['weekly', 'monthly', 'annual'];
  
  // Apple App Store pricing tiers (USD)
  const priceTiers = [
    { label: '$0.99', value: 0.99 },
    { label: '$1.99', value: 1.99 },
    { label: '$2.99', value: 2.99 },
    { label: '$3.99', value: 3.99 },
    { label: '$4.99', value: 4.99 },
    { label: '$5.99', value: 5.99 },
    { label: '$6.99', value: 6.99 },
    { label: '$7.99', value: 7.99 },
    { label: '$8.99', value: 8.99 },
    { label: '$9.99', value: 9.99 },
    { label: '$12.99', value: 12.99 },
    { label: '$14.99', value: 14.99 },
    { label: '$19.99', value: 19.99 },
    { label: '$24.99', value: 24.99 },
    { label: '$29.99', value: 29.99 },
    { label: '$39.99', value: 39.99 },
    { label: '$49.99', value: 49.99 },
    { label: '$59.99', value: 59.99 },
    { label: '$79.99', value: 79.99 },
    { label: '$99.99', value: 99.99 }
  ];

  const calculateBenchmark = () => {
    // Show analyzing screen first
    setStep(3.5);
    
    // Simulate analysis time with animation
    setTimeout(() => {
      const { category, region, planType, price, conversionRate, ltv, refundRate } = formData;
      
      const benchmarkPrice = BENCHMARKS.pricing[planType]?.[region] || 0;
      const benchmarkConversion = BENCHMARKS.conversion[category]?.trialPaid || 0;
      const benchmarkLTV = BENCHMARKS.ltv[category]?.[planType] || 0;
      const benchmarkRefund = BENCHMARKS.refundRate[category] || 0;

      const results = {
        pricing: {
          user: parseFloat(price),
          benchmark: benchmarkPrice,
          diff: ((parseFloat(price) - benchmarkPrice) / benchmarkPrice * 100).toFixed(1)
        },
        conversion: {
          user: parseFloat(conversionRate),
          benchmark: benchmarkConversion,
          diff: ((parseFloat(conversionRate) - benchmarkConversion) / benchmarkConversion * 100).toFixed(1)
        },
        ltv: {
          user: parseFloat(ltv),
          benchmark: benchmarkLTV,
          diff: ((parseFloat(ltv) - benchmarkLTV) / benchmarkLTV * 100).toFixed(1)
        },
        refund: {
          user: parseFloat(refundRate),
          benchmark: benchmarkRefund,
          diff: ((parseFloat(refundRate) - benchmarkRefund) / benchmarkRefund * 100).toFixed(1)
        }
      };

      setResults(results);
      setStep(4);
    }, 3000); // 3 second animation
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      category: '',
      region: '',
      planType: '',
      price: '',
      hasTrial: false,
      email: '',
      conversionRate: '',
      ltv: '',
      refundRate: ''
    });
    setResults(null);
  };

  const getPerformanceColor = (diff) => {
    if (diff > 10) return 'text-green-600 bg-green-50';
    if (diff < -10) return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getPerformanceIcon = (diff) => {
    if (diff > 10) return <TrendingUp className="h-5 w-5" />;
    if (diff < -10) return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create App Profile</h2>
              <p className="text-gray-600 mb-6">Enter basic information to compare your app against industry benchmarks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App Category</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Market</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                >
                  <option value="">Select region</option>
                  {regions.map(region => <option key={region} value={region}>{region}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.planType}
                  onChange={(e) => setFormData({...formData, planType: e.target.value})}
                >
                  <option value="">Select plan type</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                >
                  <option value="">Select price tier</option>
                  {priceTiers.map(tier => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={formData.hasTrial}
                onChange={(e) => setFormData({...formData, hasTrial: e.target.checked})}
              />
              <label className="ml-2 block text-sm text-gray-700">I offer free trial</label>
            </div>

            <button
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              onClick={() => setStep(2)}
              disabled={!formData.category || !formData.region || !formData.planType || !formData.price}
            >
              Continue <ArrowRight className="inline h-4 w-4 ml-2" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Performance Metrics</h2>
              <p className="text-gray-600 mb-6">Share your key metrics to compare your current performance with the industry.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Rate (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="15.5"
                  value={formData.conversionRate}
                  onChange={(e) => setFormData({...formData, conversionRate: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Trial to paid conversion rate</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">12-Month LTV ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="45.00"
                  value={formData.ltv}
                  onChange={(e) => setFormData({...formData, ltv: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refund Rate (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="3.2"
                  value={formData.refundRate}
                  onChange={(e) => setFormData({...formData, refundRate: e.target.value})}
                />
              </div>
            </div>

            <button
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              onClick={() => setStep(3)}
              disabled={!formData.conversionRate || !formData.ltv || !formData.refundRate}
            >
              Run Benchmark Analysis <ArrowRight className="inline h-4 w-4 ml-2" />
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Your Email</h2>
              <p className="text-gray-600 mb-6">Share your email to receive the detailed benchmark report and not miss future industry insights.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="example@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Bonus Content</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    • Monthly industry trend updates<br/>
                    • Category-specific optimization tips<br/>
                    • Exclusive webinar invitations
                  </p>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              onClick={calculateBenchmark}
              disabled={!formData.email}
            >
              Show My Report <ArrowRight className="inline h-4 w-4 ml-2" />
            </button>
          </div>
        );

      case 3.5:
        return (
          <div className="space-y-8">
            {/* Analyzing Animation */}
            <div className="text-center py-16">
              {/* Main spinning circle */}
              <div className="relative mx-auto mb-8">
                <div className="w-32 h-32 mx-auto relative">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-spin">
                    <div className="w-4 h-4 bg-purple-600 rounded-full absolute -top-2 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  {/* Inner pulsing circle */}
                  <div className="absolute inset-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-pulse flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-white animate-bounce" />
                  </div>
                </div>
                
                {/* Floating data points */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                  <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-indigo-300 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                </div>
              </div>

              {/* Analyzing text */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Analyzing Your App Performance
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Comparing your metrics against $1.9B industry data...
              </p>

              {/* Progress steps */}
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center text-left">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-4 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Processing benchmark data...</span>
                </div>
                <div className="flex items-center text-left" style={{animationDelay: '1s'}}>
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-4 animate-pulse" style={{animationDelay: '1s'}}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Calculating performance metrics...</span>
                </div>
                <div className="flex items-center text-left" style={{animationDelay: '2s'}}>
                  <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center mr-4 animate-pulse" style={{animationDelay: '2s'}}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Generating recommendations...</span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="mt-12 flex justify-center space-x-4">
                <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-transparent rounded-full animate-pulse"></div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-transparent rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-transparent rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Benchmark Report</h2>
              <p className="text-gray-600 mb-6">
                Your performance in {formData.category} category in {formData.region} market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pricing Comparison */}
              <div className={`p-4 rounded-lg border-2 ${getPerformanceColor(results.pricing.diff)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Pricing</h3>
                  {getPerformanceIcon(results.pricing.diff)}
                </div>
                <div className="text-2xl font-bold">${results.pricing.user}</div>
                <div className="text-sm">
                  Industry avg: ${results.pricing.benchmark} 
                  <span className="ml-2">
                    ({results.pricing.diff > 0 ? '+' : ''}{results.pricing.diff}%)
                  </span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className={`p-4 rounded-lg border-2 ${getPerformanceColor(results.conversion.diff)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Conversion Rate</h3>
                  {getPerformanceIcon(results.conversion.diff)}
                </div>
                <div className="text-2xl font-bold">{results.conversion.user}%</div>
                <div className="text-sm">
                  Industry avg: {results.conversion.benchmark}%
                  <span className="ml-2">
                    ({results.conversion.diff > 0 ? '+' : ''}{results.conversion.diff}%)
                  </span>
                </div>
              </div>

              {/* LTV */}
              <div className={`p-4 rounded-lg border-2 ${getPerformanceColor(results.ltv.diff)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">12-Month LTV</h3>
                  {getPerformanceIcon(results.ltv.diff)}
                </div>
                <div className="text-2xl font-bold">${results.ltv.user}</div>
                <div className="text-sm">
                  Industry avg: ${results.ltv.benchmark}
                  <span className="ml-2">
                    ({results.ltv.diff > 0 ? '+' : ''}{results.ltv.diff}%)
                  </span>
                </div>
              </div>

              {/* Refund Rate */}
              <div className={`p-4 rounded-lg border-2 ${getPerformanceColor(-results.refund.diff)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Refund Rate</h3>
                  {getPerformanceIcon(-results.refund.diff)}
                </div>
                <div className="text-2xl font-bold">{results.refund.user}%</div>
                <div className="text-sm">
                  Industry avg: {results.refund.benchmark}%
                  <span className="ml-2">
                    ({results.refund.diff > 0 ? '+' : ''}{results.refund.diff}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-3">Recommendations</h3>
              <ul className="space-y-2 text-sm">
                {results.conversion.diff < -10 && (
                  <li>• You can generate additional monthly revenue by increasing your conversion rate by {Math.abs(results.conversion.diff)}%</li>
                )}
                {results.pricing.diff < -20 && (
                  <li>• Consider testing a price increase - market shows tolerance</li>
                )}
                {results.ltv.diff < -15 && (
                  <li>• Review your retention strategies for LTV optimization</li>
                )}
                <li>• You can improve these metrics with A/B testing using Adapty</li>
              </ul>
            </div>

            <div className="bg-purple-600 text-white p-6 rounded-lg text-center">
              <h3 className="text-lg font-bold mb-2">How to Improve These Metrics?</h3>
              <p className="mb-4">Optimize your paywalls with Adapty, test pricing, and increase your revenue.</p>
              <div className="space-y-3">
                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Schedule Demo
                </button>
                <div>
                  <button 
                    onClick={resetForm}
                    className="bg-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-800 transition-colors"
                  >
                    Analyze Another App
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">App Benchmark Tool</h1>
          <p className="text-xl text-gray-600">
            Compare your app with industry benchmarks based on $1.9B analysis data
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= num || (step === 3.5 && num >= 3) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step === 3.5 && num === 4 ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  num
                )}
              </div>
              {num < 4 && (
                <div className={`w-24 h-1 mx-2 ${
                  step > num || (step === 3.5 && num >= 3) ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by Adapty's State of In-App Subscriptions 2025 Report
        </div>
      </div>
    </div>
  );
};

export default BenchmarkTool;