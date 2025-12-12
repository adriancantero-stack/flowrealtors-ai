import { useState } from 'react';
import {
    MessageCircle, Facebook, Video, Youtube, Calendar,
    Workflow, Play
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function IntegrationsPage() {
    const [activeTab, setActiveTab] = useState('whatsapp');

    const tabs = [
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
        { id: 'meta', label: 'Meta (IG/FB)', icon: Facebook },
        { id: 'tiktok', label: 'TikTok', icon: Video },
        { id: 'youtube', label: 'YouTube', icon: Youtube },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'automation', label: 'Make / Zapier', icon: Workflow },
        { id: 'tester', label: 'Webhook Tester', icon: Play },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Integrations Hub</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex flex-col gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all",
                                    activeTab === tab.id
                                        ? "bg-white shadow-sm text-primary border border-gray-100"
                                        : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn("mr-3 h-5 w-5", activeTab === tab.id ? "text-primary" : "text-gray-400")} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 card min-h-[500px]">
                    {activeTab === 'whatsapp' && <WhatsAppConfig />}
                    {/* Placeholder for others to show standard UI */}
                    {activeTab !== 'whatsapp' && (
                        <div className="text-center py-20">
                            <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
                            <p className="text-gray-500">This integration is under development.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function WhatsAppConfig() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageCircle className="h-6 w-6 text-green-500" /> WhatsApp Business API
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Connect your Official WhatsApp Number to automate replies.</p>
                </div>
                <span className="badge badge-danger">
                    Not Connected
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-lg">
                <div>
                    <label className="label">WhatsApp Provider</label>
                    <select className="select">
                        <option>360dialog</option>
                        <option>Gupshup</option>
                        <option>Other / Direct</option>
                    </select>
                </div>
                <div>
                    <label className="label">API Key / Token</label>
                    <input type="password" placeholder="••••••••••••••" className="input" />
                </div>
                <div>
                    <label className="label">Webhook URL (Auto-Generated)</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="text" readOnly value="https://api.flowrealtor.ai/webhooks/whatsapp/USER_123" className="input bg-gray-50 text-gray-500" />
                    </div>
                </div>
                <button className="btn btn-primary">
                    Connect Integration
                </button>
            </div>
        </div>
    );
}
