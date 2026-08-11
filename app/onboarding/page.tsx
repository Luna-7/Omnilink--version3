import { StoreCreateForm } from '@/components/onboarding/StoreCreateForm'

export default async function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Omnilink
          </h1>
          <p className="text-gray-600">
            Create your store to get started with AI-native commerce
          </p>
        </div>

        <StoreCreateForm />
      </div>
    </div>
  )
}
