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
    notifications: NotificationItem[];
    toasts: ToastItem[];
    selectedNotification: NotificationItem | null;
    actions: {
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
            notifications: [],
            toasts: [],
            selectedNotification: null,
            actions: {
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

                        pendientes.forEach((p) => {
                            if (!newNotifications.some((n) => n.id === p.id)) {
                                const newNotif: NotificationItem = {
                                    id: p.id,
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
                                updated = true;
                            }
                        });

                        const pendingIds = new Set(pendientes.map((p) => p.id));
                        const cleanedNotifications = newNotifications.filter((n) => {
                            if (n.titulo === "Revisión Pendiente" && n.tipo === "warning") {
                                if (!pendingIds.has(n.id)) {
                                    updated = true;
                                    return false;
                                }
                            }
                            return true;
                        });

                        if (!updated) return state;

                        cleanedNotifications.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                        return {
                            notifications: cleanedNotifications.slice(0, 50),
                        };
                    });
                },
                syncOperatorAssignments: (assignments) => {
                    set((state) => {
                        const newNotifications = [...state.notifications];
                        let updated = false;

                        assignments.forEach((a) => {
                            const notificationId = `asig_created_${a.id}`;
                            if (!newNotifications.some((n) => n.id === notificationId)) {
                                const newNotif: NotificationItem = {
                                    id: notificationId,
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
                                updated = true;
                            }
                        });

                        const activeIds = new Set(assignments.map((a) => `asig_created_${a.id}`));
                        const cleanedNotifications = newNotifications.filter((n) => {
                            if (n.id.startsWith("asig_created_")) {
                                if (!activeIds.has(n.id)) {
                                    updated = true;
                                    return false;
                                }
                            }
                            return true;
                        });

                        if (!updated) return state;

                        cleanedNotifications.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                        return {
                            notifications: cleanedNotifications.slice(0, 50),
                        };
                    });
                },
            },
        }),
        {
            name: "meme-fabrica-notifications",
            // Solo persistir la lista de notificaciones persistentes, no los toasts temporales
            partialize: (state) => ({ notifications: state.notifications } as any),
        }
    )
);

export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useToasts = () => useNotificationStore((state) => state.toasts);
export const useSelectedNotification = () => useNotificationStore((state) => state.selectedNotification);
export const useNotificationActions = () => useNotificationStore((state) => state.actions);
