import { useState } from 'react';
import {
    Clock, MessageSquare, Phone, RefreshCw, Save, PlayCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../i18n';

export default function AutomationsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        welcome_enabled: true,
        welcome_delay_minutes: 0,
        pre_call_enabled: true,
        reminder_enabled: true,
        reminder_before_minutes: 60,
        post_call_enabled: true,
        reactivation_enabled: true,
        reactivation_days: 3
    });

    const [isSaving, setIsSaving] = useState(false);

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key: keyof typeof settings, value: number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(false);
        alert('Settings saved!');
    };

    const triggerScheduler = async () => {
        try {
            await fetch('http://localhost:3000/api/automation/trigger', { method: 'POST' });
            alert('Scheduler triggered manually');
        } catch (e) {
            alert('Failed to trigger');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('nav.automations')} Engine</h1>
                    <p className="text-gray-500">Configure automated follow-ups and lead nurturing flows.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={triggerScheduler} className="btn btn-secondary">
                        <PlayCircle className="w-4 h-4" /> Run Scheduler
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Welcome Flow */}
            <div className="card">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Welcome Flow</h3>
                            <p className="text-sm text-gray-500">Auto-reply to new leads from any source.</p>
                        </div>
                    </div>
                    <Toggle checked={settings.welcome_enabled} onChange={() => toggle('welcome_enabled')} />
                </div>
                {settings.welcome_enabled && (
                    <div className="ml-14 flex items-center gap-4 animate-in slide-in-from-top-2 fade-in">
                        <label className="text-sm text-gray-700">Delay (minutes):</label>
                        <input
                            type="number"
                            value={settings.welcome_delay_minutes}
                            onChange={(e) => handleChange('welcome_delay_minutes', parseInt(e.target.value) || 0)}
                            className="input w-24 !py-1 !px-2 text-sm"
                        />
                        <span className="text-xs text-gray-400">Set to 0 for instant reply.</span>
                    </div>
                )}
            </div>

            {/* Appointment Flows */}
            <div className="card">
                <h3 className="font-semibold text-gray-900 mb-6">Appointment Automation</h3>

                {/* Pre-Call */}
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Pre-Call & Reminders</h3>
                            <p className="text-sm text-gray-500">Send preparation messages and reminders before calls.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Pre-Call</span>
                            <Toggle checked={settings.pre_call_enabled} onChange={() => toggle('pre_call_enabled')} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Reminder</span>
                            <Toggle checked={settings.reminder_enabled} onChange={() => toggle('reminder_enabled')} />
                        </div>
                    </div>
                </div>

                {settings.reminder_enabled && (
                    <div className="ml-14 flex items-center gap-4 mb-6">
                        <label className="text-sm text-gray-700">Remind before (minutes):</label>
                        <input
                            type="number"
                            value={settings.reminder_before_minutes}
                            onChange={(e) => handleChange('reminder_before_minutes', parseInt(e.target.value) || 60)}
                            className="input w-24 !py-1 !px-2 text-sm"
                        />
                    </div>
                )}

                {/* Post-Call */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Phone className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Post-Call Follow-up</h3>
                            <p className="text-sm text-gray-500">Ask for feedback 1 hour after call ends.</p>
                        </div>
                    </div>
                    <Toggle checked={settings.post_call_enabled} onChange={() => toggle('post_call_enabled')} />
                </div>
            </div>

            {/* Reactivation Flow */}
            <div className="card">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Cold Lead Reactivation</h3>
                            <p className="text-sm text-gray-500">Ping leads who haven't responded in a while.</p>
                        </div>
                    </div>
                    <Toggle checked={settings.reactivation_enabled} onChange={() => toggle('reactivation_enabled')} />
                </div>
                {settings.reactivation_enabled && (
                    <div className="ml-14 flex items-center gap-4 animate-in slide-in-from-top-2 fade-in">
                        <label className="text-sm text-gray-700">Days of inactivity:</label>
                        <input
                            type="number"
                            value={settings.reactivation_days}
                            onChange={(e) => handleChange('reactivation_days', parseInt(e.target.value) || 3)}
                            className="input w-24 !py-1 !px-2 text-sm"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                checked ? "bg-primary" : "bg-gray-200"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
}
