# === Etapa de Construcción (Builder) ===
# Usamos una imagen base de Node.js con Alpine para mantenerla ligera.
FROM node:20-alpine AS builder

# Instalar pnpm globalmente en la imagen.
RUN npm install -g pnpm

# Establecer el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiar los archivos de definición de dependencias.
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias (incluidas las de desarrollo).
RUN pnpm install

# Copiar el resto del código fuente de la aplicación.
COPY . .

# Construir la aplicación para producción.
RUN pnpm build

# === Etapa de Producción (Runner) ===
# Empezamos desde una imagen fresca para mantenerla limpia y pequeña.
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar las dependencias de producción y los artefactos de la build.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Instalar solo las dependencias de producción.
RUN npm install -g pnpm && pnpm install --prod

# Exponer el puerto en el que se ejecutará la aplicación.
EXPOSE 3000

# Comando para iniciar la aplicación en modo producción.
CMD ["pnpm", "start"]