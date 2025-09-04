import React, { useState } from 'react';
import { Mail, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

// Adapty raporundan çıkarılan benchmark veriler
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

  const calculateBenchmark = () => {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">App Profilini Oluştur</h2>
              <p className="text-gray-600 mb-6">Uygulamanızı industry benchmarks ile karşılaştırmak için temel bilgileri girin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App Kategorisi</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ana Pazar</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                >
                  <option value="">Bölge seçin</option>
                  {regions.map(region => <option key={region} value={region}>{region}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Planı</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.planType}
                  onChange={(e) => setFormData({...formData, planType: e.target.value})}
                >
                  <option value="">Plan türü seçin</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="9.99"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={formData.hasTrial}
                onChange={(e) => setFormData({...formData, hasTrial: e.target.checked})}
              />
              <label className="ml-2 block text-sm text-gray-700">Free trial sunuyorum</label>
            </div>

            <button
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              onClick={() => setStep(2)}
              disabled={!formData.category || !formData.region || !formData.planType || !formData.price}
            >
              Devam Et <ArrowRight className="inline h-4 w-4 ml-2" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Performans Metriklerini Girin</h2>
              <p className="text-gray-600 mb-6">Mevcut performansınızı industry ile karşılaştırabilmek için key metrics'leri paylaşın.</p>
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
                <p className="text-xs text-gray-500 mt-1">Trial'dan paid'e geçiş oranı</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">12-Aylık LTV ($)</label>
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
              Benchmark Analizi Yap <ArrowRight className="inline h-4 w-4 ml-2" />
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Adresinizi Girin</h2>
              <p className="text-gray-600 mb-6">Detaylı benchmark raporunu almak ve gelecekteki industry insights'ları kaçırmamak için email adresinizi paylaşın.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Adresi</label>
              <input 
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ornek@sirket.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Bonus İçerikler</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    • Aylık industry trend updates<br/>
                    • Kategori-specific optimization tips<br/>
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
              Raporumu Göster <ArrowRight className="inline h-4 w-4 ml-2" />
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Benchmark Raporu</h2>
              <p className="text-gray-600 mb-6">
                {formData.category} kategorisinde {formData.region} pazarındaki performansınız
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
              <h3 className="font-bold text-lg mb-3">Öneriler</h3>
              <ul className="space-y-2 text-sm">
                {results.conversion.diff < -10 && (
                  <li>• Conversion rate'inizi %{Math.abs(results.conversion.diff)} artırarak ayda ek gelir elde edebilirsiniz</li>
                )}
                {results.pricing.diff < -20 && (
                  <li>• Fiyat artışı test etmeyi düşünün - market toleransı görünüyor</li>
                )}
                {results.ltv.diff < -15 && (
                  <li>• LTV optimizasyonu için retention stratejilerinizi gözden geçirin</li>
                )}
                <li>• Adapty ile A/B testing yaparak bu metrikleri iyileştirebilirsiniz</li>
              </ul>
            </div>

            <div className="bg-purple-600 text-white p-6 rounded-lg text-center">
              <h3 className="text-lg font-bold mb-2">Bu Metrikleri Nasıl İyileştirirsiniz?</h3>
              <p className="mb-4">Adapty ile paywalls'larınızı optimize edin, pricing test edin, ve revenue'nizi artırın.</p>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Demo Rezervasyonu Yap
              </button>
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
            Uygulamanızı $1.9B analiz verisine dayalı industry benchmarks ile karşılaştırın
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= num ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {num}
              </div>
              {num < 4 && (
                <div className={`w-24 h-1 mx-2 ${step > num ? 'bg-purple-600' : 'bg-gray-200'}`} />
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