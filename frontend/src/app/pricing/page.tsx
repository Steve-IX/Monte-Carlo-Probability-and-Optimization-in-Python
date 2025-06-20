'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  CheckIcon,
  CurrencyPoundIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface PricingTier {
  name: string
  id: string
  price_monthly: number
  price_annual: number
  features: string[]
  limits: {
    users: number
    simulations_per_month: number
    max_iterations: number
    pdf_downloads: number
  }
}

export default function PricingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [processingCheckout, setProcessingCheckout] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/')
        return
      }
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      loadPricing()
    }
  }, [isAuthenticated])

  const loadPricing = async () => {
    try {
      const response = await authService.apiRequest<{ tiers: PricingTier[] }>('/api/v1/billing/pricing')
      setPricingTiers(response.tiers)
    } catch (error) {
      console.error('Failed to load pricing:', error)
      toast.error('Failed to load pricing information')
    }
  }

  const handleUpgrade = async (tierId: string) => {
    setProcessingCheckout(tierId)
    
    try {
      const response = await authService.apiRequest<{ checkout_url: string }>('/api/v1/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          tier: tierId,
          annual: billingCycle === 'annual',
          success_url: `${window.location.origin}/success?tier=${tierId}`,
          cancel_url: `${window.location.origin}/pricing`
        })
      })

      // In a real implementation, this would redirect to Stripe Checkout
      toast.success(`Demo: Would redirect to Stripe checkout for ${tierId} tier`)
      
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setProcessingCheckout(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getPrice = (tier: PricingTier) => {
    return billingCycle === 'annual' ? tier.price_annual : tier.price_monthly
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
              </Link>
              <CurrencyPoundIcon className="w-6 h-6 text-green-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Subscription Plans</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your CyberRisk Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transparent pricing for quantitative cyber risk analysis. Start with our Starter plan and scale as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-1 text-green-600 font-semibold">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`rounded-lg shadow-lg overflow-hidden ${
                tier.id === 'pro'
                  ? 'ring-2 ring-blue-500 relative'
                  : 'bg-white'
              }`}
            >
              {tier.id === 'pro' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-full flex items-center">
                    <StarIcon className="w-4 h-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="bg-white p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(getPrice(tier))}
                    </span>
                    <span className="text-gray-600">
                      /{billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={processingCheckout === tier.id}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      tier.id === 'pro'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } ${
                      processingCheckout === tier.id
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {processingCheckout === tier.id ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Get Started with ${tier.name}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-600 mb-6">
            Enterprise customers can access custom integrations, dedicated support, and tailored pricing.
          </p>
          <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Contact Sales
          </button>
        </div>
      </main>
    </div>
  )
}
