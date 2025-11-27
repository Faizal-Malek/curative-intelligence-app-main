'use client';

import { useEffect, useState } from 'react';
import { Server, Database, Zap, AlertTriangle, CheckCircle2, Activity, Clock, HardDrive } from 'lucide-react';

export default function OwnerSystemPage() {
  const [uptime, setUptime] = useState(99.8);

  const systemMetrics = [
    { name: 'API Response Time', value: '124ms', status: 'healthy', icon: Zap, target: '< 200ms' },
    { name: 'Database Connections', value: '45/100', status: 'healthy', icon: Database, target: '< 80' },
    { name: 'Server CPU', value: '34%', status: 'healthy', icon: Server, target: '< 70%' },
    { name: 'Memory Usage', value: '2.1GB/4GB', status: 'healthy', icon: HardDrive, target: '< 3.5GB' },
  ];

  const recentEvents = [
    { time: '2 min ago', type: 'info', message: 'Database backup completed successfully', severity: 'success' },
    { time: '15 min ago', type: 'warning', message: 'High API request volume detected', severity: 'warning' },
    { time: '1 hour ago', type: 'info', message: 'Automated deployment completed', severity: 'success' },
    { time: '3 hours ago', type: 'error', message: 'Temporary connection timeout (resolved)', severity: 'error' },
    { time: '5 hours ago', type: 'info', message: 'Cache cleared and rebuilt', severity: 'success' },
  ];

  const services = [
    { name: 'API Gateway', status: 'operational', uptime: 99.9, latency: '45ms' },
    { name: 'Database', status: 'operational', uptime: 99.99, latency: '12ms' },
    { name: 'Queue Worker', status: 'operational', uptime: 99.7, latency: '89ms' },
    { name: 'AI Generation', status: 'operational', uptime: 99.5, latency: '1.2s' },
    { name: 'File Storage', status: 'operational', uptime: 99.95, latency: '78ms' },
    { name: 'Email Service', status: 'degraded', uptime: 98.2, latency: '340ms' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">System Health</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Monitor platform performance and system status</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <div className="text-sm font-semibold text-green-900">All Systems Operational</div>
            <div className="text-xs text-green-700">{uptime}% uptime</div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="rounded-2xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-5 w-5 text-[#D2B193]" />
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-[#2F2626] mb-1">{metric.value}</div>
              <div className="text-xs text-[#6B5E5E] mb-2">{metric.name}</div>
              <div className="text-xs text-green-600">Target: {metric.target}</div>
            </div>
          );
        })}
      </div>

      {/* Services Status */}
      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-[#E9DCC9]">
          <h3 className="text-lg font-semibold text-[#2F2626]">Services Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9F5F0]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Service</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Uptime</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DCC9]">
              {services.map((service, i) => (
                <tr key={i} className="hover:bg-[#F9F5F0]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#D2B193]" />
                      <span className="text-sm font-medium text-[#2F2626]">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {service.status === 'operational' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Operational
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        <AlertTriangle className="h-3 w-3" />
                        Degraded
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#E9DCC9] rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className={`h-full ${
                            service.uptime >= 99.5 ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${service.uptime}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-[#6B5E5E] min-w-[50px]">{service.uptime}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#6B5E5E]">{service.latency}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Events */}
      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-[#E9DCC9]">
          <h3 className="text-lg font-semibold text-[#2F2626]">Recent System Events</h3>
        </div>
        <div className="divide-y divide-[#E9DCC9]">
          {recentEvents.map((event, i) => (
            <div key={i} className="p-4 hover:bg-[#F9F5F0]/50 transition-colors flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {event.severity === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {event.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                {event.severity === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#2F2626]">{event.message}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#6B5E5E]">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
