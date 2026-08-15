import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotificationItem {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: "info" | "warning" | "error" | "success";
    fecha: string;
    leido: boolean;
    detalles?: {
        piezas_reportadas?: number;
        piezas_buenas?: number;
        piezas_defectuosas?: number;
        maquina_codigo?: string;
        maquina_tipo?: string;
        orden_numero?: string;
        motivo?: string;
        action?: "created" | "updated" | "deleted";
    };
}

export interface ToastItem {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: "info" | "warning" | "error" | "success";
}

interface NotificationState {
    currentUserId: string | null;
    usersData?: Record<string, { notifications: NotificationItem[], processedSyncIds: string[] }>;
    notifications: NotificationItem[];
    processedSyncIds: string[];
    toasts: ToastItem[];
    selectedNotification: NotificationItem | null;
    actions: {
        syncUser: (userId: string) => void;
        addNotification: (
            titulo: string,
            mensaje: string,
            tipo: "info" | "warning" | "error" | "success",
            detalles?: NotificationItem["detalles"]
        ) => void;
        addToastOnly: (
            titulo: string,
            mensaje: string,
            tipo: "info" | "warning" | "error" | "success"
        ) => void;
        markAsRead: (id: string) => void;
        markAllAsRead: () => void;
        clearAll: () => void;
        removeToast: (id: string) => void;
        setSelectedNotification: (notif: NotificationItem | null) => void;
        syncPendingValidations: (pendientes: { id: string; operarioNombre: string; fechaReporte: string; piezasReportadas: number }[]) => void;
        syncOperatorAssignments: (assignments: { id: string; ordenNumero: string; fechaAsignacion: string }[]) => void;
    };
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            currentUserId: null,
            usersData: {},
            notifications: [],
            processedSyncIds: [],
            toasts: [],
            selectedNotification: null,
            actions: {
                syncUser: (userId) => {
                    set((state) => {
                        if (state.currentUserId !== userId) {
                            const newUsersData = { ...(state.usersData || {}) };
                            if (state.currentUserId) {
                                newUsersData[state.currentUserId] = {
                                    notifications: state.notifications,
                                    processedSyncIds: state.processedSyncIds
                                };
                            }
                            const nextUserData = newUsersData[userId] || {
                                notifications: [],
                                processedSyncIds: []
                            };
                            return {
                                currentUserId: userId,
                                usersData: newUsersData,
                                notifications: nextUserData.notifications,
                                processedSyncIds: nextUserData.processedSyncIds,
                            };
                        }
                        return state;
                    });
                },
                addNotification: (titulo, mensaje, tipo, detalles) => {
                    const id = Math.random().toString(36).substring(2, 9);
                    const now = new Date().toISOString();
                    const newNotif: NotificationItem = {
                        id,
                        titulo,
                        mensaje,
                        tipo,
                        fecha: now,
                        leido: false,
                        detalles
                    };
                    const newToast: ToastItem = {
                        id,
                        titulo,
                        mensaje,
                        tipo,
                    };
                    set((state) => ({
                        notifications: [newNotif, ...state.notifications].slice(0, 50), // Guardar las últimas 50
                        toasts: [...state.toasts, newToast],
                    }));
                },
                addToastOnly: (titulo, mensaje, tipo) => {
                    const id = Math.random().toString(36).substring(2, 9);
                    const newToast: ToastItem = {
                        id,
                        titulo,
                        mensaje,
                        tipo,
                    };
                    set((state) => ({
                        toasts: [...state.toasts, newToast],
                    }));
                },
                markAsRead: (id) => {
                    set((state) => ({
                        notifications: state.notifications.map((n) =>
                            n.id === id ? { ...n, leido: true } : n
                        ),
                    }));
                },
                markAllAsRead: () => {
                    set((state) => ({
                        notifications: state.notifications.map((n) => ({
                            ...n,
                            leido: true,
                        })),
                    }));
                },
                clearAll: () => {
                    set({ notifications: [] });
                },
                removeToast: (id) => {
                    set((state) => ({
                        toasts: state.toasts.filter((t) => t.id !== id),
                    }));
                },
                setSelectedNotification: (notif) => {
                    set({ selectedNotification: notif });
                },
                syncPendingValidations: (pendientes) => {
                    set((state) => {
                        const newNotifications = [...state.notifications];
                        let updated = false;
                        const newProcessed = new Set(state.processedSyncIds || []);

                        pendientes.forEach((p) => {
                            const syncId = `val_${p.id}`;
                            if (!newProcessed.has(syncId) && !newNotifications.some(n => n.id === syncId)) {
                                const newNotif: NotificationItem = {
                                    id: syncId,
                                    titulo: "Revisión Pendiente",
                                    mensaje: `El operario ${p.operarioNombre} ha reportado avance de producción. Pendiente de validación.`,
                                    tipo: "warning",
                                    fecha: p.fechaReporte,
                                    leido: false,
                                    detalles: {
                                        piezas_reportadas: p.piezasReportadas,
                                        action: "created"
                                    }
                                };
                                newNotifications.push(newNotif);
                                newProcessed.add(syncId);
                                updated = true;
                            } else if (!newProcessed.has(syncId)) {
                                // If it already exists in notifications but not in processed, just mark it processed
                                newProcessed.add(syncId);
                            }
                        });

                        const pendingIds = new Set(pendientes.map((p) => `val_${p.id}`));
                        const seenIds = new Set();
                        const cleanedNotifications = newNotifications.filter((n) => {
                            if (seenIds.has(n.id)) {
                                updated = true;
                                return false; // Eliminar duplicados exactos
                            }
                            seenIds.add(n.id);

                            if (n.titulo === "Revisión Pendiente" && n.tipo === "warning") {
                                // No eliminamos automáticamente las notificaciones de revisión pendiente
                                // para evitar que desaparezcan si la conexión parpadea o al recargar la página.
                                // if (!pendingIds.has(n.id)) {
                                //     updated = true;
                                //     return false;
                                // }
                            }
                            return true;
                        });

                        if (!updated) return state;

                        cleanedNotifications.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                        return {
                            notifications: cleanedNotifications.slice(0, 50),
                            processedSyncIds: Array.from(newProcessed).slice(-5000)
                        };
                    });
                },
                syncOperatorAssignments: (assignments) => {
                    set((state) => {
                        const newNotifications = [...state.notifications];
                        let updated = false;
                        const newProcessed = new Set(state.processedSyncIds || []);

                        assignments.forEach((a) => {
                            const syncId = `asig_created_${a.id}`;
                            if (!newProcessed.has(syncId) && !newNotifications.some(n => n.id === syncId)) {
                                const newNotif: NotificationItem = {
                                    id: syncId,
                                    titulo: "Nueva Tarea Asignada",
                                    mensaje: `El supervisor te ha asignado una nueva tarea de producción para la orden ${a.ordenNumero}.`,
                                    tipo: "warning",
                                    fecha: a.fechaAsignacion || new Date().toISOString(),
                                    leido: false,
                                    detalles: {
                                        action: "created"
                                    }
                                };
                                newNotifications.push(newNotif);
                                newProcessed.add(syncId);
                                updated = true;
                            } else if (!newProcessed.has(syncId)) {
                                newProcessed.add(syncId);
                            }
                        });

                        const activeIds = new Set(assignments.map((a) => `asig_created_${a.id}`));
                        
                        // Deduplicar notificaciones por ID para arreglar estados corruptos del localStorage
                        const seenIds = new Set();
                        const cleanedNotifications = newNotifications.filter((n) => {
                            if (seenIds.has(n.id)) {
                                updated = true;
                                return false; // Eliminar duplicados exactos
                            }
                            seenIds.add(n.id);

                            if (n.id.startsWith("asig_created_")) {
                                // No eliminamos automáticamente las tareas si no vienen en la consulta actual
                                // para evitar que desaparezcan al recargar la página (cuando asignaciones = [])
                                // if (!activeIds.has(n.id)) {
                                //     updated = true;
                                //     return false;
                                // }
                            }
                            return true;
                        });

                        if (!updated) return state;

                        cleanedNotifications.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                        return {
                            notifications: cleanedNotifications.slice(0, 50),
                            processedSyncIds: Array.from(newProcessed).slice(-5000)
                        };
                    });
                },
            },
        }),
        {
            name: "meme-fabrica-notifications",
            // Persistir notificaciones y el historial de IDs procesados
            partialize: (state) => {
                const currentData = state.currentUserId ? {
                    [state.currentUserId]: {
                        notifications: state.notifications,
                        processedSyncIds: state.processedSyncIds
                    }
                } : {};
                return { 
                    notifications: state.notifications,
                    processedSyncIds: state.processedSyncIds,
                    currentUserId: state.currentUserId,
                    usersData: { ...(state.usersData || {}), ...currentData }
                } as any;
            },
        }
    )
);

export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useToasts = () => useNotificationStore((state) => state.toasts);
export const useSelectedNotification = () => useNotificationStore((state) => state.selectedNotification);
export const useNotificationActions = () => useNotificationStore((state) => state.actions);
