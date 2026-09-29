'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Battery, BatteryCharging, Clock3, HardDrive, Network, RefreshCw } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

type ConnectionDetails = EventTarget & {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};
type ConnectionSnapshot = { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };

type BatteryDetails = EventTarget & { charging: boolean; level: number };
type BatterySnapshot = { charging: boolean; level: number };

type BrowserNavigator = Navigator & {
  connection?: ConnectionDetails;
  getBattery?: () => Promise<BatteryDetails>;
};

type PageMemory = { usedJSHeapSize: number; jsHeapSizeLimit: number };

type StorageEstimate = { usage?: number; quota?: number };

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const parts = [`${hours}h`, `${minutes}m`];
  if (days) parts.unshift(`${days}d`);
  return parts.join(' ');
};

function Metric({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4" aria-label={label}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[color:var(--text-secondary)]">
        {icon}<span>{label}</span>
      </div>
      <p className="mt-3 text-xl font-semibold text-[color:var(--text-primary)]">{value}</p>
      {detail && <p className="mt-1 text-xs text-[color:var(--text-muted)]">{detail}</p>}
    </section>
  );
}

export default function SystemMonitor() {
  const { windows, activeWindowId, focusWindow, updateWindow } = useDesktop();
  const [activeTab, setActiveTab] = useState<'overview' | 'apps'>('overview');
  const [now, setNow] = useState<Date | null>(null);
  const [pageStartedAt, setPageStartedAt] = useState<Date | null>(null);
  const [pageUptime, setPageUptime] = useState<number | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [connection, setConnection] = useState<ConnectionSnapshot | null>(null);
  const [battery, setBattery] = useState<BatterySnapshot | null>(null);
  const [batteryAvailable, setBatteryAvailable] = useState<boolean | null>(null);
  const [storage, setStorage] = useState<StorageEstimate | null>(null);
  const [storageState, setStorageState] = useState<'loading' | 'available' | 'unavailable'>('loading');
  const [pageMemory, setPageMemory] = useState<PageMemory | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshStorage = useCallback(async () => {
    if (!navigator.storage?.estimate) {
      setStorageState('unavailable');
      return;
    }
    try {
      const estimate = await navigator.storage.estimate();
      setStorage({ usage: estimate.usage, quota: estimate.quota });
      setStorageState('available');
    } catch {
      setStorageState('unavailable');
    }
  }, []);

  useEffect(() => {
    void refreshStorage();
    const timer = window.setInterval(() => void refreshStorage(), 30_000);
    return () => window.clearInterval(timer);
  }, [refreshStorage, refreshKey]);

  useEffect(() => {
    const browserNavigator = navigator as BrowserNavigator;
    const updateClock = () => {
      setNow(new Date());
      setPageUptime(performance.now() / 1_000);
    };
    const updateOnline = () => setOnline(navigator.onLine);
    const updateConnection = () => {
      const details = browserNavigator.connection;
      setConnection(details ? { effectiveType: details.effectiveType, downlink: details.downlink, rtt: details.rtt, saveData: details.saveData } : null);
    };
    const updatePageMemory = () => {
      const memory = (performance as Performance & { memory?: PageMemory }).memory;
      setPageMemory(memory ? { usedJSHeapSize: memory.usedJSHeapSize, jsHeapSizeLimit: memory.jsHeapSizeLimit } : null);
    };

    updateClock();
    setPageStartedAt(new Date(performance.timeOrigin));
    updateOnline();
    updateConnection();
    updatePageMemory();
    const clockTimer = window.setInterval(updateClock, 1_000);
    const memoryTimer = window.setInterval(updatePageMemory, 5_000);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    browserNavigator.connection?.addEventListener('change', updateConnection);
    let cancelled = false;
    let batteryManager: BatteryDetails | null = null;
    const updateBattery = () => {
      if (batteryManager) setBattery({ charging: batteryManager.charging, level: batteryManager.level });
    };
    if (browserNavigator.getBattery) {
      browserNavigator.getBattery().then((manager) => {
        if (cancelled) return;
        batteryManager = manager;
        setBatteryAvailable(true);
        updateBattery();
        manager.addEventListener('levelchange', updateBattery);
        manager.addEventListener('chargingchange', updateBattery);
      }).catch(() => { if (!cancelled) setBatteryAvailable(false); });
    } else {
      setBatteryAvailable(false);
    }

    return () => {
      window.clearInterval(clockTimer);
      window.clearInterval(memoryTimer);
      cancelled = true;
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      browserNavigator.connection?.removeEventListener('change', updateConnection);
      batteryManager?.removeEventListener('levelchange', updateBattery);
      batteryManager?.removeEventListener('chargingchange', updateBattery);
    };
  }, []);

  const storageUsage = storage?.usage;
  const storageQuota = storage?.quota;
  const storagePercent = storageUsage !== undefined && storageQuota !== undefined && storageQuota > 0 ? Math.min(100, (storageUsage / storageQuota) * 100) : null;
  const sortedWindows = [...windows].sort((a, b) => b.zIndex - a.zIndex);
  const connectionSummary = connection?.effectiveType
    ? `${connection.effectiveType.toUpperCase()}${typeof connection.downlink === 'number' ? ` · ~${connection.downlink} Mbps` : ''}`
    : 'No estimate';
  const batteryIcon = battery?.charging ? <BatteryCharging className="h-4 w-4" aria-hidden="true" /> : <Battery className="h-4 w-4" aria-hidden="true" />;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[color:var(--color-surface)] text-[color:var(--text-primary)]">
      <header className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2"><Activity className="h-5 w-5 text-white" aria-hidden="true" /></div>
          <div><h1 className="text-base font-semibold">System Monitor</h1><p className="text-xs text-[color:var(--text-secondary)]">Session status</p></div>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-xs text-[color:var(--text-secondary)] hover:bg-[color:var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]" aria-label="Refresh storage estimate">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
        </button>
      </header>

      <nav className="flex border-b border-[color:var(--color-border)] px-4" aria-label="System Monitor sections" role="tablist">
        {(['overview', 'apps'] as const).map((tab) => (
          <button key={tab} id={`monitor-tab-${tab}`} type="button" role="tab" tabIndex={activeTab === tab ? 0 : -1} aria-selected={activeTab === tab} aria-controls={`monitor-panel-${tab}`} onClick={() => setActiveTab(tab)} onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const nextTab = event.key === 'Home' ? 'overview' : event.key === 'End' ? 'apps' : tab === 'overview' ? 'apps' : 'overview';
            setActiveTab(nextTab);
            document.getElementById(`monitor-tab-${nextTab}`)?.focus();
          }} className={`border-b-2 px-4 py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] ${activeTab === tab ? 'border-[color:var(--accent)] text-[color:var(--accent)]' : 'border-transparent text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}`}>
            {tab === 'overview' ? 'Overview' : `App windows (${windows.length})`}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-y-auto p-5" role="tabpanel" id={`monitor-panel-${activeTab}`} aria-labelledby={`monitor-tab-${activeTab}`}>
        {activeTab === 'overview' ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Metric label="Page uptime" value={pageUptime === null ? 'Starting…' : formatUptime(pageUptime)} detail={pageStartedAt ? `Since ${pageStartedAt.toLocaleTimeString()}` : undefined} icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} />
              <Metric label="Local time" value={now?.toLocaleTimeString() ?? 'Checking…'} detail={now?.toLocaleDateString(undefined, { dateStyle: 'medium' })} icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} />
              <Metric label="Connection" value={online === null ? 'Checking…' : online ? 'Online' : 'Offline'} detail={connectionSummary} icon={<Network className="h-4 w-4" aria-hidden="true" />} />
              <Metric label="Site storage" value={storageState === 'loading' ? 'Checking…' : storageState === 'unavailable' ? 'Unavailable' : storageUsage === undefined ? 'Estimate unavailable' : formatBytes(storageUsage)} detail={storageQuota ? `Quota ${formatBytes(storageQuota)}` : undefined} icon={<HardDrive className="h-4 w-4" aria-hidden="true" />} />
              <Metric label="Page memory" value={pageMemory ? formatBytes(pageMemory.usedJSHeapSize) : 'Unavailable'} detail={pageMemory ? `Heap limit ${formatBytes(pageMemory.jsHeapSizeLimit)}` : undefined} icon={<Activity className="h-4 w-4" aria-hidden="true" />} />
              <Metric label="Battery" value={battery ? `${Math.round(battery.level * 100)}%${battery.charging ? ' · charging' : ''}` : batteryAvailable === false ? 'Unavailable' : 'Checking…'} icon={batteryIcon} />
            </div>
            {storagePercent !== null && (
              <section className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4" aria-label="Origin storage estimate">
                <div className="mb-2 flex items-center justify-between text-sm"><span>Site storage</span><span className="font-mono text-[color:var(--text-secondary)]">{storagePercent.toFixed(1)}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]"><div className="h-full rounded-full bg-[color:var(--accent)] transition-[width]" style={{ width: `${storagePercent}%` }} /></div>
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">{formatBytes(storageUsage!)} used of {formatBytes(storageQuota!)} quota.</p>
              </section>
            )}
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-[color:var(--color-border)]" aria-label="Open desktop application windows">
            <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm font-medium">Open app windows</div>
            {sortedWindows.length ? (
              <ul className="divide-y divide-[color:var(--color-border)]">
                {sortedWindows.map((appWindow) => {
                  const state = appWindow.minimized ? 'Minimized' : appWindow.id === activeWindowId ? 'Focused' : 'Open';
                  return (
                    <li key={appWindow.id}>
                      <button type="button" onClick={() => { updateWindow(appWindow.id, { minimized: false }); focusWindow(appWindow.id); }} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[color:var(--color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[color:var(--accent)]">
                        <span className="min-w-0"><span className="block truncate text-sm font-medium">{appWindow.title}</span><span className="block text-xs text-[color:var(--text-muted)]">{appWindow.type}</span></span>
                        <span className="shrink-0 rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-xs text-[color:var(--text-secondary)]">{state}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="p-4 text-sm text-[color:var(--text-secondary)]">No desktop app windows are open.</p>}
          </section>
        )}
      </main>
    </div>
  );
}
