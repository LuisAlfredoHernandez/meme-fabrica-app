import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refreshTokenAction } from "@/features/login/actions/auth.actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
    token?: string;
    skipAuth?: boolean;
}

async function request(path: string, options: RequestOptions = {}) {
    const { token: passedToken, skipAuth = false, headers: customHeaders, ...restOptions } = options;
    
    // 1. Obtener el token de acceso
    let token = passedToken;
    if (!token && !skipAuth) {
        try {
            const cookieStore = await cookies();
            token = cookieStore.get("access_token")?.value;
        } catch (e) {
            // Fuera de un contexto de request/Server Action (ej. compilación estática de páginas)
            console.warn("[apiClient] No se pudo leer cookies en este contexto:", e);
        }
    }

    const headers = new Headers(customHeaders);
    if (!headers.has("Content-Type") && !(restOptions.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const url = path.startsWith("http") ? path : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

    let response = await fetch(url, {
        ...restOptions,
        headers,
        cache: "no-store",
    });

    // 2. Si responde 401 y no es skipAuth, intentar refrescar
    if (response.status === 401 && !skipAuth) {
        console.log(`[apiClient] Petición a ${url} falló con 401. Intentando refrescar token...`);
        let refreshSuccess = false;
        let isNetworkOrServerError = false;
        
        try {
            const refreshResult = await refreshTokenAction();
            if (refreshResult.success && refreshResult.token) {
                console.log("[apiClient] Token refrescado exitosamente. Reintentando petición...");
                headers.set("Authorization", `Bearer ${refreshResult.token}`);
                response = await fetch(url, {
                    ...restOptions,
                    headers,
                    cache: "no-store",
                });
                refreshSuccess = true;
            } else {
                console.error("[apiClient] Falló el refresco del token:", refreshResult.error);
                if (refreshResult.isNetworkError || refreshResult.isAuthError === false) {
                    isNetworkOrServerError = true;
                }
            }
        } catch (refreshError) {
            console.error("[apiClient] Excepción grave al refrescar token:", refreshError);
            isNetworkOrServerError = true;
        }

        if (!refreshSuccess) {
            if (isNetworkOrServerError) {
                console.warn("[apiClient] Fallo de red o servidor al intentar refrescar. Abortando sin cerrar sesión.");
                // Lanzamos el error hacia la UI para que muestre un mensaje de reintento/offline
                throw new Error("NETWORK_OR_SERVER_ERROR_DURING_REFRESH");
            } else {
                console.log("[apiClient] Redirigiendo a /login tras fallo definitivo de autenticación (Token expirado/inválido).");
                redirect("/login");
            }
        }
    }

    return response;
}

export const apiClient = {
    async get(path: string, options: RequestOptions = {}) {
        return request(path, { ...options, method: "GET" });
    },
    async post(path: string, body: any, options: RequestOptions = {}) {
        const isFormData = body instanceof FormData;
        const isString = typeof body === "string";
        
        let reqBody = body;
        if (body !== undefined && !isFormData && !isString) {
            reqBody = JSON.stringify(body);
        }
        
        return request(path, {
            ...options,
            method: "POST",
            body: reqBody,
        });
    },
    async put(path: string, body: any, options: RequestOptions = {}) {
        const isFormData = body instanceof FormData;
        const isString = typeof body === "string";

        let reqBody = body;
        if (body !== undefined && !isFormData && !isString) {
            reqBody = JSON.stringify(body);
        }

        return request(path, {
            ...options,
            method: "PUT",
            body: reqBody,
        });
    },
    async patch(path: string, body: any, options: RequestOptions = {}) {
        const isFormData = body instanceof FormData;
        const isString = typeof body === "string";

        let reqBody = body;
        if (body !== undefined && !isFormData && !isString) {
            reqBody = JSON.stringify(body);
        }

        return request(path, {
            ...options,
            method: "PATCH",
            body: reqBody,
        });
    },
    async delete(path: string, options: RequestOptions = {}) {
        return request(path, { ...options, method: "DELETE" });
    },
};
