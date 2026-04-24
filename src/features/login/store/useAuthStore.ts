// features/auth/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '@/types';
import { loginAction, logoutAction, registerUserAction, toggleUserStatusAction, updatePasswordAction } from '@/features/login/actions/auth.actions';

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
                const result = await loginAction(email, pass);
                if (result?.success) {
                    set({
                        user: result.user as Usuario,
                        isAuthenticated: true
                    });
                    return true;
                }
                return false;
            },

            logout: async () => {
                await logoutAction(); // Borra cookies en el servidor
                set({ user: null, isAuthenticated: false });
            },

            updateMyPassword: async (newPass) => {
                const currentUser = get().user;
                if (!currentUser) return;

                try {
                    // Ahora llamamos al Action, no al servicio directamente
                    const result = await updatePasswordAction(currentUser.id, newPass);

                    if (result.success) {
                        console.log("✅ Contraseña actualizada exitosamente");
                    } else {
                        console.error("❌ fallo al actualizar:", result.error);
                    }
                } catch (error) {
                    console.error("Error crítico en updateMyPassword:", error);
                }
            },

            registerUser: async (data) => {
                const result = await registerUserAction(data);
                return result.success;
            },

            toggleUserStatus: async (userId) => {
                const result = await toggleUserStatusAction(userId);
                if (result.success) {
                    const currentUser = get().user;
                    // Si el admin se desactiva a sí mismo
                    if (currentUser?.id === userId) {
                        if (result.user?.estado === "inactivo") {
                            get().logout();
                        } else {
                            set({ user: result.user });
                        }
                    }
                    return true;
                }
                return false;
            }
        }),
        {
            name: 'meme-auth-storage'
        }
    )
);