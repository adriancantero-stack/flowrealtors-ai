import { useState } from 'react';
import { MoreHorizontal, MessageSquare } from 'lucide-react';

interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    items: KanbanItem[];
}

interface KanbanItem {
    id: string;
    name: string;
    score: number;
    source: string;
    lastActive: string;
}

export default function PipelinePage() {
    // Mock Data
    const [columns, setColumns] = useState<KanbanColumn[]>([
        {
            id: 'new',
            title: 'New Leads',
            color: 'bg-blue-500',
            items: [
                { id: '1', name: 'Alice Walker', score: 45, source: 'IG', lastActive: '2m' },
                { id: '2', name: 'David Miller', score: 10, source: 'YT', lastActive: '1d' },
            ]
        },
        {
            id: 'qualification',
            title: 'In Qualification',
            color: 'bg-yellow-500',
            items: [
                { id: '3', name: 'Maria Garcia', score: 60, source: 'TT', lastActive: '5m' },
            ]
        },
        {
            id: 'qualified',
            title: 'Qualified',
            color: 'bg-green-500',
            items: [
                { id: '4', name: 'Roberto Carlos', score: 85, source: 'WA', lastActive: '1h' },
            ]
        },
        {
            id: 'hot',
            title: 'Hot / Ready',
            color: 'bg-red-500',
            items: [
                { id: '5', name: 'John Smith', score: 92, source: 'FB', lastActive: '3h' },
            ]
        },
        {
            id: 'lost',
            title: 'Not Interested',
            color: 'bg-gray-400',
            items: []
        }
    ]);

    const handleDragStart = (e: React.DragEvent, itemId: string, fromColumnId: string) => {
        e.dataTransfer.setData('itemId', itemId);
        e.dataTransfer.setData('fromColumnId', fromColumnId);
    };

    const handleDrop = (e: React.DragEvent, toColumnId: string) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('itemId');
        const fromColumnId = e.dataTransfer.getData('fromColumnId');

        if (fromColumnId === toColumnId) return;

        const newColumns = [...columns];
        const fromCol = newColumns.find(c => c.id === fromColumnId);
        const toCol = newColumns.find(c => c.id === toColumnId);

        if (fromCol && toCol) {
            const itemIndex = fromCol.items.findIndex(i => i.id === itemId);
            const [item] = fromCol.items.splice(itemIndex, 1);
            toCol.items.push(item);
            setColumns(newColumns);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="h-[calc(100vh-8rem)] overflow-x-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
                <div className="flex gap-2">
                    <span className="text-sm text-gray-500">Drag and drop leads to update status</span>
                </div>
            </div>

            <div className="flex gap-6 h-full min-w-[1000px]">
                {columns.map(col => (
                    <div
                        key={col.id}
                        className="flex-1 bg-gray-50 rounded-xl flex flex-col max-w-xs"
                        onDrop={(e) => handleDrop(e, col.id)}
                        onDragOver={handleDragOver}
                    >
                        {/* Column Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                <h3 className="font-bold text-sm text-gray-700">{col.title}</h3>
                            </div>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                {col.items.length}
                            </span>
                        </div>

                        {/* Items */}
                        <div className="p-3 space-y-3 overflow-y-auto flex-1">
                            {col.items.map(item => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item.id, col.id)}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {item.source}
                                        </span>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <MessageSquare className="h-3 w-3 mr-1" />
                                            {item.lastActive}
                                        </div>
                                    </div>

                                    {/* Score Bar */}
                                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.score > 80 ? 'bg-green-500' : item.score > 50 ? 'bg-yellow-400' : 'bg-gray-300'}`}
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
