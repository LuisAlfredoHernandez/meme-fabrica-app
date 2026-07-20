// ─────────────────────────────────────────────────────────────
// features/auth/services/auth.service.ts
// ─────────────────────────────────────────────────────────────
import { Usuario, Operario, LoginResponse } from "@/types";

/**
 * Base de datos simulada de credenciales.
 * Las contraseñas están en texto plano para fines del prototipo/tesis.
 */
const MOCK_CREDENTIALS: Usuario[] = [
    {
        id: "u1",
        correo: "admin@meme.com",
        password: "12345678",
        nombre: "Juan",
        apellido: "Perez",
        rol: "administrador",
        estado: "activo"
    },
    {
        id: "u2",
        correo: "jefe@meme.com",
        password: "12345678",
        nombre: "Carmen",
        apellido: "Méndez",
        rol: "subjefe",
        estado: "activo"
    },
    {
        id: "u3",
        correo: "operario1@meme.com",
        password: "123",
        nombre: "Ramon",
        apellido: "Perez",
        rol: "operario",
        estado: "activo"
    },
];

const API_LATENCY = 500;

export const authService = {
    login: async (email: string, pass: string): Promise<{ token: string; user: Usuario | Operario }> => {
        console.log(`Intentando login para: ${email}...`);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", pass);

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = "Credenciales inválidas.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (e) {
                }
                console.log(errorMessage)
                throw new Error(errorMessage);
            }

            const data: LoginResponse = await response.json();
            console.log(`Login exitoso, token recibido.`);

            // Obtener el usuario actual con el token recibido
            const user = await authService.getCurrentUser(data.access_token);

            return { token: data.access_token, user };
        } catch (error: any) {
            console.error("Error en login:", error);
            throw new Error(error.message || "Error al conectar con el servidor.");
        }
    },
    getCurrentUser: async (token: string): Promise<Usuario | Operario> => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${API_URL}/usuarios/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                let errorMessage = "No se pudo obtener la información del usuario.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (e) {
                }
                throw new Error(errorMessage);
            }

            const user: Usuario | Operario = await response.json();
            if (user && user.rol === ("supervisor" as any)) {
                user.rol = "subjefe";
            }
            return user;
        } catch (error: any) {
            console.error("Error en getCurrentUser:", error);
            throw new Error(error.message || "Error al conectar con el servidor.");
        }
    },

    /**
     * Permite a un usuario cambiar su propia contraseña.
     */
    updatePassword: (userId: string, newPass: string): Promise<boolean> => {
        console.log(`Actualizando contraseña para el usuario ID: ${userId}...`);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_CREDENTIALS.findIndex(u => u.id === userId);
                if (index === -1) {
                    reject(new Error("Usuario no encontrado."));
                    return;
                }

                MOCK_CREDENTIALS[index].correo = newPass;
                console.log("Contraseña actualizada correctamente.");
                resolve(true);
            }, API_LATENCY);
        });
    },

    /**
     * Permite al Admin cambiar el estado de acceso de otros usuarios.
     */
    toggleUserStatus: (userId: string): Promise<Usuario> => {
        console.log(`Cambiando estado del usuario: ${userId}...`);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_CREDENTIALS.findIndex(u => u.id === userId);
                if (index === -1) {
                    reject(new Error("Usuario no encontrado."));
                    return;
                }

                const currentStatus = MOCK_CREDENTIALS[index].estado;
                MOCK_CREDENTIALS[index].estado = currentStatus === "activo" ? "inactivo" : "activo";

                const { password: _, ...safeUser } = MOCK_CREDENTIALS[index];
                resolve(safeUser);
            }, API_LATENCY);
        });
    },

    /**
     * Crea una nueva cuenta de acceso.
     */
    registerUser: (data: Omit<Usuario, "id"> & { pass: string }): Promise<Usuario> => {
        console.log("Registrando nuevo acceso al sistema...", data.correo);

        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser: Usuario = {
                    ...data,
                    id: `u${Math.random().toString(36).substr(2, 5)}`
                };

                MOCK_CREDENTIALS.push(newUser);

                const { password: _, ...safeUser } = newUser;
                resolve(safeUser);
            }, API_LATENCY);
        });
    }
};