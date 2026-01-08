
export interface Site {
  id: string;
  name: string;
  location: string;
  dronesReady: number;
  dronesBusy: number;
  lastEvent: string;
  status: 'Normal' | 'Alert' | 'Investigating' | 'Offline';
  activeTask: string | null;
  connectionState: 'Online' | 'Degraded' | 'Offline';
  alertCount?: number;
}

export interface ToastMessage {
  id: number;
  message: string;
}

export interface Job {
  id: string;
  type: string;
  siteName: string;
  status: 'Running' | 'Completed';
  duration?: number;
}

export interface Alert {
  id: string;
  severity: 'High' | 'Critical' | 'Medium' | 'Low';
  type: string;
  site: string;
  timestamp: number;
  confidence: number;
  status: 'Unreviewed' | 'In Review' | 'Assessing' | 'Acknowledged' | 'Resolved';
  aiSummary: string; // New field for Phase 1 PRD
  details: {
    why: string;
    action: string;
    droneId: string;
    zone: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: number;
  incidentId?: string;
  incidentStartTime?: number;
  site: string;
  zone?: string;
  actor: string;
  action: string;
  asset?: string;
  result: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'INFO';
  details: string;
  type: 'Incident' | 'Drone' | 'Evidence' | 'System' | 'Operator';
}