# apps/auth-service/Dockerfile

# Etapa 1: Instalar dependencias
FROM node:20-slim AS base
WORKDIR /usr/src/app

# Copia solo los archivos de dependencias y las instala
# Esto aprovecha el caché de Docker. No se reinstalará todo si solo cambias el código.
COPY package*.json ./
RUN npm install

# Etapa 2: Preparar la aplicación
FROM node:20-slim
WORKDIR /usr/src/app

# Copia las dependencias instaladas de la etapa anterior
COPY --from=base /usr/src/app/node_modules ./node_modules
# Copia el código de la aplicación
COPY . .

EXPOSE ${AUTH_SERVICE_PORT}
CMD [ "npm", "run", "dev" ]