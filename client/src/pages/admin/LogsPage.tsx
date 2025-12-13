import { useState, useEffect } from 'react';
import { Activity, CheckCircle, RefreshCw, Terminal } from 'lucide-react';

interface Log {
    id: number;
    type: string;
    action: string;
    status: string;
    details: string;
    createdAt: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const refresh = async () => {
        try {
            const [logsRes, statusRes] = await Promise.all([
                fetch('/api/admin/logs?limit=50'),
                fetch('/api/admin/status')
            ]);

            const logsData = await logsRes.json();
            const statusData = await statusRes.json();

            setLogs(logsData);
            setStatus(statusData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Monitoramento</h1>
                    <p className="text-sm text-gray-500 mt-1">Logs em tempo real e saúde do sistema.</p>
                </div>
                <button onClick={refresh} className="p-2 text-gray-400 hover:text-blue-600 transition bg-white border border-gray-200 rounded-lg shadow-sm">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Servidor</div>
                        <div className="text-xl font-bold text-gray-900 mt-1 capitalize">{status?.server || 'Checking...'}</div>
                    </div>
                    <div className={`p-2 rounded-full ${status?.server === 'online' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Activity size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Banco de Dados</div>
                        <div className="text-xl font-bold text-gray-900 mt-1 capitalize">{status?.db || 'Checking...'}</div>
                    </div>
                    <div className={`p-2 rounded-full ${status?.db === 'connected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">WhatsApp API</div>
                        <div className="text-xl font-bold text-gray-900 mt-1">Active</div>
                    </div>
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <MessageCircle className="w-6 h-6" />
                        {/* importing MessageCircle locally since not imported above, used RefreshCw instead as placeholder */}
                        <Activity size={24} />
                    </div>
                </div>
            </div>

            {/* Logs Console */}
            <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-800">
                <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
                    <Terminal className="text-gray-400" size={16} />
                    <span className="text-xs font-mono text-gray-400">system_logs.log</span>
                </div>
                <div className="h-96 overflow-y-auto p-4 font-mono text-xs space-y-2">
                    {loading && <div className="text-gray-500">Loading logs...</div>}
                    {!loading && logs.length === 0 && <div className="text-gray-500">No logs found.</div>}
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-4 hover:bg-white/5 p-1 rounded transition">
                            <span className="text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            <span className={`w-16 font-bold ${log.type === 'ERROR' ? 'text-red-400' : log.type === 'AI' ? 'text-purple-400' : 'text-blue-400'}`}>
                                [{log.type}]
                            </span>
                            <span className="text-gray-300 flex-1">{log.action || 'Event'}</span>
                            <span className="text-gray-500">{log.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Icon helper since lucide-react imports might be missing
function MessageCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
    )
}
