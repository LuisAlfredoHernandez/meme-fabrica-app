"use server"; // Indica que esto solo corre en el servidor
import { cookies } from "next/headers";
import { authService } from "@/features/login/services/login.services";
import { Usuario, LoginResponse } from '@/types';

export async function loginAction(email: string, pass: string) {
    try {
        const { token, refreshToken, user, requiresPasswordChange } = await authService.login(email, pass);

        if (user) {
            const cookieStore = await cookies();

            // Seteamos la cookie de forma segura
            cookieStore.set("meme_session", "active", {
                httpOnly: true, // 🔒 No accesible por JS (js-cookie no puede verla)
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24, // 1 día
            });
            
            cookieStore.set("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24, // 1 día
            });

            if (refreshToken) {
                cookieStore.set("refresh_token", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 7, // 7 días
                });
            }

            cookieStore.set("user_role", user.rol, { httpOnly: true });

            return { success: true, user, requiresPasswordChange };
        }
    } catch (error) {
        return { success: false, error: error };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("meme_session");
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("user_role");
    return { success: true };
}

export async function refreshTokenAction() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (!refreshToken) {
            throw new Error("No refresh token found");
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            // Solo borramos la sesión si el refresh token fue explícitamente rechazado
            if (response.status === 401 || response.status === 403) {
                cookieStore.delete("meme_session");
                cookieStore.delete("access_token");
                cookieStore.delete("refresh_token");
                cookieStore.delete("user_role");
                return { success: false, error: "Session expired", isAuthError: true };
            }
            
            // Si es un error 500 u otro, no expulsamos al usuario
            return { success: false, error: `Server error: ${response.status}`, isAuthError: false };
        }

        const data: LoginResponse = await response.json();

        cookieStore.set("access_token", data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
        });

        if (data.refresh_token) {
            cookieStore.set("refresh_token", data.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
            });
        }

        return { success: true, token: data.access_token };
    } catch (error) {
        console.error("Error in refreshTokenAction:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Error refreshing token",
            isNetworkError: true // Indicamos que falló la conexión (offline/cors/etc)
        };
    }
}

export async function registerUserAction(data: Omit<Usuario, "id">) {
    try {
        const newUser = await authService.registerUser(data);
        return { success: true, user: newUser };
    } catch (e) { return { success: false, error: e }; }
}

export async function toggleUserStatusAction(userId: string) {
    try {
        const updated = await authService.toggleUserStatus(userId);
        return { success: true, user: updated };
    } catch (e) { return { success: false, error: e }; }
}

export async function updatePasswordAction(userId: string, newPass: string) {
    try {
        console.log(`[Server] Procesando cambio de clave para: ${userId}`);
        const success = await authService.updatePassword(userId, newPass);

        return {
            success: success,
            message: success ? "Contraseña actualizada" : "No se pudo actualizar"
        };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Error de servidor"
        };
    }
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return { success: false, error: "No autenticado" };
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });

        return {
            success: response.ok,
            message: response.ok ? "Contraseña actualizada" : "No se pudo actualizar"
        };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Error de servidor"
        };
    }
}