// ─────────────────────────────────────────────────────────────
// features/auth/services/auth.service.ts
// ─────────────────────────────────────────────────────────────
import { Usuario } from "@/types";

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
        rol: "admin",
        estado: "activo",
        ultimaConexion: "Ahora mismo"
    },
    {
        id: "u2",
        correo: "jefe@meme.com",
        password: "12345678",
        nombre: "Carmen",
        apellido: "Méndez",
        rol: "subjefe",
        estado: "activo",
        ultimaConexion: "Hace 2 horas"
    },
    {
        id: "u3",
        correo: "operario1@meme.com",
        password: "123",
        nombre: "Ramon",
        apellido: "Perez",
        rol: "operario",
        estado: "activo",
        ultimaConexion: "Hace 1 horas"
    },
];

const API_LATENCY = 500;

export const authService = {
    login: async (email: string, pass: string): Promise<Usuario> => {
        console.log(`Intentando login para: ${email}...`);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", pass);

            console.log("API_URL =", API_URL);
            console.log("URL =", `${API_URL}/login`);

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

            const user: Usuario = await response.json();

            if (user.estado === "inactivo") {
                throw new Error("Esta cuenta ha sido desactivada por el administrador.");
            }

            console.log(`Login exitoso: ${user.nombre || user.correo} (${user.rol || 'N/A'})`);
            return user;
        } catch (error: any) {
            console.error("Error en login:", error);
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
    registerUser: (data: Omit<Usuario, "id" | "ultimaConexion"> & { pass: string }): Promise<Usuario> => {
        console.log("Registrando nuevo acceso al sistema...", data.correo);

        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser: Usuario = {
                    ...data,
                    id: `u${Math.random().toString(36).substr(2, 5)}`,
                    ultimaConexion: "Nunca"
                };

                MOCK_CREDENTIALS.push(newUser);

                const { password: _, ...safeUser } = newUser;
                resolve(safeUser);
            }, API_LATENCY);
        });
    }
};