import React, { useState, useEffect, useRef } from 'react';
import { X, Battery, Signal, Video, Maximize2, Radio, MapPin, ChevronRight, CheckCircle2, AlertTriangle, Crosshair, ArrowRight, Loader2, RefreshCw, LayoutGrid, Layout, Pin, MoreVertical, Send, MessageSquare, Share2, Camera, User, Play, Clock, Shield, Grid, Grid3x3, ChevronDown, Check, FileText, Flag, Plus, AlertCircle, Info, Mic, Download, Filter, Calendar, Search, Copy, Paperclip, Lock, Database, Globe, HelpCircle, Map, FolderOpen } from 'lucide-react';
import { Alert } from '../types';

interface AlertDrawerProps {
    alert: Alert | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenAuditTrail: () => void;
    onShowToast: (msg: string) => void;
    initialViewMode?: 'response' | 'case_file';
}

// Feed Interface
interface Feed {
    id: string;
    source: string;
    type: 'cctv' | 'drone';
    status: 'live' | 'connecting' | 'degraded';
    targetTag?: string;
    isPinned?: boolean;
}

interface Task {
    id: string;
    name: string;
    assignee: string;
    status: 'Queued' | 'En route' | 'Active' | 'Completed';
    eta?: string;
}

interface Asset {
    id: string;
    name: string;
    status: string;
    intent: string;
    battery: string;
    link: string;
    mode: string;
}

interface EvidenceItem {
    id: string;
    time: string;
    type: 'video' | 'snapshot' | 'note' | 'clip';
    source: string;
    tag: string;
    label: string;
    duration?: string;
    format?: string;
    content?: string;
}

// Mock Evidence Data for Phase 3
const MOCK_EVIDENCE_INITIAL: EvidenceItem[] = [
    { id: 'ev-1', time: '14:32:01', type: 'video', source: 'Drone 3', tag: 'Auto-Track', label: 'Suspect identified at Gate 2', duration: '00:42' },
    { id: 'ev-2', time: '14:32:15', type: 'snapshot', source: 'CAM-02', tag: 'Manual', label: 'Visual confirmation of vehicle', format: 'JPG' },
    { id: 'ev-3', time: '14:32:45', type: 'note', source: 'Operator', tag: 'Note', label: 'Gate 2 lock appears broken', content: 'Visual inspection suggests forced entry on the main latch mechanism.' },
    { id: 'ev-4', time: '14:33:10', type: 'video', source: 'Drone 3', tag: 'Auto-Track', label: 'Target tracking: Sector 4', duration: '01:15' },
    { id: 'ev-5', time: '14:33:30', type: 'snapshot', source: 'Drone 2', tag: 'Auto', label: 'Perimeter visual sweep', format: 'JPG' },
];

