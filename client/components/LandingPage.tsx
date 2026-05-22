'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Brain, 
  Activity, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Insights',
      description: 'Get personalized health insights and recommendations powered by advanced AI analysis.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Comprehensive Tracking',
      description: 'Track food, mood, sleep, and activity with intelligent correlation analysis.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Doctor Integration',
      description: 'Connect with healthcare professionals for personalized guidance and support.'
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: 'Real-time Monitoring',
      description: 'Monitor your health trends and get instant feedback on your wellness journey.'
    }
  ]

  const benefits = [
    'AI-generated monthly health reports',
    'Mood and nutrition correlation analysis',
    'Direct communication with doctors',
    'Gamified wellness challenges',
    'Community support groups',
    'Personalized recommendations'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gradient">NutriMind AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Your AI-Powered
              <span className="text-gradient block">Health Companion</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Track your daily habits, get AI insights, and connect with healthcare professionals 
              for a personalized wellness journey that adapts to your needs.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/login?role=user" className="btn btn-primary text-lg px-8 py-3">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/auth/login?role=doctor" className="btn btn-outline text-lg px-8 py-3">
                I'm a Doctor
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive approach to health and wellness tracking with AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-soft transition-shadow duration-300"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose NutriMind AI?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Experience the future of personalized healthcare with our comprehensive 
                platform that combines AI insights, professional guidance, and community support.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-soft p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Monthly AI Report</h3>
                    <p className="text-sm text-gray-600">Personalized insights</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mood Trend</span>
                    <span className="text-success-600 font-medium">+15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sleep Quality</span>
                    <span className="text-success-600 font-medium">8.2/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nutrition Score</span>
                    <span className="text-success-600 font-medium">A+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who are already on their wellness journey with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/auth/register?role=doctor" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
              Doctor Registration
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary-400" />
                <span className="text-lg font-bold">NutriMind AI</span>
              </div>
              <p className="text-gray-400">
                Your AI-powered health companion for a better tomorrow.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">AI Insights</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Newsletter</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NutriMind AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
