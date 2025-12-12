import { useEffect, useState } from 'react';
import { Search, ShieldOff } from 'lucide-react';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    onboarding_completed: boolean;
    status?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://localhost:3000/api/admin/users')
            .then(res => res.json())
            .then(setUsers);
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = async (action: string, id: string) => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        await fetch('http://localhost:3000/api/admin/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action, targetId: id })
        });
        alert('Action queued');
        // Reload users
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Realtor Management</h2>
                    <p className="text-gray-500">Manage access and settings for all platform users.</p>
                </div>
                <button className="bg-[#1786ff] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0070e0]">
                    Invite User
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1786ff] outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Onboarding</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="group">
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.onboarding_completed ? (
                                        <span className="text-green-600 text-sm font-medium">Completed</span>
                                    ) : (
                                        <span className="text-yellow-600 text-sm font-medium">In Progress</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleAction('reset_onboarding', user.id)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Reset Onboarding
                                        </button>
                                        <button
                                            onClick={() => handleAction('suspend_user', user.id)}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                                            title="Suspend User"
                                        >
                                            <ShieldOff className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
