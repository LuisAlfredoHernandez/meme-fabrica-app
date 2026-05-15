# === Etapa de Construcción (Builder) ===
FROM node:22-alpine AS builder
# 1. FIX: Instalar libc6-compat para que Next.js (SWC) funcione en Alpine
# y pnpm en una sola capa para optimizar
RUN apk add --no-cache libc6-compat && npm install -g pnpm@11.1.2

WORKDIR /app

# Copiar los archivos de definición de dependencias primero para aprovechar la caché
# ¡AQUÍ ESTÁ EL DETALLE! Faltaba copiar pnpm-workspace.yaml, que define los permisos de build.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. FIX: Evita el error de TTY en pnpm v11 indicando entorno automatizado
ENV CI=true

# 3. CRÍTICO: Instalación limpia de dependencias (¡Aquí estaba el truco faltante!)
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente (se hace DESPUÉS de instalar para no romper la caché de Docker)
COPY . .

# Construir la aplicación para producción (usa output: "standalone" en next.config.ts)
RUN pnpm build

# === Etapa de Producción (Runner) ===
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Creamos un usuario de sistema para no correr como root (Seguridad)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo lo estrictamente necesario del builder
# (El modo standalone copia node_modules esenciales automáticamente)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# En modo standalone, Next genera un servidor de entrada en server.js
CMD ["node", "server.js"]