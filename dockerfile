# ============================
# 1) Etapa de build
# ============================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json y lock
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código
COPY . .

# Build de producción
RUN npm run build

# ============================
# 2) Etapa de servidor Nginx
# ============================
FROM nginx:alpine

# Copiar archivo de configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build generado por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto que Cloud Run asigna
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
