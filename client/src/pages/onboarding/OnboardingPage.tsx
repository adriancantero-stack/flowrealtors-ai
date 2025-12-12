import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepProfile from './steps/StepProfile';
import StepIntegrations from './steps/StepIntegrations';
import StepAutomations from './steps/StepAutomations';
import { useTranslation } from '../../i18n';

export default function OnboardingPage() {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const userId = "user_123"; // Mock

    const handleFinish = async () => {
        // Update user status
        await fetch(`http://localhost:3000/api/auth/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ onboarding_completed: true })
        });

        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Top Bar */}
            <div className="h-16 border-b flex items-center justify-between px-8 bg-white fixed w-full top-0 z-50">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    FlowRealtors
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{t('onboarding.step1.title').split(' ')[0]} {step} / 3</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 pt-24 pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    {step === 1 && <StepProfile onNext={() => setStep(2)} />}
                    {step === 2 && <StepIntegrations onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                    {step === 3 && <StepAutomations onFinish={handleFinish} onBack={() => setStep(2)} />}
                </div>
            </div>
        </div>
    );
}
