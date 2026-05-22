'use client'

import { useState } from 'react'
import { CreditCard, Wallet, Smartphone, CheckCircle, Lock } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  currency?: string
  onPaymentSuccess: (paymentData: PaymentData) => void
  onPaymentCancel?: () => void
}

export interface PaymentData {
  paymentMethod: string
  amount: number
  currency: string
  transactionId?: string
}

export default function PaymentForm({ amount, currency = 'INR', onPaymentSuccess, onPaymentCancel }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('card')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet }
  ]

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardInput = (field: string, value: string) => {
    if (field === 'number') {
      setCardDetails(prev => ({ ...prev, number: formatCardNumber(value) }))
    } else if (field === 'expiry') {
      setCardDetails(prev => ({ ...prev, expiry: formatExpiry(value) }))
    } else if (field === 'cvv') {
      const v = value.replace(/[^0-9]/g, '').substring(0, 4)
      setCardDetails(prev => ({ ...prev, cvv: v }))
    } else {
      setCardDetails(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateCard = () => {
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 13) {
      return 'Invalid card number'
    }
    if (!cardDetails.name || cardDetails.name.length < 3) {
      return 'Invalid cardholder name'
    }
    if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
      return 'Invalid expiry date'
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      return 'Invalid CVV'
    }
    return null
  }

  const handlePayment = async () => {
    if (selectedMethod === 'card') {
      const error = validateCard()
      if (error) {
        alert(error)
        return
      }
    }

    setProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      const paymentData: PaymentData = {
        paymentMethod: selectedMethod,
        amount,
        currency,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }

      setShowSuccess(true)
      setTimeout(() => {
        onPaymentSuccess(paymentData)
        setProcessing(false)
        setShowSuccess(false)
      }, 1500)
    }, 2000)
  }

  if (showSuccess) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-sm text-gray-600">Processing your appointment...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Amount */}
      <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Total Amount</span>
          <span className="text-2xl font-bold text-primary-600">
            {currency === 'USD' ? '$' : '₹'}{amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-3 rounded-lg border-2 transition-all ${selectedMethod === method.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
                  }`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${selectedMethod === method.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                <p className={`text-xs font-medium ${selectedMethod === method.id ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                  {method.name}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Card Details Form */}
      {selectedMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.number}
              onChange={(e) => handleCardInput('number', e.target.value)}
              maxLength={19}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardDetails.name}
              onChange={(e) => handleCardInput('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => handleCardInput('expiry', e.target.value)}
                maxLength={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => handleCardInput('cvv', e.target.value)}
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment */}
      {selectedMethod === 'upi' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              placeholder="yourname@upi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <p className="text-xs text-gray-500">
            You will be redirected to your UPI app to complete the payment
          </p>
        </div>
      )}

      {/* Digital Wallet */}
      {selectedMethod === 'wallet' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Wallet
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option>PayPal</option>
              <option>Google Pay</option>
              <option>Apple Pay</option>
              <option>Amazon Pay</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">
            You will be redirected to your wallet app to complete the payment
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
        <Lock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600">
          Your payment information is secure and encrypted. We do not store your card details.
        </p>
      </div>

      {/* Payment Buttons */}
      <div className="flex space-x-3">
        {onPaymentCancel && (
          <button
            onClick={onPaymentCancel}
            disabled={processing}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            `Pay ${currency === 'USD' ? '$' : '₹'}${amount.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  )
}

