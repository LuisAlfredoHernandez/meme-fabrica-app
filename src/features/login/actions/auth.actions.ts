"use server"; // Indica que esto solo corre en el servidor
import { cookies } from "next/headers";
import { authService } from "@/features/login/services/login.services";
import { Usuario } from '@/types';

export async function loginAction(email: string, pass: string) {
    try {
        const user = await authService.login(email, pass);

        if (user) {
            const cookieStore = await cookies();

            // Seteamos la cookie de forma segura
            cookieStore.set("meme_session", "active", {
                httpOnly: true, // 🔒 No accesible por JS (js-cookie no puede verla)
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24, // 1 día
            });

            cookieStore.set("user_role", user.rol, { httpOnly: true });

            return { success: true, user };
        }
    } catch (error) {
        return { success: false, error: error };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("meme_session");
    cookieStore.delete("user_role");
    return { success: true };
}

export async function registerUserAction(data: Omit<Usuario, "id"> & { pass: string }) {
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