// features/auth/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '@/types';
import { authService } from '@/features/login/services/login.services';

interface AuthState {
    user: Usuario | null;
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    updateMyPassword: (newPass: string) => Promise<void>;
    registerUser: (data: Omit<Usuario, "id" | "ultimaConexion"> & { pass: string }) => Promise<boolean>;
    toggleUserStatus: (userId: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: async (email, pass) => {
                try {
                    const found = await authService.login(email, pass);
                    if (found) {
                        const { password, ...userWithoutPass } = found;
                        set({
                            user: userWithoutPass as Usuario,
                            isAuthenticated: true
                        });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error("Login error:", error);
                    return false;
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            updateMyPassword: async (newPass) => {
                const currentUser = get().user;
                if (!currentUser) return;

                try {
                    await authService.updatePassword(currentUser.id, newPass);
                    console.log("Contraseña actualizada exitosamente en el sistema");
                } catch (error) {
                    console.error("Error updating password:", error);
                    throw error;
                }
            },

            registerUser: async (data) => {
                try {
                    await authService.registerUser(data);
                    console.log("Nuevo usuario registrado en el sistema");
                    return true;
                } catch (error) {
                    console.error("Error al registrar usuario:", error);
                    return false;
                }
            },

            toggleUserStatus: async (userId) => {
                try {
                    const updatedUser = await authService.toggleUserStatus(userId);
                    const currentUser = get().user;
                    if (currentUser && currentUser.id === userId) {
                        set({ user: updatedUser });
                        if (updatedUser.estado === "inactivo") get().logout();
                    }

                    return true;
                } catch (error) {
                    console.error("Error al cambiar estado de usuario:", error);
                    return false;
                }
            }
        }),
        {
            name: 'meme-auth-storage'
        }
    )
);