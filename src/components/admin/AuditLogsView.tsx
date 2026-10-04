import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, ShieldCheck, Filter } from 'lucide-react';
import { formatDateTime } from '../../utils/ticket';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, currentInstitution, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Institution Admin only sees audit logs for their own institution or global system
  const visibleLogs = auditLogs.filter(log => {
    if (currentUser?.role === 'super_admin') return true;
    return !log.institutionId || log.institutionId === currentInstitution?.id;
  });

  const filtered = visibleLogs.filter(log => {
    const q = searchQuery.toLowerCase().trim();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Immutable timestamped record of administrative operations, Excel imports/exports, assignments, and status transitions.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search action or operator..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit records match your query.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action Code</th>
                  <th className="py-3 px-4">Institution Context</th>
                  <th className="py-3 px-4">Action Narrative & Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {log.institutionName || 'Global'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
