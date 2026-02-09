import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TopBar } from './components/TopBar';
import { StatusLine } from './components/StatusLine';
import { CommandBar } from './components/CommandBar';
import { SitesGrid } from './components/SitesGrid';

import { Toast } from './components/Toast';
import { AlertRail } from './components/AlertRail';
import { AlertDrawer } from './components/AlertDrawer';
import { ActivityLogDrawer } from './components/ActivityLogDrawer';
import { EvidenceRepository } from './components/EvidenceRepository';
import { RunningTaskPill } from './components/RunningTaskPill';
import { IntroScreen } from './components/IntroScreen';
import { ToastMessage, Alert, LogEntry, Job } from './types';

export default function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSitesVisible, setIsSitesVisible] = useState(true);
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Alert Workflow State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRailVisible, setIsRailVisible] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [alertDrawerInitialMode, setAlertDrawerInitialMode] = useState<'response' | 'case_file'>('response');

  // Activity/Evidence Log State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    filter: { query?: string } | null;
  }>({ isOpen: false, filter: null });

  // Evidence Repository State
  const [isEvidenceRepoOpen, setIsEvidenceRepoOpen] = useState(false);

  // Mock Running Job
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsSyncing(false);
      addToast("Dashboard data synced");
    }, 1500);
  };

  const handleTriggerAlert = useCallback(() => {
    const triggerTime = Date.now();
    const incidentId = `INC-${triggerTime.toString().slice(-6)}`;

    // 1. Main Alert
    const newAlert: Alert = {
      id: incidentId,
      type: 'Intrusion Suspected',
      site: 'Site A',
      severity: 'High',
      timestamp: triggerTime,
      confidence: 0.86,
      status: 'In Review',
      aiSummary: '1 person detected • Vehicle signature mismatch • Target moving (E perimeter)',
      details: {
        why: 'Motion detected near Gate 2 + unauthorized vehicle signature.',
        action: 'Drone 3 tracking target',
        droneId: 'Drone 3',
        zone: 'Gate 2 / North'
      }
    };

    // 2. Dummy Alert
    const dummyAlert: Alert = {
      id: `INC-${(triggerTime - 120000).toString().slice(-6)}`,
      type: 'Perimeter Warning',
      site: 'Site C',
      severity: 'Medium',
      timestamp: triggerTime - 300000,
      confidence: 0.62,
      status: 'Unreviewed',
      aiSummary: 'Movement detected in Sector 4 • Likely fauna',
      details: {
        why: 'IR sensor triggered. No visual confirmation yet.',
        action: 'Pending dispatch',
        droneId: 'None',
        zone: 'Sector 4'
      }
    };

    const newLogs: LogEntry[] = [
      {
        id: `LOG-${Date.now()}-1`,
        timestamp: triggerTime,
        incidentId,
        site: 'Site A',
        zone: 'Gate 2',
        actor: 'System',
        action: 'ALERT TRIGGERED',
        result: 'INFO',
        details: 'Motion detected near Gate 2 + unauthorized vehicle signature.',
        type: 'Incident'
      },
      {
        id: `LOG-${Date.now()}-2`,
        timestamp: triggerTime + 2000,
        incidentId,
        incidentStartTime: triggerTime,
        site: 'Site A',
        zone: 'Gate 2',
        actor: 'System',
        action: 'AUTONOMOUS DISPATCH',
        asset: 'Drone 3',
        result: 'SUCCESS',
        details: 'Dispatch to Gate 2 (Tracking mode)',
        type: 'System'
      },
      {
        id: `LOG-${Date.now()}-3`,
        timestamp: triggerTime + 5000,
        incidentId,
        incidentStartTime: triggerTime,
        site: 'Site A',
        zone: 'Gate 2',
        actor: 'Drone 3',
        action: 'TRACKING INITIATED',
        asset: 'Drone 3',
        result: 'SUCCESS',
        details: 'Target locked • T-0142',
        type: 'Drone'
      },
      {
        id: `LOG-${Date.now()}-4`,
        timestamp: triggerTime + 2000,
        incidentId,
        incidentStartTime: triggerTime,
        site: 'Site A',
        zone: 'Gate 2',
        actor: 'System',
        action: 'EVIDENCE RECORDING STARTED',
        asset: 'CAM-02 + Drone 3',
        result: 'SUCCESS',
        details: 'Streams: CAM-02 + Drone 3',
        type: 'Evidence'
      }
    ];

    setLogs(prev => [...newLogs, ...prev]);
    setAlerts(prev => [newAlert, dummyAlert, ...prev]);
    setSelectedAlertId(newAlert.id);
    setIsRailVisible(true);
  }, []);

  const handleAlertIconClick = useCallback(() => {
    setAlertDrawerInitialMode('response');
    if (alerts.length === 0) {
      handleTriggerAlert();
    } else {
      if (isRailVisible) {
        setIsRailVisible(false);
        setSelectedAlertId(null);
      } else {
        setIsRailVisible(true);
      }
    }
  }, [alerts.length, isRailVisible, handleTriggerAlert]);

  const handleCloseDrawer = () => {
    setSelectedAlertId(null);
    setIsRailVisible(false);
  };

  const handleCloseRail = () => {
    setIsRailVisible(false);
    setSelectedAlertId(null);
  };

  const handleSelectAlert = (id: string) => {
    setAlertDrawerInitialMode('response');
    setSelectedAlertId(id);
  };

  const handleDismissIntro = () => {
    setShowIntro(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  const handleOpenCaseFromRepo = (caseId: string) => {
    let targetAlert = alerts.find(a => a.id === caseId);

    if (!targetAlert) {
      targetAlert = {
        id: caseId,
        type: 'Historical Incident',
        site: 'Site A',
        severity: 'Medium',
        timestamp: Date.now() - 1000000,
        confidence: 0.9,
        status: 'Resolved',
        aiSummary: 'Mock data for repository viewing.',
        details: {
          why: 'Historical record access',
          action: 'Review only',
          droneId: 'N/A',
          zone: 'N/A'
        }
      };
      setAlerts(prev => [targetAlert!, ...prev]);
    }

    setSelectedAlertId(caseId);
    setAlertDrawerInitialMode('case_file');
    setIsEvidenceRepoOpen(false);
    setIsRailVisible(true);
  };

  const openAuditTrail = (incidentId: string) => {
    setDrawerState({
      isOpen: true,
      filter: { query: incidentId }
    });
  };

  const toggleActivityLog = () => {
    setDrawerState(prev => {
      if (prev.isOpen) return { ...prev, isOpen: false };
      return { isOpen: true, filter: null };
    });
  };

  const toggleEvidenceRepo = () => {
    setIsEvidenceRepoOpen(prev => !prev);
    if (!isEvidenceRepoOpen) {
      setDrawerState(prev => ({ ...prev, isOpen: false }));
      setSelectedAlertId(null);
      setIsRailVisible(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEvidenceRepoOpen) {
          setIsEvidenceRepoOpen(false);
          return;
        }
        setSelectedAlertId(null);
        setDrawerState(prev => ({ ...prev, isOpen: false }));
        if (alerts.length > 0) setIsRailVisible(false);
        return;
      }

      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.code === 'Space' && !isTyping) {
        e.preventDefault();
        handleAlertIconClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alerts.length, isRailVisible, handleAlertIconClick, isEvidenceRepoOpen]);

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || null;
  const isDrawerOpen = !!selectedAlertId;
  const showBackdrop = isRailVisible || drawerState.isOpen || isEvidenceRepoOpen;

  return (
    <div className="h-screen w-full bg-app text-white flex flex-col overflow-hidden relative">
      {showIntro ? (
        <IntroScreen onDismiss={handleDismissIntro} />
      ) : (
        <>
          <TopBar
            onSync={handleSync}
            isSyncing={isSyncing}
            onAlertIconClick={handleAlertIconClick}
            onOpenActivityLog={toggleActivityLog}
            onOpenEvidenceLog={toggleEvidenceRepo}
            alertCount={alerts.length}
          />

          <main className="flex-grow flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden relative z-0 pt-32 pb-16 [scrollbar-gutter:stable]">
            <div className="w-full max-w-[720px] px-4 sm:px-6 flex flex-col animate-slide-up">
              <div className="w-full mb-5 flex flex-col gap-4">
                <StatusLine lastSync={lastSyncTime} onSync={handleSync} isSyncing={isSyncing} />
                {activeJob && <RunningTaskPill job={activeJob} />}
              </div>
              <div className="w-full mb-8">
                <CommandBar onCommandSent={(cmd) => {
                  addToast("Command sent to system");
                  setActiveJob({ id: 'job-new', type: cmd.split(' on ')[0] || 'Task', siteName: cmd.split(' on ')[1] || 'Site', status: 'Running', duration: 60 });
                }} />
              </div>
              <div className="w-full flex flex-col gap-4">
                <div
                  onClick={() => setIsSitesVisible(!isSitesVisible)}
                  className="flex items-center justify-between w-full cursor-pointer group select-none"
                >
                  <h2 className="text-[16px] font-medium text-white/50 group-hover:text-white transition-colors text-left">Sites (3)</h2>
                  <div className="p-1 rounded-md group-hover:bg-surface-hover text-white/50 group-hover:text-white transition-colors">
                    {isSitesVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSitesVisible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <SitesGrid />
                  </div>
                </div>
              </div>
              <div className="mt-2 h-8 w-full" />
            </div>


          </main>





          <AlertRail
            alerts={alerts}
            selectedAlertId={selectedAlertId}
            onSelectAlert={handleSelectAlert}
            onClose={handleCloseRail}
            isOpen={isRailVisible}
            isDrawerOpen={isDrawerOpen}
          />

          <AlertDrawer
            alert={selectedAlert}
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            onOpenAuditTrail={() => selectedAlert && openAuditTrail(selectedAlert.id)}
            onShowToast={addToast}
            initialViewMode={alertDrawerInitialMode}
          />

          <ActivityLogDrawer
            logs={logs}
            isOpen={drawerState.isOpen}
            onClose={() => setDrawerState(prev => ({ ...prev, isOpen: false }))}
            initialFilter={drawerState.filter}
          />

          <EvidenceRepository
            isOpen={isEvidenceRepoOpen}
            onClose={() => setIsEvidenceRepoOpen(false)}
            onOpenCase={handleOpenCaseFromRepo}
          />

          <div className="fixed bottom-8 left-8 flex flex-col gap-2 pointer-events-none z-50">
            {toasts.map((toast) => (
              <Toast key={toast.id} message={toast.message} />
            ))}
          </div>

          {/* Dark Overlay for Focus Mode */}
          <div
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-20 transition-opacity duration-500 pointer-events-none ${showBackdrop ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}