export const AlertDrawer: React.FC<AlertDrawerProps> = ({ alert, isOpen, onClose, onOpenAuditTrail, onShowToast, initialViewMode = 'response' }) => {
    const [showDismissConfirm, setShowDismissConfirm] = useState(false);
    const [showDeploySheet, setShowDeploySheet] = useState(false);

    // Phase 2 State
    const [viewMode, setViewMode] = useState<'details' | 'response'>('details');
    const [layout, setLayout] = useState<'focus' | '2x2' | '3x3'>('focus');
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [showDronePresets, setShowDronePresets] = useState(false);
    const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

    // Phase 2 New State (Tabs & Case File)
    const [activeTab, setActiveTab] = useState<'response' | 'brief' | 'evidence'>('response');
    const [isCaseFileOpen, setIsCaseFileOpen] = useState(false);
    const [mockEvidence, setMockEvidence] = useState<EvidenceItem[]>(MOCK_EVIDENCE_INITIAL);
    const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('ev-1');

    // Phase 3 States
    const [isNoteComposerOpen, setIsNoteComposerOpen] = useState(false);
    const [tempNote, setTempNote] = useState('');
    const [metadataView, setMetadataView] = useState<'details' | 'map'>('details');

    const [latestUpdate, setLatestUpdate] = useState<string>('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [deployedAssets, setDeployedAssets] = useState<Asset[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    // Lock State
    const [isPerimeterLocked, setIsPerimeterLocked] = useState(false);
    const [lockTime, setLockTime] = useState<string | null>(null);

    // Briefing State
    const [briefRecipient, setBriefRecipient] = useState('Team Alpha');
    const [briefText, setBriefText] = useState('');
    const [briefSent, setBriefSent] = useState(false);
    const [briefStatus, setBriefStatus] = useState<'draft' | 'sent' | 'delivered' | 'acked'>('draft');
    const [briefSentTime, setBriefSentTime] = useState<string | null>(null);
    const [briefTemplate, setBriefTemplate] = useState<'radio' | 'standard' | 'detailed'>('standard');
    const [briefAttachments, setBriefAttachments] = useState<string[]>(['Snapshot', 'Map Location']);

    // Drill Down States (Metrics)
    const [activeMetricDrill, setActiveMetricDrill] = useState<'tasks' | 'feeds' | 'lock' | null>(null);

    // Mark Moment Config
    const [captureWindow, setCaptureWindow] = useState<string>('10s/20s'); // -10s, +20s

    // Export State
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportMode, setExportMode] = useState<'quick' | 'custom'>('quick');
    const [exportReason, setExportReason] = useState('Police');
    const [exportScope, setExportScope] = useState<'All' | 'Selected' | 'Time'>('All');
    const [exportIncludes, setExportIncludes] = useState<string[]>(['GPS', 'Flight Path', 'Notes', 'CoC', 'Hashes']);

    // Reset state when alert changes
    useEffect(() => {
        if (alert) {
            if (['Assessing', 'In Progress', 'Response'].includes(alert.status)) {
                setViewMode('response');
                setIsRecording(true); // Auto-record on response mode
                setTasks([
                    { id: 't1', name: 'Track Target', assignee: 'Drone 3', status: 'Active' },
                    { id: 't2', name: 'Evidence Capture', assignee: 'System', status: 'Active' }
                ]);
                setDeployedAssets([
                    {
                        id: 'd3',
                        name: 'Drone 3',
                        status: 'Airborne',
                        intent: 'Tracking Target A',
                        battery: '72%',
                        link: 'Good',
                        mode: 'Locked'
                    }
                ]);
                setLatestUpdate('Target moving East → likely Gate 3 in ~45s (High)');
                setActiveTab('response'); // Default tab
            } else {
                setViewMode('details');
                setIsRecording(false);
                setTasks([]);
                setDeployedAssets([]);
                setLatestUpdate('');
            }

            // Handle Deep Link to Case File
            setIsCaseFileOpen(initialViewMode === 'case_file');

            setShowDronePresets(false);
            setIsPerimeterLocked(false);
            setLockTime(null);
            setMockEvidence(MOCK_EVIDENCE_INITIAL);
            setSelectedEvidenceId('ev-1');
            setIsNoteComposerOpen(false);

            // Initialize Feeds
            setFeeds([
                { id: '1', source: 'CAM-02', type: 'cctv', status: 'live', targetTag: 'Target A' },
                { id: '2', source: 'Drone 3', type: 'drone', status: 'live', targetTag: 'Target A' },
                { id: '3', source: 'CAM-05', type: 'cctv', status: 'live', targetTag: 'Back Gate' },
                { id: '4', source: 'Drone 1', type: 'drone', status: 'connecting', targetTag: 'Perimeter' },
                { id: '5', source: 'CAM-08', type: 'cctv', status: 'live', targetTag: 'Lobby' },
                { id: '6', source: 'CAM-01', type: 'cctv', status: 'live', targetTag: 'North Wall' },
                { id: '7', source: 'CAM-09', type: 'cctv', status: 'live', targetTag: 'Corridor A' },
                { id: '8', source: 'CAM-11', type: 'cctv', status: 'live', targetTag: 'Stairwell' },
                { id: '9', source: 'Drone 2', type: 'drone', status: 'connecting', targetTag: 'Roof' },
            ]);

            // Dynamic timestamps for timeline based on alert time
            const baseTime = new Date(alert.timestamp);
            const formatTime = (offsetSeconds: number) => {
                const t = new Date(baseTime.getTime() + offsetSeconds * 1000);
                return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
            };

            setTimelineEvents([
                { time: 'T+00:00', label: "Alert triggered", src: `${formatTime(0)} — Motion Sensor B`, status: 'done', category: 'incident' },
                { time: 'T+00:02', label: "Autonomous dispatch", src: `${formatTime(2)} — System`, status: 'done', category: 'system' },
                { time: 'T+00:05', label: "Tracking initiated", src: `${formatTime(5)} — Drone 3`, status: 'active', category: 'drone' },
            ]);

            // Reset Brief
            setBriefText(`Intrusion suspected at Gate 2. Person moving East. Intercept recommended at Sector 4.`);
            setBriefTemplate('standard');
            setBriefSent(false);
            setBriefStatus('draft');
            setBriefSentTime(null);
        }
    }, [alert, initialViewMode]); // Re-run when initialViewMode changes

    if (!alert) return null;

    // PRD Requirement: Confidence mapping
    const confidenceLabel = alert.confidence > 0.8 ? 'High' : 'Medium';
    const incidentDate = new Date(alert.timestamp);
    const dateStr = `${incidentDate.getFullYear()}-${String(incidentDate.getMonth() + 1).padStart(2, '0')}-${String(incidentDate.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(incidentDate.getHours()).padStart(2, '0')}:${String(incidentDate.getMinutes()).padStart(2, '0')}:${String(incidentDate.getSeconds()).padStart(2, '0')}`;

    // -- Actions --

    const addLogEntry = (label: string, src: string = "Operator", category: string = "operator") => {
        const now = new Date();
        const absTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const time = `T+${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        // Ensure source has absolute time if generic Operator
        const displaySrc = src === "Operator" ? `${absTime} — Operator` : src;

        setTimelineEvents(prev => [{ time, label, src: displaySrc, status: 'active', category }, ...prev]);
    };

    const handleConfirmThreat = () => {
        setShowDeploySheet(false);
        setViewMode('response');
        setActiveTab('response');
        setIsRecording(true);
        setTasks([
            { id: 't1', name: 'Track Target', assignee: 'Drone 3', status: 'Active' },
            { id: 't2', name: 'Evidence Capture', assignee: 'System', status: 'Active' }
        ]);
        setDeployedAssets([
            {
                id: 'd3',
                name: 'Drone 3',
                status: 'Airborne',
                intent: 'Tracking Target A',
                battery: '72%',
                link: 'Good',
                mode: 'Locked'
            }
        ]);
        setLatestUpdate('Target moving East → likely Gate 3 in ~45s (High)');

        addLogEntry("Threat confirmed → Response protocols active", "Operator", "incident");
        onShowToast("Threat confirmed. Response protocols active.");
    };

    const handleDeployDrone = (preset: string) => {
        setShowDronePresets(false);
        const newTask: Task = {
            id: `t-${Date.now()}`,
            name: preset,
            assignee: 'Drone 2',
            status: 'En route',
            eta: '12s'
        };
        setTasks(prev => [...prev, newTask]);
        setDeployedAssets(prev => [
            ...prev,
            {
                id: `d-${Date.now()}`,
                name: 'Drone 2',
                status: 'En route',
                intent: preset,
                battery: '98%',
                link: 'Good',
                mode: 'Auto'
            }
        ]);
        setLatestUpdate(`Drone 2 deployed for ${preset}`);
        addLogEntry(`Drone 2 deployed → ${preset}`, "System", "drone");
        onShowToast(`${preset} started • Drone 2 assigned`);
    };

    const handleSendBrief = () => {
        setBriefSent(true);
        setBriefStatus('sent');
        const now = new Date();
        setBriefSentTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);

        // Simulate Pipeline
        setTimeout(() => setBriefStatus('delivered'), 1500);
        setTimeout(() => setBriefStatus('acked'), 4000);

        setLatestUpdate(`Brief sent to ${briefRecipient} — Delivery active`);
        addLogEntry(`Brief sent → ${briefRecipient}`, "Operator", "comms");
        onShowToast(`Brief sent to ${briefRecipient}`);
    };

    const handleMarkMoment = () => {
        const now = new Date();
        const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newEv: EvidenceItem = {
            id: `ev-${Date.now()}`,
            time: time,
            type: 'clip',
            source: 'System',
            tag: 'Manual',
            label: `Marked moment: [Operator] (${captureWindow})`
        };

        setMockEvidence(prev => [newEv, ...prev]);
        addLogEntry("Clip captured", "Operator", "evidence");
        onShowToast(`Clip captured (${captureWindow})`);
    };

    const handleAddNote = () => {
        if (!tempNote.trim()) return;
        const now = new Date();
        const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newEv: EvidenceItem = {
            id: `note-${Date.now()}`,
            time: time,
            type: 'note',
            source: 'Operator',
            tag: 'Note',
            label: 'Operator Note',
            content: tempNote
        };
        setMockEvidence(prev => [newEv, ...prev]);
        setTempNote('');
        setIsNoteComposerOpen(false);
        addLogEntry("Context note added", "Operator", "evidence");
        onShowToast("Note added to case file");
    };

    const handleExport = () => {
        setShowExportModal(false);
        const scopeLabel = exportMode === 'quick' ? 'Quick (Incident)' : `Custom (${exportScope})`;
        addLogEntry(`Exported package: ${scopeLabel}`, "System", "evidence");
        onShowToast(`Package exported: PKG-${Date.now().toString().slice(-6)}`);
    };

    const handleTemplateChange = (tpl: 'radio' | 'standard' | 'detailed') => {
        setBriefTemplate(tpl);
        if (tpl === 'radio') setBriefText("INTRUDER GATE 2. MOVING EAST. INTERCEPT SECTOR 4.");
        if (tpl === 'standard') setBriefText("Intrusion suspected at Gate 2. Person moving East. Intercept recommended at Sector 4.");
        if (tpl === 'detailed') setBriefText("Situation Report:\n- Incident: Unauthorized Access\n- Location: Site A, Gate 2\n- Target: 1 Person, Fast moving\n- Direction: East towards Sector 4\n- Assets: Drone 3 tracking, Drone 2 en route\n- Recommendation: Ground intercept at North Wall.");
    };

    const toggleAttachment = (name: string) => {
        setBriefAttachments(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
    };

    const toggleExportInclude = (id: string) => {
        setExportIncludes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const togglePin = (id: string) => {
        setFeeds(prev => {
            const target = prev.find(f => f.id === id);
            if (!target) return prev;

            // Toggle pin state
            const isNowPinned = !target.isPinned;

            // Create updated item
            const updatedFeed = { ...target, isPinned: isNowPinned };

            // Remove target from list to re-insert
            const others = prev.filter(f => f.id !== id);

            // If pinning, move to index 0 (Primary Focus)
            if (isNowPinned) {
                return [updatedFeed, ...others];
            }
            // If unpinning, append to end (or keep relative order if preferred, but append is safer for 'focus' layout logic)
            else {
                return [...others, updatedFeed];
            }
        });
    };

    const handleFeedClick = (id: string) => {
        togglePin(id);
    };

    // Determine container styles based on mode
    const containerClasses = viewMode === 'response'
        ? 'fixed top-[88px] bottom-[24px] left-[24px] right-[24px] w-auto z-40 flex gap-4 border-none shadow-none'
        : 'fixed top-[88px] bottom-[24px] w-[460px] right-[24px] z-40 flex flex-col bg-surface border border-subtle rounded-xl shadow-neu-flat overflow-hidden bg-gradient-surface';

    const animationClass = isOpen ? (viewMode === 'response' ? 'animate-in fade-in zoom-in-95 duration-300' : 'animate-pulse-twice') : '';

    // -- Components --

    const LatestUpdateBanner = () => {
        if (!latestUpdate) return null;
        return (
            <div className="bg-blue-500/5 border-b border-blue-500/20 px-5 py-2 flex items-center gap-3 shadow-[inset_0_2px_10px_rgba(59,130,246,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-glow-blue" />
                <span className="text-[12px] font-medium text-blue-100 truncate">{latestUpdate}</span>
                <span className="text-[10px] text-blue-400/50 uppercase font-bold tracking-wider ml-auto">Now</span>
            </div>
        );
    };

    const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`
            flex-1 py-3 flex items-center justify-center gap-2 text-[12px] font-medium transition-all relative
            ${activeTab === id ? 'text-white bg-white/5 shadow-inner' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
        `}
        >
            <Icon size={14} />
            {label}
            {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-glow-blue" />
            )}
        </button>
    );

    const renderFeedTile = (feed: Feed, index: number) => {
        // Focus Layout: Index 0 is Large
        const isLarge = layout === 'focus' && index === 0;
        const showRedBox = feed.type === 'cctv';
        const showOverlays = isLarge ? true : undefined;

        return (
            <div
                key={feed.id}
                onClick={() => handleFeedClick(feed.id)}
                className={`
                relative bg-black border border-white/10 overflow-hidden group rounded-xl cursor-pointer transition-all duration-300 hover:shadow-neu-hover shadow-neu-flat
                ${isLarge ? 'col-span-3 row-span-2' : 'col-span-1 row-span-1'}
                ${feed.isPinned ? 'border-blue-500/50 shadow-glow-blue' : 'hover:border-white/30'}
            `}
            >
                {/* Video Content Placeholder */}
                {feed.status === 'live' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {showRedBox ? (
                            <div className="absolute top-[20%] left-[35%] w-[30%] h-[60%] border-2 border-red-500 rounded-sm shadow-glow-red">
                                <div className="absolute -top-[21px] left-[-2px] bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm uppercase tracking-wider shadow-lg">
                                    Person
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full border-[20px] border-transparent relative">
                                <Crosshair className="text-white/20 absolute inset-0 m-auto w-1/2 h-1/2" strokeWidth={0.5} />
                                <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] border border-green-400/50 rounded-sm"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                        <Loader2 className="animate-spin text-white/30 mb-2" />
                        <span className="text-[11px] text-white/50 uppercase tracking-wider">Connecting...</span>
                    </div>
                )}

                {/* Header: Live Badge + Source */}
                <div className="absolute top-4 left-4 flex items-center gap-3 z-10 pointer-events-none">
                    <span className={`text-[11px] px-2 py-0.5 rounded-sm uppercase font-bold tracking-wider shadow-lg ${feed.status === 'live' ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-white/50'}`}>
                        {feed.status === 'live' ? 'LIVE' : 'LINK'}
                    </span>
                    <span className="text-[13px] font-medium text-white tracking-wide drop-shadow-md">
                        {feed.source}
                    </span>
                </div>

                {/* Right Icons */}
                <div className={`absolute top-4 right-4 flex flex-col gap-3 transition-opacity duration-200 z-20 ${showOverlays ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); togglePin(feed.id); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-white/20 text-white transition-colors ${feed.isPinned ? 'text-blue-400' : ''}`}
                        title="Pin to Focus"
                    >
                        <Pin size={16} className={feed.isPinned ? 'fill-blue-400' : ''} />
                    </button>
                </div>

                {/* Footer */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-bold text-white tracking-tight drop-shadow-md">{feed.targetTag || feed.source}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-white/50 font-mono tracking-wide drop-shadow-md">{timeStr}</span>
                            {feed.status === 'live' && isRecording && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[12px] text-red-500 font-bold tracking-wider flex items-center gap-1.5 drop-shadow-md">
                                        <span className="text-white/20">•</span> REC
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAssetCard = (asset: Asset, isPrimary: boolean = false) => {
        return (
            <div key={asset.id} className="bg-gradient-card border border-white/5 rounded-xl p-4 shadow-neu-flat">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[15px] font-semibold text-white">{asset.name}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border shadow-glow-blue ${asset.status === 'Airborne' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                            asset.status === 'En route' ? 'bg-white/10 text-white/60 border-white/10' :
                                'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            }`}>
                            {asset.status}
                        </span>
                    </div>
                    <span className="text-[12px] text-white/60">{asset.intent}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/20 rounded-lg p-2 border border-white/5 shadow-inner">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Battery size={10} className="text-white/40" />
                            <span className="text-[10px] text-white/40 font-bold uppercase">BAT</span>
                        </div>
                        <div className="text-[14px] font-semibold text-white">{asset.battery}</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 border border-white/5 shadow-inner">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Signal size={10} className="text-white/40" />
                            <span className="text-[10px] text-white/40 font-bold uppercase">LINK</span>
                        </div>
                        <div className="text-[14px] font-semibold text-emerald-400">{asset.link}</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 border border-white/5 shadow-inner">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Crosshair size={10} className="text-white/40" />
                            <span className="text-[10px] text-white/40 font-bold uppercase">MODE</span>
                        </div>
                        <div className="text-[14px] font-semibold text-white">{asset.mode}</div>
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    // PHASE 3: CASE FILE DEEP VIEW (Overlay)
    if (isCaseFileOpen) {
        const selectedItem = mockEvidence.find(e => e.id === selectedEvidenceId);

        return (
            <div className="fixed inset-0 z-[100] bg-app flex flex-col animate-in fade-in duration-200">
                {/* Case File Header */}
                <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/5 bg-surface shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-[18px] font-semibold text-white flex items-center gap-3">
                                <FileText className="text-blue-400" size={20} />
                                Case File: {alert.id}
                            </h2>
                            <div className="text-[12px] text-white/50 flex items-center gap-2 mt-1">
                                <span>{alert.type}</span>
                                <span className="text-white/20">•</span>
                                <span>{dateStr}</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        <div className="flex items-center gap-2">
                            <div className="bg-white/5 border border-white/10 rounded-lg flex items-center px-3 py-1.5 gap-2">
                                <Search size={14} className="text-white/40" />
                                <input type="text" placeholder="Search evidence..." className="bg-transparent border-none outline-none text-[13px] text-white w-[200px]" />
                            </div>
                            <button className="h-9 px-3 rounded-lg border border-white/10 hover:bg-white/5 flex items-center gap-2 text-[13px] text-white/70">
                                <Filter size={14} /> Filter
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setExportMode('quick'); // Default to Quick
                                setShowExportModal(true);
                            }}
                            className="h-9 px-4 rounded-lg bg-gradient-blue hover:opacity-90 text-white text-[13px] font-semibold flex items-center gap-2 shadow-glow-blue transition-all border border-blue-400/20"
                        >
                            <Download size={14} /> Export Package
                        </button>
                        <button
                            onClick={() => setIsCaseFileOpen(false)}
                            className="h-9 w-9 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Case File 3-Panel Layout */}
                <div className="flex-1 flex overflow-hidden relative">

                    {/* Panel 1: Timeline List */}
                    <div className="w-[360px] border-r border-white/5 bg-surface/50 flex flex-col">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-white/50">Evidence Timeline</span>
                            <span className="text-[12px] text-white/30">{mockEvidence.length} items</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {mockEvidence.map((item) => {
                                const isSelected = selectedEvidenceId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedEvidenceId(item.id)}
                                        className={`p-3 rounded-lg border flex gap-3 cursor-pointer transition-all duration-200 group relative overflow-hidden ${isSelected ? 'bg-white/5 border-white/10' : 'bg-surface border-transparent hover:bg-white/5 hover:border-white/5'}`}
                                    >
                                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-none" />}
                                        <div className="flex flex-col items-center gap-1 pt-1 pl-1">
                                            {item.type === 'video' ? <Video size={14} className={isSelected ? "text-white" : "text-white/60"} /> :
                                                item.type === 'snapshot' ? <Camera size={14} className={isSelected ? "text-white" : "text-white/60"} /> :
                                                    item.type === 'clip' ? <Play size={14} className={isSelected ? "text-white" : "text-white/60"} /> :
                                                        <FileText size={14} className={isSelected ? "text-white" : "text-white/60"} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <span className={`text-[13px] font-medium truncate ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{item.label}</span>
                                                <span className="text-[11px] font-mono text-white/40">{item.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-white/50">
                                                <span>{item.source}</span>
                                                <span className="text-white/20">•</span>
                                                <span className="bg-white/5 px-1.5 rounded text-white/40">{item.tag}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Panel 2: Main Preview - Dynamic Content */}
                    <div className="flex-1 bg-black/40 flex flex-col relative transition-opacity duration-300">
                        <div className="flex-1 flex items-center justify-center p-8">
                            {selectedItem ? (
                                <div className="w-full h-full max-w-[800px] max-h-[500px] bg-black rounded-lg border border-white/10 flex items-center justify-center relative group shadow-2xl overflow-hidden">
                                    {selectedItem.type === 'video' || selectedItem.type === 'clip' ? (
                                        <>
                                            <Play size={48} className="text-white/20 group-hover:text-white/40 transition-colors cursor-pointer" />
                                            <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div className="w-1/3 h-full bg-blue-500 shadow-glow-blue" />
                                            </div>
                                            <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur rounded text-[11px] text-white/80 font-mono">
                                                {selectedItem.source} • {selectedItem.time}
                                            </div>
                                        </>
                                    ) : selectedItem.type === 'snapshot' ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Camera size={48} className="text-white/20" />
                                            <div className="text-white/40 text-[13px]">Image Preview Placeholder</div>
                                            <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur rounded text-[11px] text-white/80 font-mono">
                                                {selectedItem.source} • {selectedItem.time}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center max-w-md">
                                            <FileText size={48} className="text-white/20 mx-auto mb-4" />
                                            <h4 className="text-white font-medium text-lg mb-2">{selectedItem.label}</h4>
                                            <p className="text-white/60 text-sm leading-relaxed">
                                                {selectedItem.content || "No text content available."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-white/30">Select an item to preview</div>
                            )}
                        </div>
                        <div className="h-16 border-t border-white/5 bg-surface flex items-center px-6 justify-between">
                            <div className="flex items-center gap-4">
                                <button className="text-white/70 hover:text-white"><Share2 size={16} /></button>
                                <div className="w-px h-4 bg-white/10" />
                                <span className="text-[13px] text-white/50">{selectedItem?.label || 'Select item'}</span>
                            </div>
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-[12px] text-white">Download</button>
                        </div>
                    </div>

                    {/* Panel 3: Metadata & CoC */}
                    <div className="w-[300px] border-l border-white/5 bg-surface/50 flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-surface flex items-center justify-between">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-white/50">Metadata</span>
                            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                                <button
                                    onClick={() => setMetadataView('details')}
                                    className={`p-1.5 rounded-md transition-all ${metadataView === 'details' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    <FileText size={12} />
                                </button>
                                <button
                                    onClick={() => setMetadataView('map')}
                                    className={`p-1.5 rounded-md transition-all ${metadataView === 'map' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    <Map size={12} />
                                </button>
                            </div>
                        </div>

                        {metadataView === 'details' ? (
                            <div className="p-4 space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <div className="text-[11px] text-white/40 uppercase font-bold mb-2">Source Details</div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[13px]">
                                            <span className="text-white/60">Device ID</span>
                                            <span className="text-white font-mono">{selectedItem ? 'DRN-03-XJ' : '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-[13px]">
                                            <span className="text-white/60">Location</span>
                                            <span className="text-white font-mono">34.05, -118.25</span>
                                        </div>
                                        <div className="flex justify-between text-[13px]">
                                            <span className="text-white/60">Format</span>
                                            <span className="text-white font-mono">{(selectedItem as any)?.format || 'MP4 (H.265)'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-white/5" />

                                <div>
                                    <div className="text-[11px] text-white/40 uppercase font-bold mb-2">Chain of Custody</div>
                                    <div className="space-y-3 relative pl-2">
                                        <div className="absolute left-[3px] top-1 bottom-1 w-px bg-white/10" />
                                        <div className="flex gap-3 relative">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-lg" />
                                            <div>
                                                <div className="text-[12px] text-white">Captured</div>
                                                <div className="text-[10px] text-white/40">{selectedItem?.time || '14:32:01'} • System</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 relative">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-lg" />
                                            <div>
                                                <div className="text-[12px] text-white">Auto-Tagged</div>
                                                <div className="text-[10px] text-white/40">{selectedItem?.time || '14:32:02'} • AI Core</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 relative">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                                            <div>
                                                <div className="text-[12px] text-white">Viewed</div>
                                                <div className="text-[10px] text-white/40">14:35:12 • Operator</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded p-3 flex gap-2 shadow-inner">
                                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5" />
                                    <div className="text-[11px] text-emerald-100">Digital signature verified. Original file intact.</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 relative animate-in fade-in duration-200">
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white/30 p-6 text-center">
                                    <MapPin size={32} className="mb-2 opacity-50" />
                                    <p className="text-[12px]">Flight path visualization</p>
                                    <p className="text-[10px] text-white/20 mt-1">{selectedItem ? `Source: ${selectedItem.source}` : 'Select item to view path'}</p>
                                    <div className="mt-4 w-full h-32 border-l border-b border-white/20 relative">
                                        <div className="absolute bottom-0 left-0 w-full h-full border-t border-r border-dashed border-white/10 rounded-tr-3xl" />
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full shadow-glow-blue" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export Modal (Phase 3 Redesign) */}
                    {showExportModal && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                            <div className="bg-surface border border-white/10 rounded-xl w-[440px] shadow-2xl bg-gradient-surface flex flex-col overflow-hidden">
                                {/* Modal Header */}
                                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-surface/50">
                                    <h3 className="text-[16px] font-semibold text-white">Export Package</h3>
                                    <button onClick={() => setShowExportModal(false)}><X size={16} className="text-white/40 hover:text-white" /></button>
                                </div>

                                {/* Tabs */}
                                <div className="flex p-1 bg-black/20 m-5 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => setExportMode('quick')}
                                        className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-all ${exportMode === 'quick' ? 'bg-surface text-white shadow-neu-flat border border-white/10' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        Quick Export
                                    </button>
                                    <button
                                        onClick={() => setExportMode('custom')}
                                        className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-all ${exportMode === 'custom' ? 'bg-surface text-white shadow-neu-flat border border-white/10' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        Custom Export
                                    </button>
                                </div>

                                <div className="px-5 pb-5 space-y-5">
                                    {exportMode === 'quick' ? (
                                        <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3">
                                                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                                <div className="text-[12px] text-blue-100">
                                                    Packages everything from incident start (14:32:00) to now. Includes full chain of custody and GPS logs.
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[13px] border-b border-white/5 pb-2">
                                                    <span className="text-white/60">Time Range</span>
                                                    <span className="text-white">Incident Duration (Active)</span>
                                                </div>
                                                <div className="flex justify-between text-[13px] border-b border-white/5 pb-2">
                                                    <span className="text-white/60">Items</span>
                                                    <span className="text-white">{mockEvidence.length} items + Logs</span>
                                                </div>
                                                <div className="flex justify-between text-[13px]">
                                                    <span className="text-white/60">Estimated Size</span>
                                                    <span className="text-white font-mono">~145 MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                            <div>
                                                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Scope</label>
                                                <div className="bg-black/20 p-1 rounded-lg flex border border-white/5">
                                                    {(['All', 'Selected', 'Time'] as const).map(scope => (
                                                        <button
                                                            key={scope}
                                                            onClick={() => setExportScope(scope)}
                                                            className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${exportScope === scope ? 'bg-surface text-white shadow-neu-flat border border-white/10' : 'text-white/40 hover:text-white/60 hover:bg-white/10 border border-transparent'}`}
                                                        >
                                                            {scope}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Includes</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['GPS', 'Flight Path', 'Notes', 'CoC', 'Hashes'].map(opt => {
                                                        const isChecked = exportIncludes.includes(opt);
                                                        return (
                                                            <div
                                                                key={opt}
                                                                onClick={() => toggleExportInclude(opt)}
                                                                className="flex items-center gap-2 cursor-pointer group"
                                                            >
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-white/30 group-hover:border-white/50'}`}>
                                                                    {isChecked && <Check size={10} className="text-white" />}
                                                                </div>
                                                                <span className={`text-[13px] ${isChecked ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>{opt}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Reason</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full h-9 bg-black/20 border border-white/10 rounded-lg text-[13px] text-white px-3 outline-none appearance-none cursor-pointer hover:border-white/20 transition-colors"
                                                        value={exportReason}
                                                        onChange={(e) => setExportReason(e.target.value)}
                                                    >
                                                        <option value="Police">Police Handoff</option>
                                                        <option value="Insurance">Insurance Claim</option>
                                                        <option value="Internal">Internal Review</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setShowExportModal(false)} className="flex-1 h-10 rounded-lg border border-white/10 text-[13px] text-white/70 hover:bg-white/5 transition-colors">Cancel</button>
                                        <button onClick={handleExport} className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-500 shadow-glow-blue transition-colors flex items-center justify-center gap-2">
                                            <Download size={14} />
                                            {exportMode === 'quick' ? 'Quick Export' : 'Custom Export'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // PHASE 2: TABBED WORKSPACE (Response Mode)
    if (viewMode === 'response') {
        return (
            <div key="response-view" className={containerClasses + " " + animationClass}>

                {/* CARD A: LIVE FEEDS CANVAS */}
                <div className="flex-1 bg-surface border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-neu-flat relative bg-gradient-card">
                    {/* Header Row */}
                    <div className="h-[60px] px-5 flex items-center justify-between border-b border-white/5 bg-surface/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-glow-red" />
                            <span className="text-[14px] font-bold text-white tracking-wide">LIVE FEEDS</span>
                        </div>

                        {/* Layout Switcher - Standardized Segmented Control */}
                        <div className="bg-black/20 p-1 rounded-lg flex border border-white/5">
                            <button
                                onClick={() => setLayout('focus')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${layout === 'focus' ? 'bg-surface text-white shadow-neu-flat border border-white/10' : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'}`}
                            >
                                <Layout size={14} />
                                <span className="text-[11px] font-medium">Focus</span>
                            </button>
                            <button
                                onClick={() => setLayout('2x2')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${layout === '2x2' ? 'bg-surface text-white shadow-neu-flat border border-white/10' : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'}`}
                            >
                                <LayoutGrid size={14} />
                                <span className="text-[11px] font-medium">2×2</span>
                            </button>
                            <button
                                onClick={() => setLayout('3x3')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${layout === '3x3' ? 'bg-surface text-white shadow-neu-flat border border-white/10' : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'}`}
                            >
                                <Grid3x3 size={14} />
                                <span className="text-[11px] font-medium">3×3</span>
                            </button>
                        </div>
                    </div>

                    {/* Video Wall Grid */}
                    <div className="flex-1 p-4 overflow-hidden bg-black/40 shadow-inner">
                        <div className={`grid h-full gap-4 ${layout === 'focus' ? 'grid-cols-4 grid-rows-2' :
                            layout === '2x2' ? 'grid-cols-2 grid-rows-2' :
                                'grid-cols-3 grid-rows-3'
                            }`}>
                            {feeds.slice(0, layout === '3x3' ? 9 : 4).map((feed, idx) => {
                                return renderFeedTile(feed, idx);
                            })}
                        </div>
                    </div>
                </div>

                {/* CARD B: INCIDENT ACTION CENTER */}
                <div className="w-[420px] bg-surface border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-neu-flat relative bg-gradient-card">

                    {/* 1. Incident Header (Actionable Metrics) */}
                    <div className="p-5 border-b border-white/5 relative z-50 bg-surface/50 backdrop-blur-md">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="text-[18px] font-semibold text-white leading-tight">{alert.type}</h2>
                                <div className="flex items-center gap-2 mt-1 flex-wrap text-[13px] text-white/50">
                                    <span>{alert.site}</span>
                                    <span className="text-white/20">•</span>
                                    <span>Gate 2</span>
                                    <span className="text-white/20">•</span>
                                    <span className="font-mono">{alert.id}</span>
                                    <span className="text-white/20">•</span>
                                    <span>Zone B</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        {/* Actionable Context Metrics Row */}
                        <div className="flex items-center gap-3 text-[11px] font-medium mt-3">
                            {/* Tasks Drill */}
                            <button
                                onClick={() => setActiveMetricDrill(activeMetricDrill === 'tasks' ? null : 'tasks')}
                                className={`flex items-center gap-1.5 transition-colors ${activeMetricDrill === 'tasks' ? 'text-blue-400' : 'text-white/70 hover:text-white'}`}
                            >
                                <Crosshair size={12} className={activeMetricDrill === 'tasks' ? "text-blue-400" : "text-blue-400/70"} />
                                <span>Tasks: 2 active</span>
                            </button>
                            <div className="w-px h-3 bg-white/10" />

                            {/* Feeds Drill */}
                            <button
                                onClick={() => setActiveMetricDrill(activeMetricDrill === 'feeds' ? null : 'feeds')}
                                className={`flex items-center gap-1.5 transition-colors ${activeMetricDrill === 'feeds' ? 'text-white' : 'text-white/70 hover:text-white'}`}
                            >
                                <Video size={12} className="text-white/60" />
                                <span>Feeds: 4 live</span>
                            </button>
                            <div className="w-px h-3 bg-white/10" />

                            {/* Site Status Drill */}
                            <button
                                onClick={() => setActiveMetricDrill(activeMetricDrill === 'lock' ? null : 'lock')}
                                className="flex items-center gap-1.5 transition-colors hover:opacity-80"
                            >
                                <Shield size={12} className={isPerimeterLocked ? "text-emerald-400" : "text-white/40"} />
                                <span className="text-[10px]" style={{ color: isPerimeterLocked ? "#34d399" : "rgba(255,255,255,0.6)" }}>
                                    Site: {isPerimeterLocked ? "Locked" : "Open"}
                                </span>
                            </button>
                        </div>

                        {/* Drill Down Views (Popover) */}
                        {activeMetricDrill && (
                            <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded-lg animate-in fade-in slide-in-from-top-1 text-[12px] text-white/80 shadow-lg">
                                {activeMetricDrill === 'tasks' && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-white font-medium"><span>Track Target</span> <span className="text-blue-400">Drone 3</span></div>
                                        <div className="flex justify-between text-white font-medium"><span>Evidence Capture</span> <span className="text-blue-400">System</span></div>
                                    </div>
                                )}
                                {activeMetricDrill === 'feeds' && (
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white">CAM-02</span>
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white">Drone 3</span>
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white">CAM-05</span>
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white">CAM-08</span>
                                    </div>
                                )}
                                {activeMetricDrill === 'lock' && (
                                    <div>
                                        {isPerimeterLocked ? `Locked by Operator at ${lockTime}` : "Perimeter currently accessible. Lock to secure."}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-4">
                            {/* Single Truth Status Pill */}
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-glow-blue" />
                                ACTIVE — IN PROGRESS
                            </span>

                            <div className="w-px h-4 bg-white/10" />

                            <div className="group relative cursor-help">
                                <span className="text-[12px] text-white/60">Confidence: <span className="text-white font-bold">High</span></span>
                                <div className="absolute top-full right-0 mt-2 p-3 w-[240px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none z-[100] transition-opacity">
                                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">Why High Confidence</div>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-[12px] text-white/80">
                                            <CheckCircle2 size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                            Person detected in restricted zone
                                        </li>
                                        <li className="flex items-start gap-2 text-[12px] text-white/80">
                                            <CheckCircle2 size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                            Vehicle signature mismatch
                                        </li>
                                        <li className="flex items-start gap-2 text-[12px] text-white/80">
                                            <CheckCircle2 size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                            Sustained motion {'>'} 10s
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Latest Update Banner */}
                    <LatestUpdateBanner />

                    {/* 4. Tabs */}
                    <div className="flex items-center border-b border-white/5 bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
                        <TabButton id="response" label="Response" icon={Crosshair} />
                        <TabButton id="brief" label="Brief" icon={Send} />
                        <TabButton id="evidence" label="Evidence" icon={Shield} />
                    </div>

                    {/* 5. Tabbed Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">

                        {/* RESPONSE TAB */}
                        {activeTab === 'response' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Content from before (shortened for brevity in XML output, assumes full restore) */}
                                <div className="space-y-3">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40">Recommended Actions</h3>
                                    {!showDronePresets ? (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setShowDronePresets(true)}
                                                className="w-full p-3 bg-gradient-blue hover:opacity-90 rounded-lg flex items-center justify-between text-white font-semibold shadow-glow-blue transition-all border border-blue-400/20 group hover:shadow-neu-hover"
                                            >
                                                <span className="flex items-center gap-2"><Crosshair size={16} /> Deploy additional drones</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Protocol</span>
                                                    <ArrowRight size={16} className="opacity-60" />
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!isPerimeterLocked) {
                                                        const now = new Date();
                                                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                                                        setIsPerimeterLocked(true);
                                                        setLockTime(timeStr);
                                                        onShowToast("Perimeter gates locked");
                                                        addLogEntry("Perimeter gates locked", "Operator", "incident");
                                                    }
                                                }}
                                                disabled={isPerimeterLocked}
                                                className={`w-full p-3 rounded-lg flex items-center justify-between transition-all shadow-neu-flat hover:shadow-neu-hover ${isPerimeterLocked
                                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                                    : 'bg-gradient-card hover:bg-white/5 border border-white/5 text-white'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {isPerimeterLocked ? <Check size={16} /> : <Lock size={16} className="text-white/60" />}
                                                    <span className={isPerimeterLocked ? "font-semibold" : ""}>
                                                        {isPerimeterLocked ? "Perimeter gates locked" : "Lock perimeter gates"}
                                                    </span>
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {isPerimeterLocked ? (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded shadow-sm">Locked</span>
                                                    ) : (
                                                        <div className="flex items-center gap-1 group/tooltip relative">
                                                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase tracking-wide">Suggested</span>
                                                            <HelpCircle size={12} className="text-white/30 cursor-help" />
                                                            <div className="absolute bottom-full right-0 mb-2 p-3 w-[200px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                                                                <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1">Reasoning</div>
                                                                <p className="text-[12px] text-white/80 leading-snug">
                                                                    Intruder heading towards main exit. Lockout recommended to contain threat.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {['Perimeter Scan', 'Track Target', 'Evidence Capture'].map(preset => (
                                                <button
                                                    key={preset}
                                                    onClick={() => handleDeployDrone(preset)}
                                                    className="w-full p-3 rounded-lg border border-white/5 bg-gradient-card hover:bg-white/5 text-left group transition-all shadow-neu-flat hover:shadow-neu-hover"
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[13px] font-medium text-white group-hover:text-blue-400 transition-colors">{preset}</span>
                                                        <ArrowRight size={14} className="text-white/20 group-hover:text-blue-400" />
                                                    </div>
                                                    <div className="flex justify-between items-center text-[11px] text-white/40">
                                                        <span>Auto-assign Drone 2</span>
                                                        <span className="font-mono">ETA 12s</span>
                                                    </div>
                                                </button>
                                            ))}
                                            <button onClick={() => setShowDronePresets(false)} className="w-full py-2 text-[11px] text-white/40 hover:text-white">Cancel</button>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full h-px bg-white/5" />
                                {/* Assets Section */}
                                <div className="space-y-4">
                                    {deployedAssets.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40">Primary Asset</h3>
                                            {renderAssetCard(deployedAssets[0], true)}
                                        </div>
                                    )}

                                    {deployedAssets.length > 1 && (
                                        <div className="space-y-3">
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40">Additional Assets</h3>
                                            <div className="space-y-3">
                                                {deployedAssets.slice(1).map(asset => renderAssetCard(asset))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Task Ledger */}
                                <div className="space-y-2">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40 flex justify-between">
                                        Task Ledger
                                        <span className="text-white/20">{tasks.length} active</span>
                                    </h3>
                                    <div className="space-y-1">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                                                <div>
                                                    <div className="text-[13px] font-medium text-white">{task.name}</div>
                                                    <div className="text-[11px] text-white/50 mt-0.5 flex items-center gap-1">
                                                        <span>{task.assignee}</span>
                                                        {task.eta && <><span className="text-white/20">•</span> <span className="font-mono">{task.eta}</span></>}
                                                    </div>
                                                </div>
                                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${task.status === 'Active' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/40'}`}>
                                                    {task.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BRIEF TAB */}
                        {activeTab === 'brief' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    {/* Recipient Input */}
                                    <div>
                                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 block">To</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={briefRecipient}
                                                onChange={(e) => setBriefRecipient(e.target.value)}
                                                className="w-full h-10 bg-black/20 border border-white/10 rounded-lg px-3 text-[13px] text-white focus:border-white/20 focus:bg-black/30 outline-none transition-colors"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-medium border border-blue-500/20">Team Alpha</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Template Selector */}
                                    <div>
                                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Template</label>
                                        <div className="flex gap-2">
                                            {(['radio', 'standard', 'detailed'] as const).map(tpl => (
                                                <button
                                                    key={tpl}
                                                    onClick={() => handleTemplateChange(tpl)}
                                                    className={`flex-1 py-2 text-[11px] font-medium border rounded-lg capitalize transition-all ${briefTemplate === tpl ? 'bg-white/10 border-white/20 text-white shadow-sm' : 'border-transparent bg-white/5 text-white/50 hover:bg-white/10'}`}
                                                >
                                                    {tpl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div>
                                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Message</label>
                                        <textarea
                                            value={briefText}
                                            onChange={(e) => setBriefText(e.target.value)}
                                            rows={6}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-[13px] text-white/90 focus:border-white/20 focus:bg-black/30 outline-none resize-none leading-relaxed"
                                        />
                                    </div>

                                    {/* Attachments */}
                                    <div>
                                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Attachments</label>
                                        <div className="flex gap-2">
                                            {['Snapshot', 'Map Location', 'Telemetry Log'].map(item => {
                                                const isActive = briefAttachments.includes(item);
                                                return (
                                                    <button
                                                        key={item}
                                                        onClick={() => toggleAttachment(item)}
                                                        className={`px-3 py-1.5 rounded-full border text-[11px] flex items-center gap-2 transition-all ${isActive ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'}`}
                                                    >
                                                        {isActive ? <Check size={12} /> : <Plus size={12} />}
                                                        {item}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/5">
                                    {!briefSent ? (
                                        <button
                                            onClick={handleSendBrief}
                                            className="w-full h-10 bg-gradient-blue hover:opacity-90 text-white rounded-lg font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-glow-blue border border-blue-400/20"
                                        >
                                            Send Briefing
                                        </button>
                                    ) : (
                                        <div className="w-full h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between px-4">
                                            <span className="text-[12px] font-medium text-emerald-400 flex items-center gap-2">
                                                <CheckCircle2 size={14} />
                                                {briefStatus === 'sent' ? 'Sending...' : briefStatus === 'delivered' ? 'Delivered' : 'Acknowledged'}
                                            </span>
                                            <span className="text-[10px] text-emerald-400/60 font-mono">{briefSentTime}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* EVIDENCE TAB */}
                        {activeTab === 'evidence' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                                {/* Quick Capture */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleMarkMoment}
                                        className="p-3 bg-gradient-card border border-white/5 rounded-lg flex flex-col items-center gap-2 hover:bg-white/5 transition-all group shadow-neu-flat"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <Video size={16} />
                                        </div>
                                        <span className="text-[11px] font-medium text-white/70">Mark Moment (-10s)</span>
                                    </button>
                                    <button
                                        onClick={() => setIsNoteComposerOpen(!isNoteComposerOpen)}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all group shadow-neu-flat ${isNoteComposerOpen ? 'bg-white/10 border-white/20' : 'bg-gradient-card border-white/5 hover:bg-white/5'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-[11px] font-medium text-white/70">Add Note</span>
                                    </button>
                                </div>

                                {isNoteComposerOpen && (
                                    <div className="bg-black/20 rounded-lg p-3 border border-white/10 animate-in fade-in slide-in-from-top-2">
                                        <textarea
                                            autoFocus
                                            value={tempNote}
                                            onChange={(e) => setTempNote(e.target.value)}
                                            placeholder="Enter observation notes..."
                                            className="w-full bg-transparent border-none text-[13px] text-white placeholder:text-white/30 focus:outline-none min-h-[60px] resize-none"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setIsNoteComposerOpen(false)} className="px-3 py-1.5 text-[11px] text-white/50 hover:text-white">Cancel</button>
                                            <button onClick={handleAddNote} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-[11px] font-bold rounded shadow-glow-blue">Save Note</button>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full h-px bg-white/5" />

                                {/* Evidence List */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40">Captured Items ({mockEvidence.length})</h3>
                                        <button
                                            onClick={() => setIsCaseFileOpen(true)} // Deep Link Trigger
                                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        >
                                            View Full Case <ArrowRight size={12} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {mockEvidence.slice(0, 4).map((ev) => (
                                            <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setIsCaseFileOpen(true)}>
                                                <div className="mt-0.5 text-white/50 group-hover:text-white transition-colors">
                                                    {ev.type === 'video' ? <Video size={14} /> : ev.type === 'snapshot' ? <Camera size={14} /> : ev.type === 'clip' ? <Play size={14} /> : <FileText size={14} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[13px] font-medium text-white truncate pr-2">{ev.label}</span>
                                                        <span className="text-[11px] font-mono text-white/30 whitespace-nowrap">{ev.time}</span>
                                                    </div>
                                                    <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                                                        <span>{ev.source}</span>
                                                        {ev.duration && <><span>•</span> <span>{ev.duration}</span></>}
                                                        {ev.format && <><span>•</span> <span>{ev.format}</span></>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => { setExportMode('quick'); setShowExportModal(true); }}
                                        className="w-full h-10 border border-white/10 rounded-lg text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} /> Export All Evidence
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            </div >
        );
    }

    // PHASE 1: SIDEBAR (Details) - Preserved
    return (
        <div className={containerClasses + " " + animationClass}>
            {/* HEADER */}
            <div className="h-auto py-5 px-6 border-b border-white/5 bg-surface/50 backdrop-blur-md shrink-0 relative flex flex-col gap-3 z-50">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-[18px] font-semibold text-white leading-tight tracking-tight">{alert.type}</h2>
                        <div className="flex items-center gap-2 text-[13px] text-white/60 font-medium flex-wrap">
                            <span>{alert.site}</span>
                            <span className="text-white/20">•</span>
                            <span>Zone B</span>
                            <span className="text-white/20">•</span>
                            <div className="group relative cursor-help">
                                <span className="text-white/80 border-b border-dashed border-white/20">Conf: {confidenceLabel}</span>
                                <div className="absolute top-full left-0 mt-2 p-3 w-[240px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none z-[100] transition-opacity">
                                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">Why High Confidence</div>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-[12px] text-white/80">
                                            <CheckCircle2 size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                            Person detected in restricted zone
                                        </li>
                                        <li className="flex items-start gap-2 text-[12px] text-white/80">
                                            <CheckCircle2 size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                            Vehicle signature mismatch
                                        </li>
                                        <li className="flex items-start gap-2 text-[12px] text-white/80">
                                            <CheckCircle2 size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                            Sustained motion {'>'} 10s
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <span className="text-white/20">•</span>
                            {/* Case ID */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(alert.id);
                                    onShowToast(`Copied ${alert.id}`);
                                }}
                                className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors group/id"
                            >
                                <FileText size={12} className="text-blue-400" />
                                <span className="font-mono border-b border-transparent group-hover/id:border-white/40 border-dashed">{alert.id}</span>
                            </button>
                            <span className="text-white/20">•</span>
                            {(() => {
                                const isAmber = alert.status === 'Unreviewed';
                                const statusStyles = isAmber
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-glow-blue';
                                return (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusStyles}`}>
                                        {alert.status}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-surface relative">
                <div className="p-6 space-y-6">
                    {/* Live Proof Group */}
                    <div className="space-y-3">
                        <div className="aspect-video w-full bg-black rounded-lg border border-white/10 relative overflow-hidden group shadow-neu-flat hover:shadow-neu-hover transition-all">
                            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-sm uppercase font-bold tracking-wider animate-pulse shadow-glow-red">Live</span>
                                <span className="text-[10px] font-mono text-white/80 bg-black/50 px-2 py-0.5 rounded-sm backdrop-blur-sm shadow-sm">CAM-02</span>
                            </div>
                            <div className="absolute top-[20%] left-[35%] w-[30%] h-[60%] border-2 border-red-500 rounded-sm shadow-glow-red z-20">
                                <div className="absolute -top-5 left-[-2px] bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm uppercase tracking-wider shadow-sm">
                                    Person
                                </div>
                            </div>

                            {/* Overlay Actions (Hover) */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                <button className="w-7 h-7 flex items-center justify-center rounded bg-black/60 hover:bg-white/10 text-white/70 hover:text-white backdrop-blur-md">
                                    <Pin size={12} />
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center rounded bg-black/60 hover:bg-white/10 text-white/70 hover:text-white backdrop-blur-md">
                                    <Camera size={12} />
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center rounded bg-black/60 hover:bg-white/10 text-white/70 hover:text-white backdrop-blur-md">
                                    <MoreVertical size={12} />
                                </button>
                            </div>

                            <div className="absolute bottom-3 left-4 text-[11px] font-mono text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-md border border-white/5 z-20 shadow-sm">
                                {dateStr} {timeStr} IST
                            </div>
                        </div>
                        {alert.aiSummary && (
                            <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/10 rounded-lg p-3 relative overflow-hidden shadow-inner">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                                <span className="text-blue-400 font-bold text-[10px] uppercase tracking-wide block mb-1">AI Summary</span>
                                <p className="text-[13px] text-white/90 leading-snug">{alert.aiSummary}</p>
                            </div>
                        )}
                    </div>

                    {/* Why this alert fired */}
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3">Why this alert fired</h3>
                        <div className="bg-gradient-card rounded-lg p-3 border border-white/5 shadow-neu-flat">
                            <div className="text-[13px] font-medium text-white mb-2">Motion at Gate 2 + unauthorized vehicle signature</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/60 shadow-sm">Sensor: Motion Sensor B</span>
                                <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/60 shadow-sm">Zone: Gate 2</span>
                                <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/60 shadow-sm">Policy: After-hours perimeter</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Context Timeline */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40">Context Timeline</h3>
                        <div className="space-y-0 relative">
                            <div className="absolute left-3 top-2 bottom-4 w-px bg-white/5" />
                            {timelineEvents.map((evt, i) => {
                                const isActive = evt.status === 'active';
                                return (
                                    <div key={i} className={`flex items-start gap-3 py-2 relative group ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                        <div className="w-6 relative z-10 mt-1.5 flex items-center justify-center shrink-0">
                                            {isActive ? (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-glow-blue animate-pulse-fast" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[13px] font-medium ${isActive ? 'text-blue-400' : 'text-white'}`}>{evt.label}</span>
                                                    {isActive && <Loader2 size={10} className="animate-spin text-blue-400" />}
                                                </div>
                                                <span className="text-[11px] font-mono text-white/30">{evt.time}</span>
                                            </div>
                                            <div className="text-[11px] text-white/50">{evt.src}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Action Buttons Row */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button onClick={onOpenAuditTrail} className="h-10 rounded-lg bg-gradient-card border border-white/10 hover:bg-white/5 text-[13px] font-medium text-white transition-colors shadow-neu-flat">
                                View Audit Trail
                            </button>
                            <button onClick={() => { setViewMode('response'); setActiveTab('evidence'); }} className="h-10 rounded-lg bg-gradient-card border border-white/10 hover:bg-white/5 text-[13px] font-medium text-white transition-colors shadow-neu-flat">
                                View Evidence
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Assigned Asset (Phase 1) */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/40">Assigned Asset</h3>
                        <div className="bg-gradient-card border border-white/5 rounded-xl p-4 shadow-neu-flat">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[15px] font-semibold text-white">Drone 3</span>
                                <span className="text-[11px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 shadow-glow-blue">Airborne</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-black/20 rounded-lg p-2 border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Battery size={10} className="text-white/40" />
                                        <span className="text-[10px] text-white/40 font-bold uppercase">BAT</span>
                                    </div>
                                    <div className="text-[14px] font-semibold text-white">72%</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-2 border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Signal size={10} className="text-white/40" />
                                        <span className="text-[10px] text-white/40 font-bold uppercase">LINK</span>
                                    </div>
                                    <div className="text-[14px] font-semibold text-emerald-400">Good</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-2 border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Crosshair size={10} className="text-white/40" />
                                        <span className="text-[10px] text-white/40 font-bold uppercase">MODE</span>
                                    </div>
                                    <div className="text-[14px] font-semibold text-white">Locked</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auto Sync Footer */}
                    <div className="pt-2 pb-1">
                        <div className="flex items-center justify-center gap-2 text-[11px] text-white/30 font-medium select-none">
                            <RefreshCw size={10} />
                            Information is synced automatically
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER ACTIONS (Phase 1 Only) */}
            <div className="p-5 border-t border-white/5 bg-surface/50 backdrop-blur-md shrink-0 flex flex-col gap-3 relative z-20">
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDismissConfirm(true)}
                        className="flex-1 h-10 rounded-lg bg-gradient-card border border-white/10 text-[13px] font-medium text-white hover:bg-white/5 transition-colors flex items-center justify-center shadow-neu-flat"
                    >
                        Mark false alarm
                    </button>
                    <button
                        onClick={() => setShowDeploySheet(true)}
                        className="flex-1 h-10 rounded-lg bg-gradient-blue text-white text-[13px] font-bold hover:opacity-90 transition-colors shadow-glow-blue border border-blue-400/20 flex items-center justify-center"
                    >
                        Confirm threat
                    </button>
                </div>
            </div>

            {/* Phase 1 Modals */}
            {showDismissConfirm && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-[320px] shadow-2xl bg-gradient-surface">
                        <h3 className="text-[16px] font-semibold text-white mb-2">Mark false alarm?</h3>
                        <p className="text-[13px] text-white/60 mb-6">This will mark the incident as reviewed. You can access it later in the logs.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDismissConfirm(false)}
                                className="flex-1 h-9 rounded-lg border border-white/10 text-[13px] text-white/70 hover:bg-white/5 flex items-center justify-center shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setShowDismissConfirm(false); onClose(); }}
                                className="flex-1 h-9 rounded-lg bg-white text-app text-[13px] font-bold hover:bg-white/90 flex items-center justify-center shadow-lg"
                            >
                                Mark false alarm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeploySheet && (
                <div className="absolute inset-x-0 bottom-0 bg-surface border-t border-white/10 z-50 rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-300 bg-gradient-surface">
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[15px] font-semibold text-white">Confirm Threat</h3>
                            <button onClick={() => setShowDeploySheet(false)}><X size={16} className="text-white/40" /></button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <p className="text-[13px] text-white/70">Confirming this threat will trigger the Level 2 response protocol and notify local authorities.</p>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 shadow-inner">
                                <AlertTriangle className="text-red-400 shrink-0" size={16} />
                                <div className="text-[12px] text-red-200">Authorities will be dispatched to Site A Gate 2. Estimated arrival: 8 mins.</div>
                            </div>
                        </div>
                        <button
                            onClick={handleConfirmThreat}
                            className="w-full h-10 rounded-lg bg-gradient-red text-white text-[13px] font-bold hover:opacity-90 flex items-center justify-center shadow-glow-red border border-red-500/20"
                        >
                            Confirm and Dispatch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};