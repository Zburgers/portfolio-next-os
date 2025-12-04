'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Activity, 
  Network, 
  ThermometerSun,
  Zap,
  Server,
  Clock
} from 'lucide-react';

interface SystemStat {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'sleeping' | 'stopped';
}

// Simulated process list
const generateProcesses = (): ProcessInfo[] => [
  { pid: 1, name: 'systemd', cpu: 0.1, memory: 0.5, status: 'running' },
  { pid: 245, name: 'gnome-shell', cpu: 8.2 + Math.random() * 3, memory: 4.8, status: 'running' },
  { pid: 892, name: 'firefox', cpu: 12.5 + Math.random() * 5, memory: 8.2, status: 'running' },
  { pid: 1024, name: 'code', cpu: 5.3 + Math.random() * 2, memory: 6.1, status: 'running' },
  { pid: 1156, name: 'node', cpu: 3.2 + Math.random() * 2, memory: 2.8, status: 'running' },
  { pid: 1289, name: 'portfolio-app', cpu: 2.1 + Math.random(), memory: 1.5, status: 'running' },
  { pid: 445, name: 'pulseaudio', cpu: 0.3, memory: 0.8, status: 'sleeping' },
  { pid: 567, name: 'NetworkManager', cpu: 0.2, memory: 0.4, status: 'running' },
  { pid: 678, name: 'gdm-session', cpu: 0.1, memory: 0.3, status: 'sleeping' },
  { pid: 789, name: 'dbus-daemon', cpu: 0.1, memory: 0.2, status: 'running' },
];

