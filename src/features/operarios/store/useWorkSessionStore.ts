import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TaskInterval {
    start: string;
    end?: string;
}

export interface TaskSession {
    asignacionId: string;
    status: "in_progress" | "paused";
    intervals: TaskInterval[];
    accumulatedSeconds: number;
}

interface WorkSessionState {
    sessions: Record<string, TaskSession>;
    activeTaskId: string | null;
    
    // Actions
    startTask: (asignacionId: string) => void;
    pauseTask: (asignacionId: string) => void;
    clearSession: (asignacionId: string) => void;
}

export const useWorkSessionStore = create<WorkSessionState>()(
    persist(
        (set, get) => ({
            sessions: {},
            activeTaskId: null,

            startTask: (asignacionId: string) => {
                const now = new Date().toISOString();
                const state = get();
                
                // If there's another active task, pause it first
                const newSessions = { ...state.sessions };
                if (state.activeTaskId && state.activeTaskId !== asignacionId) {
                    const prevSession = newSessions[state.activeTaskId];
                    if (prevSession && prevSession.status === "in_progress") {
                        const lastInterval = prevSession.intervals[prevSession.intervals.length - 1];
                        if (lastInterval && !lastInterval.end) {
                            lastInterval.end = now;
                            const diff = Math.floor((new Date(now).getTime() - new Date(lastInterval.start).getTime()) / 1000);
                            prevSession.accumulatedSeconds += diff;
                        }
                        prevSession.status = "paused";
                    }
                }

                // Initialize or resume the selected task
                let currentSession = newSessions[asignacionId];
                if (!currentSession) {
                    currentSession = {
                        asignacionId,
                        status: "in_progress",
                        intervals: [],
                        accumulatedSeconds: 0
                    };
                    newSessions[asignacionId] = currentSession;
                }

                if (currentSession.status !== "in_progress") {
                    currentSession.status = "in_progress";
                    currentSession.intervals.push({ start: now });
                }

                set({
                    sessions: newSessions,
                    activeTaskId: asignacionId
                });
            },

            pauseTask: (asignacionId: string) => {
                const now = new Date().toISOString();
                const state = get();
                const newSessions = { ...state.sessions };
                const currentSession = newSessions[asignacionId];

                if (currentSession && currentSession.status === "in_progress") {
                    const lastInterval = currentSession.intervals[currentSession.intervals.length - 1];
                    if (lastInterval && !lastInterval.end) {
                        lastInterval.end = now;
                        const diff = Math.floor((new Date(now).getTime() - new Date(lastInterval.start).getTime()) / 1000);
                        currentSession.accumulatedSeconds += diff;
                    }
                    currentSession.status = "paused";
                }

                set({
                    sessions: newSessions,
                    activeTaskId: state.activeTaskId === asignacionId ? null : state.activeTaskId
                });
            },

            clearSession: (asignacionId: string) => {
                set((state) => {
                    const newSessions = { ...state.sessions };
                    delete newSessions[asignacionId];
                    return {
                        sessions: newSessions,
                        activeTaskId: state.activeTaskId === asignacionId ? null : state.activeTaskId
                    };
                });
            }
        }),
        {
            name: "work-session-storage",
        }
    )
);

export const useWorkSessionActions = () => {
    const startTask = useWorkSessionStore((state) => state.startTask);
    const pauseTask = useWorkSessionStore((state) => state.pauseTask);
    const clearSession = useWorkSessionStore((state) => state.clearSession);
    return { startTask, pauseTask, clearSession };
};
