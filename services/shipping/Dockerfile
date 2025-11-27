# Usar Node.js LTS
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache openssl postgresql-client bash curl

# Directorio de trabajo
WORKDIR /app

# Configurar npm para mejor conectividad
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000

# Copiar archivos de dependencias primero (para cache de Docker)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias con reintentos
RUN npm install --only=production --no-audit --no-fund --network-timeout=300000 || \
    (sleep 10 && npm install --only=production --no-audit --no-fund --network-timeout=300000) || \
    (sleep 20 && npm install --production --no-audit --no-fund --network-timeout=300000)

# Generar cliente de Prisma durante el build
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Dar permisos al entrypoint (ya copiado con COPY . .)
RUN chmod +x /app/docker-entrypoint.sh

# Exponer puerto
EXPOSE 8080

# Configurar entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
