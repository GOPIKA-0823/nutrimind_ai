'use client'

import DashboardLayout from '@/components/DashboardLayout'
import AIAssistant from '@/components/AIAssistant'

export default function AIAssistantPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">
                        Medical Assistant
                    </h1>
                    <p className="text-primary-100">
                        Describe your symptoms for a medical assessment. Tap to speak or type.
                    </p>
                </div>

                <AIAssistant />
            </div>
        </DashboardLayout>
    )
}
