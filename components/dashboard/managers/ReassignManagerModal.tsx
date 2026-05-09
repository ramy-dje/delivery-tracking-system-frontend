"use client";

import { useEffect, useState } from "react";
import { assignManagerToNode, getCompanyBranches } from "@/services/ManagerService";
import { IAssignManagerRequest } from "@/types/manager";
import { IBranchResponse } from "@/types/branch";
import LogisticsNodePicker from "@/components/commons/LogisticsNodePicker";

interface ReassignManagerModalProps {
    managerId: string;
    managerName: string;
    currentNodeId?: string | null;
    currentNodeName?: string | null;
    companyId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    loading?: boolean;
}

export default function ReassignManagerModal({
    managerId,
    managerName,
    currentNodeId,
    currentNodeName,
    companyId,
    isOpen,
    onClose,
    onSuccess,
    loading: isSubmitting,
}: ReassignManagerModalProps) {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(currentNodeId ?? null);
    const [nodes, setNodes] = useState<IBranchResponse[]>([]);
    const [loadingNodes, setLoadingNodes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

    useEffect(() => {
        if (!isOpen || !companyId) return;

        let mounted = true;
        (async () => {
            setLoadingNodes(true);
            setError(null);
            try {
                const data = await getCompanyBranches(companyId);
                if (mounted) setNodes(data ?? []);
            } catch (e: any) {
                if (mounted) {
                    setError(e?.message ?? "Failed to load logistics nodes");
                }
            } finally {
                if (mounted) setLoadingNodes(false);
            }
        })();

        return () => { mounted = false; };
    }, [isOpen, companyId]);

    const handleSubmit = async () => {
        if (!selectedNodeId) {
            setError("Please select a logistics node");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const payload: IAssignManagerRequest = {
                logisticsNodeId: selectedNodeId,
            };
            await assignManagerToNode(companyId, managerId, payload);
            onSuccess();
        } catch (e: any) {
            const serverMsg = e?.response?.data?.message ||
                (e?.response?.data?.errors && Array.isArray(e.response.data.errors)
                    ? e.response.data.errors.join("; ")
                    : undefined);
            setError(serverMsg ?? e?.message ?? "Failed to reassign manager");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-lg rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "rgba(251,191,36,0.1)",
                                border: "1px solid rgba(251,191,36,0.2)",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M7 16a5 5 0 016-9m6 6a5 5 0 01-6 9"
                                    stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                />
                                <path
                                    d="M7 16H3v4m14-4h4v4"
                                    stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Reassign Manager</div>
                            <div className="text-[11px] text-slate-600">
                                Move {managerName} to a different node
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all disabled:opacity-50"
                        disabled={submitting || isSubmitting}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">
                    {/* Current Assignment */}
                    {currentNodeName && (
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[13px]"
                            style={{
                                background: "rgba(34,211,238,0.06)",
                                border: "1px solid rgba(34,211,238,0.15)",
                                color: "#22d3ee",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>
                                Currently assigned to <span className="font-semibold">{currentNodeName}</span>
                            </span>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-[13px]"
                            style={{
                                background: "rgba(239,68,68,0.06)",
                                border: "1px solid rgba(239,68,68,0.15)",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Node Picker */}
                    <div>
                        <LogisticsNodePicker
                            value={selectedNodeId}
                            onChange={setSelectedNodeId}
                            label="Select New Node"
                            required
                            placeholder="Choose a logistics node to assign to"
                            loading={loadingNodes}
                        />
                        <p className="text-[10.5px] text-slate-700 mt-1.5 ml-0.5">
                            Select where to reassign this manager. A manager can only be assigned to one node.
                        </p>
                    </div>

                    {/* Preview */}
                    {selectedNode && (
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-lg"
                            style={{
                                background: "rgba(251,191,36,0.06)",
                                border: "1px solid rgba(251,191,36,0.15)",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-amber-400 shrink-0">
                                <path
                                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                                />
                            </svg>
                            <span className="text-[12px] text-slate-400">
                                Will reassign to <span className="font-semibold text-amber-300">{selectedNode.name}</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-t"
                    style={{
                        borderColor: "rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.01)",
                    }}
                >
                    <div className="text-[11px] text-slate-600">
                        Reassigning <span className="font-semibold text-slate-400">{managerName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting || isSubmitting}
                            className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selectedNodeId || submitting || isSubmitting || loadingNodes}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                            }}
                        >
                            {submitting || isSubmitting ? (
                                <>
                                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                                    </svg>
                                    Reassigning…
                                </>
                            ) : (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                    Reassign
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
