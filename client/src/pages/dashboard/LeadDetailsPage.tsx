import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, Mail, Tag, MessageSquare,
    Send, Sparkles, MoreHorizontal, ArrowLeft
} from 'lucide-react';

export default function LeadDetailsPage() {
    // const { id } = useParams(); // Unused for now
    const [message, setMessage] = useState('');

    // Mock Lead Data
    const lead = {
        name: 'Roberto Carlos',
        email: 'roberto@example.com',
        phone: '+55 11 99999-8888',
        source: 'WhatsApp',
        status: 'Qualified',
        score: 85,
        tags: ['Investor', 'Cash Buyer', '2 Bedrooms'],
        photo: null // Placeholder for avatar logic
    };

    // Mock AI Insights (Updated to match Backend AnalysisResult)
    const aiInsights = {
        intent: 'Buying Interest',
        extracted_data: {
            budget: '$450k - $500k',
            timeline: 'Within a month',
            property_type: 'Condo/Apartment',
            location: 'Downtown',
            urgency_level: 'high'
        },
        nextAction: 'Mark as Hot Lead and request call booking',
        summary: 'Lead is showing Buying Interest. Possible budget: $450k - $500k. Property type: Condo/Apartment. Timeline: Within a month. Recommended action: Mark as Hot Lead.'
    };

    // Mock Timeline
    const timeline = [
        { id: 1, type: 'inbound', text: 'Hi, I saw the ad for the Downtown Condo. Is it available?', time: '2h ago', platform: 'WhatsApp' },
        { id: 2, type: 'ai', text: 'Hello Roberto! Yes, the Downtown Condo is available. Are you looking to buy for yourself or as an investment?', time: '2h ago', platform: 'AI Agent' },
        { id: 3, type: 'inbound', text: 'Investment. I want to rent it out.', time: '1h ago', platform: 'WhatsApp' },
        { id: 4, type: 'ai', text: 'Great! That area has high rental yield. What is your budget range?', time: '1h ago', platform: 'AI Agent' },
        { id: 5, type: 'inbound', text: 'Around 500k max.', time: '1h ago', platform: 'WhatsApp' },
    ];

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
            {/* LEFT COLUMN: Lead Profile */}
            <div className="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto">
                {/* Back Link */}
                <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 text-sm mb-[-1rem]">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>

                {/* Profile Card */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mr-4">
                                RC
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    {lead.status}
                                </span>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-3" />
                            <span className="text-sm">{lead.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-3" />
                            <span className="text-sm">{lead.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MessageSquare className="h-4 w-4 mr-3" />
                            <span className="text-sm">{lead.source}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Qualification Score</span>
                            <span className="text-sm font-bold text-gray-900">{lead.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${lead.score}%` }}></div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {lead.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                <Tag className="h-3 w-3 mr-1" /> {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 space-y-3">
                        <button className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">
                            Book Call / Send Link
                        </button>
                        <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
                            Mark as Hot Lead
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Timeline & AI (60%) */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">

                {/* AI Insights Panel */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-100 p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">AI Qualification Insights</h3>
                    </div>

                    <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                        {aiInsights.summary}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Intent</p>
                            <p className="font-medium text-gray-900 mt-1">{aiInsights.intent}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</p>
                            <p className="font-medium text-gray-900 mt-1">{aiInsights.extracted_data.budget}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</p>
                            <p className="font-medium text-gray-900 mt-1">{aiInsights.extracted_data.timeline}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgency</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 uppercase ${aiInsights.extracted_data.urgency_level === 'high' ? 'bg-red-100 text-red-800' :
                                    aiInsights.extracted_data.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {aiInsights.extracted_data.urgency_level}
                            </span>
                        </div>
                        <div className="md:col-span-2 bg-white/60 p-3 rounded-lg border-l-4 border-blue-500">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommended Action</p>
                            <p className="font-medium text-blue-900 mt-1">{aiInsights.nextAction}</p>
                        </div>
                    </div>
                </div>

                {/* Conversation Timeline */}
                <div className="flex-1 bg-white rounded-xl border shadow-sm flex flex-col min-h-[400px] overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Conversation History</h3>
                        <span className="text-xs text-gray-500">Last active 1h ago</span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {timeline.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'inbound' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.type === 'inbound'
                                    ? 'bg-gray-100 text-gray-900 rounded-tl-sm'
                                    : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <div className={`mt-2 flex items-center text-xs ${msg.type === 'inbound' ? 'text-gray-500' : 'text-blue-100'}`}>
                                        <span className="capitalize mr-2">{msg.platform}</span>
                                        <span>• {msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Box */}
                    <div className="p-4 border-t bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message or /template..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                👋 Send Welcome
                            </button>
                            <button className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                📅 Book Meeting
                            </button>
                            <button className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                🏠 Property Details
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
