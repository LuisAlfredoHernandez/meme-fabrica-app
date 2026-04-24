// ─────────────────────────────────────────────────────────────
// features/auth/services/auth.service.ts
// ─────────────────────────────────────────────────────────────
import { Usuario, RolUsuario } from "@/types";

/**
 * Base de datos simulada de credenciales.
 * Las contraseñas están en texto plano para fines del prototipo/tesis.
 */
const MOCK_CREDENTIALS: Usuario[] = [
    {
        id: "u1",
        correo: "admin@meme.com",
        password: "123",
        nombre: "Luis",
        apellido: "Hernández",
        rol: "admin",
        estado: "activo",
        ultimaConexion: "Ahora mismo"
    },
    {
        id: "u2",
        correo: "jefe@meme.com",
        password: "123",
        nombre: "Carmen",
        apellido: "Méndez",
        rol: "subjefe",
        estado: "activo",
        ultimaConexion: "Hace 2 horas"
    },
];

const API_LATENCY = 500;

export const authService = {
    /**
     * Valida las credenciales contra el mock.
     * @returns El objeto Usuario (sin contraseña) o lanza un error.
     */
    login: (email: string, pass: string): Promise<Usuario> => {
        console.log(`Intentando login para: ${email}...`);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = MOCK_CREDENTIALS.find(u => u.correo === email && u.password === pass);

                if (!user) {
                    reject(new Error("Credenciales inválidas."));
                    return;
                }

                if (user.estado === "inactivo") {
                    reject(new Error("Esta cuenta ha sido desactivada por el administrador."));
                    return;
                }

                // Devolvemos el usuario sin la propiedad 'pass' por seguridad
                console.log(`Login exitoso: ${user.nombre} (${user.rol})`);
                resolve(user);
            }, API_LATENCY);
        });
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
                const newUser: UsuarioMock = {
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