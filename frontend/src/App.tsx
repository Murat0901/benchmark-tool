import { useState } from 'react'
import axios from 'axios'

interface FormData {
  category: string
  region: string
  planType: string
  price: number | ''
  hasTrial: boolean
  conversionRate: number | ''
  ltv: number | ''
  refundRate: number | ''
  email: string
}

interface BenchmarkResult {
  categoryAverage: {
    conversionRate: number
    ltv: number
    refundRate: number
  }
  comparison: {
    conversionRate: 'above' | 'below' | 'average'
    ltv: 'above' | 'below' | 'average'
    refundRate: 'above' | 'below' | 'average'
  }
  recommendations: string[]
}

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    category: '',
    region: '',
    planType: '',
    price: '',
    hasTrial: false,
    conversionRate: '',
    ltv: '',
    refundRate: '',
    email: ''
  })
  const [results, setResults] = useState<BenchmarkResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    'Games',
    'Health & Fitness',
    'Productivity',
    'Entertainment',
    'Education',
    'Social Networking',
    'Photo & Video',
    'Music',
    'Business',
    'Utilities'
  ]

  const regions = [
    'North America',
    'Europe',
    'Asia Pacific',
    'Latin America',
    'Middle East & Africa'
  ]

  const planTypes = [
    'Freemium',
    'Premium',
    'Subscription',
    'One-time Purchase',
    'In-app Purchases'
  ]

  // Mapping functions to translate UI values to backend values
  const mapCategoryToBackend = (category: string): string => {
    const mapping: { [key: string]: string } = {
      'Games': 'Utilities',
      'Health & Fitness': 'Health & Fitness',
      'Productivity': 'Productivity',
      'Entertainment': 'Lifestyle',
      'Education': 'Education',
      'Social Networking': 'Lifestyle',
      'Photo & Video': 'Photo & Video',
      'Music': 'Lifestyle',
      'Business': 'Productivity',
      'Utilities': 'Utilities'
    }
    return mapping[category] || 'Utilities'
  }

  const mapRegionToBackend = (region: string): string => {
    const mapping: { [key: string]: string } = {
      'North America': 'US',
      'Europe': 'Europe',
      'Asia Pacific': 'APAC',
      'Latin America': 'LATAM',
      'Middle East & Africa': 'MEA'
    }
    return mapping[region] || 'US'
  }

  const mapPlanTypeToBackend = (planType: string): string => {
    const mapping: { [key: string]: string } = {
      'Freemium': 'monthly',
      'Premium': 'annual',
      'Subscription': 'monthly',
      'One-time Purchase': 'annual',
      'In-app Purchases': 'weekly'
    }
    return mapping[planType] || 'monthly'
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Map frontend data to backend format
      const backendData = {
        category: mapCategoryToBackend(formData.category),
        region: mapRegionToBackend(formData.region),
        planType: mapPlanTypeToBackend(formData.planType),
        price: formData.price,
        conversionRate: formData.conversionRate,
        ltv: formData.ltv,
        refundRate: formData.refundRate,
        email: formData.email,
        hasTrial: formData.hasTrial
      }

      const response = await axios.post('/api/benchmark', backendData)
      
      if (response.data.success) {
        // Transform backend response to frontend format
        const backendResults = response.data.results
        const transformedResults: BenchmarkResult = {
          categoryAverage: {
            conversionRate: backendResults.conversion.benchmark,
            ltv: backendResults.ltv.benchmark,
            refundRate: backendResults.refund.benchmark
          },
          comparison: {
            conversionRate: parseFloat(backendResults.conversion.diff) > 5 ? 'above' : 
                           parseFloat(backendResults.conversion.diff) < -5 ? 'below' : 'average',
            ltv: parseFloat(backendResults.ltv.diff) > 5 ? 'above' : 
                 parseFloat(backendResults.ltv.diff) < -5 ? 'below' : 'average',
            refundRate: parseFloat(backendResults.refund.diff) > 5 ? 'above' : 
                       parseFloat(backendResults.refund.diff) < -5 ? 'below' : 'average'
          },
          recommendations: response.data.recommendations.map((rec: any) => rec.message)
        }
        
        setResults(transformedResults)
        nextStep()
      } else {
        setError('Failed to get benchmark results')
      }
    } catch (err: any) {
      console.error('API Error:', err)
      setError(err.response?.data?.error || 'An error occurred while processing your request')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      category: '',
      region: '',
      planType: '',
      price: '',
      hasTrial: false,
      conversionRate: '',
      ltv: '',
      refundRate: '',
      email: ''
    })
    setResults(null)
    setError(null)
  }

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case 'above': return 'text-green-600'
      case 'below': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getComparisonIcon = (comparison: string) => {
    switch (comparison) {
      case 'above': return '↑'
      case 'below': return '↓'
      default: return '='
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            App Performance Benchmark Tool
          </h1>
          <p className="text-lg text-gray-600">
            Compare your app's performance against industry standards
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>App Profile</span>
            <span>Performance</span>
            <span>Email</span>
            <span>Results</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: App Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Step 1: App Profile
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Region *
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => updateFormData('region', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monetization Model *
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => updateFormData('planType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select monetization model</option>
                    {planTypes.map(planType => (
                      <option key={planType} value={planType}>{planType}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Point (USD) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g., 9.99"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hasTrial"
                  checked={formData.hasTrial}
                  onChange={(e) => updateFormData('hasTrial', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasTrial" className="text-sm font-medium text-gray-700">
                  Offers free trial or freemium version
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!formData.category || !formData.region || !formData.planType || formData.price === ''}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Performance Metrics */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Step 2: Performance Metrics
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversion Rate (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.conversionRate}
                    onChange={(e) => updateFormData('conversionRate', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g., 3.5"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of users who convert to paid
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Lifetime Value (USD) *
                  </label>
                  <input
                    type="number"
                    value={formData.ltv}
                    onChange={(e) => updateFormData('ltv', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g., 25.50"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Average revenue per customer over their lifetime
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Rate (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.refundRate}
                    onChange={(e) => updateFormData('refundRate', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g., 2.1"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of purchases that are refunded
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={formData.conversionRate === '' || formData.ltv === '' || formData.refundRate === ''}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Email */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Step 3: Get Your Results
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Unlock Premium Insights
                </h3>
                <p className="text-blue-800 mb-4">
                  Get detailed benchmarking report including:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 mb-4">
                  <li>Industry-specific performance comparisons</li>
                  <li>Personalized optimization recommendations</li>
                  <li>Monthly performance tracking tips</li>
                  <li>Access to advanced analytics dashboard</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send your benchmark results and bonus content to this email
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.email || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Get My Results</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && results && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Benchmark Results
              </h2>

              {/* App Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your App Profile
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-600">{formData.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Region:</span>
                    <span className="ml-2 text-gray-600">{formData.region}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Model:</span>
                    <span className="ml-2 text-gray-600">{formData.planType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <span className="ml-2 text-gray-600">${formData.price}</span>
                  </div>
                </div>
              </div>

              {/* Performance Comparison */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-gray-100 rounded-lg p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Conversion Rate
                    </h4>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {formData.conversionRate}%
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Industry avg: {results.categoryAverage.conversionRate}%
                    </div>
                    <div className={`text-lg font-semibold ${getComparisonColor(results.comparison.conversionRate)}`}>
                      {getComparisonIcon(results.comparison.conversionRate)} {results.comparison.conversionRate}
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-lg p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Customer LTV
                    </h4>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      ${formData.ltv}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Industry avg: ${results.categoryAverage.ltv}
                    </div>
                    <div className={`text-lg font-semibold ${getComparisonColor(results.comparison.ltv)}`}>
                      {getComparisonIcon(results.comparison.ltv)} {results.comparison.ltv}
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-lg p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Refund Rate
                    </h4>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {formData.refundRate}%
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Industry avg: {results.categoryAverage.refundRate}%
                    </div>
                    <div className={`text-lg font-semibold ${getComparisonColor(results.comparison.refundRate === 'below' ? 'above' : results.comparison.refundRate === 'above' ? 'below' : 'average')}`}>
                      {getComparisonIcon(results.comparison.refundRate === 'below' ? 'above' : results.comparison.refundRate === 'above' ? 'below' : 'average')} {results.comparison.refundRate === 'below' ? 'better' : results.comparison.refundRate === 'above' ? 'worse' : 'average'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white border-2 border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personalized Recommendations
                </h3>
                <ul className="space-y-3">
                  {results.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Report Sent Successfully!
                </h3>
                <p className="text-green-800">
                  A detailed benchmark report with additional insights has been sent to{' '}
                  <strong>{formData.email}</strong>
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Analyze Another App
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2024 App Benchmark Tool. Built with industry-leading analytics.</p>
        </div>
      </div>
    </div>
  )
}

export default App