// Animated progress bar component
function AnimatedProgressBar({ 
  value, 
  color, 
  height = 'h-2',
  showGlow = true 
}: { 
  value: number; 
  color: string; 
  height?: string;
  showGlow?: boolean;
}) {
  return (
    <div className={`w-full ${height} bg-[color:var(--color-surface-muted)] rounded-full overflow-hidden relative`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
        style={{
          boxShadow: showGlow ? `0 0 10px ${color.includes('green') ? '#22c55e' : color.includes('blue') ? '#3b82f6' : color.includes('purple') ? '#a855f7' : '#f59e0b'}40` : 'none'
        }}
      />
    </div>
  );
}

// CPU Usage Ring Chart
function CpuRing({ usage }: { usage: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (usage / 100) * circumference;
  
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="var(--color-surface-muted)"
          strokeWidth="10"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="url(#cpuGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="cpuGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          key={usage}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-[color:var(--text-primary)]"
        >
          {usage.toFixed(0)}%
        </motion.span>
        <span className="text-xs text-[color:var(--text-secondary)]">CPU</span>
      </div>
    </div>
  );
}

export default function SystemMonitor() {
  const [activeTab, setActiveTab] = useState<'resources' | 'processes'>('resources');
  const [cpuUsage, setCpuUsage] = useState(35);
  const [memoryUsage, setMemoryUsage] = useState(48);
  const [diskUsage, setDiskUsage] = useState(62);
  const [networkIn, setNetworkIn] = useState(1.2);
  const [networkOut, setNetworkOut] = useState(0.4);
  const [uptime, setUptime] = useState({ hours: 2, minutes: 34 });
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(20).fill(30));

  // Simulate dynamic system stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(15, Math.min(85, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(30, Math.min(75, prev + (Math.random() - 0.5) * 3)));
      setNetworkIn(prev => Math.max(0.1, Math.min(5, prev + (Math.random() - 0.5) * 0.5)));
      setNetworkOut(prev => Math.max(0.05, Math.min(2, prev + (Math.random() - 0.5) * 0.2)));
      setProcesses(generateProcesses());
      setCpuHistory(prev => [...prev.slice(1), cpuUsage]);
      
      // Update uptime
      setUptime(prev => {
        const newMinutes = prev.minutes + 1;
        if (newMinutes >= 60) {
          return { hours: prev.hours + 1, minutes: 0 };
        }
        return { ...prev, minutes: newMinutes };
      });
    }, 2000);

    setProcesses(generateProcesses());
    return () => clearInterval(interval);
  }, [cpuUsage]);

  const systemStats: SystemStat[] = [
    {
      label: 'CPU Usage',
      value: cpuUsage,
      maxValue: 100,
      unit: '%',
      color: 'bg-gradient-to-r from-green-500 to-emerald-400',
      icon: <Cpu className="w-5 h-5" />
    },
    {
      label: 'Memory',
      value: memoryUsage,
      maxValue: 100,
      unit: '%',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-400',
      icon: <MemoryStick className="w-5 h-5" />
    },
    {
      label: 'Disk Usage',
      value: diskUsage,
      maxValue: 100,
      unit: '%',
      color: 'bg-gradient-to-r from-purple-500 to-pink-400',
      icon: <HardDrive className="w-5 h-5" />
    },
  ];

  const sortedProcesses = useMemo(() => 
    [...processes].sort((a, b) => b.cpu - a.cpu),
    [processes]
  );

  const tabs = [
    { id: 'resources', label: 'Resources', icon: <Activity className="w-4 h-4" /> },
    { id: 'processes', label: 'Processes', icon: <Server className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full bg-[color:var(--color-surface)] text-[color:var(--text-primary)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">System Monitor</h1>
            <p className="text-xs text-[color:var(--text-secondary)]">Fedora Linux 42</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
          <Clock className="w-3.5 h-3.5" />
          <span>Uptime: {uptime.hours}h {uptime.minutes}m</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'resources' | 'processes')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id 
                ? 'text-[color:var(--accent)]' 
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--accent)]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'resources' ? (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* CPU Ring + Stats */}
              <div className="flex items-start gap-6">
                <CpuRing usage={cpuUsage} />
                
                <div className="flex-1 space-y-4">
                  {systemStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[color:var(--text-secondary)]">{stat.icon}</span>
                          <span className="font-medium">{stat.label}</span>
                        </div>
                        <span className="text-sm font-mono text-[color:var(--text-secondary)]">
                          {stat.value.toFixed(1)}{stat.unit}
                        </span>
                      </div>
                      <AnimatedProgressBar value={stat.value} color={stat.color} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CPU History Graph */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-[color:var(--color-surface-muted)] border border-[color:var(--color-border)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    CPU History
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)]">Last 40 seconds</span>
                </div>
                <div className="h-20 flex items-end gap-0.5">
                  {cpuHistory.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t opacity-80"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Network & Temp */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl bg-[color:var(--color-surface-muted)] border border-[color:var(--color-border)]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Network className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Network</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-secondary)]">↓ Download</span>
                      <span className="font-mono text-green-500">{networkIn.toFixed(1)} MB/s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-secondary)]">↑ Upload</span>
                      <span className="font-mono text-blue-500">{networkOut.toFixed(2)} MB/s</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-xl bg-[color:var(--color-surface-muted)] border border-[color:var(--color-border)]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <ThermometerSun className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-secondary)]">CPU</span>
                      <span className="font-mono text-orange-500">52°C</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-secondary)]">GPU</span>
                      <span className="font-mono text-yellow-500">48°C</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* System Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-xl bg-[color:var(--color-surface-muted)] border border-[color:var(--color-border)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">System Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[color:var(--text-muted)]">Kernel</span>
                    <p className="font-mono text-[color:var(--text-secondary)]">6.12.0-300.fc42.x86_64</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Memory</span>
                    <p className="font-mono text-[color:var(--text-secondary)]">15.2 GB / 32 GB</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">CPU</span>
                    <p className="font-mono text-[color:var(--text-secondary)]">Intel Core i9 @ 3.5GHz</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Graphics</span>
                    <p className="font-mono text-[color:var(--text-secondary)]">Intel Iris Xe</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="processes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Processes Table */}
              <div className="rounded-xl border border-[color:var(--color-border)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[color:var(--color-surface-muted)] text-left text-xs text-[color:var(--text-secondary)]">
                      <th className="px-4 py-3 font-medium">PID</th>
                      <th className="px-4 py-3 font-medium">Process Name</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">CPU %</th>
                      <th className="px-4 py-3 font-medium text-right">Memory %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProcesses.map((process, index) => (
                      <motion.tr
                        key={process.pid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-t border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)] transition-colors"
                      >
                        <td className="px-4 py-2.5 font-mono text-sm text-[color:var(--text-muted)]">
                          {process.pid}
                        </td>
                        <td className="px-4 py-2.5 text-sm font-medium">
                          {process.name}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                            process.status === 'running' 
                              ? 'bg-green-500/10 text-green-500' 
                              : process.status === 'sleeping'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              process.status === 'running' 
                                ? 'bg-green-500' 
                                : process.status === 'sleeping'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`} />
                            {process.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`font-mono text-sm ${
                            process.cpu > 10 ? 'text-orange-500' : 
                            process.cpu > 5 ? 'text-yellow-500' : 
                            'text-[color:var(--text-secondary)]'
                          }`}>
                            {process.cpu.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-mono text-sm text-[color:var(--text-secondary)]">
                            {process.memory.toFixed(1)}%
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Process Summary */}
              <div className="mt-4 flex items-center justify-between text-sm text-[color:var(--text-muted)]">
                <span>{processes.length} processes</span>
                <span>
                  {processes.filter(p => p.status === 'running').length} running, {' '}
                  {processes.filter(p => p.status === 'sleeping').length} sleeping
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
