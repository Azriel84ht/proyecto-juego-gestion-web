# Usa una imagen base oficial de Node.js 20
FROM node:20-slim

# Establece el directorio de trabajo raíz dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de definición de paquetes para instalar dependencias primero
# Esto aprovecha el caché de capas de Docker
COPY ./apps/auth-service/package*.json ./apps/auth-service/

# Navega al directorio del servicio e instala las dependencias
WORKDIR /usr/src/app/apps/auth-service
RUN npm install

# Vuelve al directorio de trabajo raíz de la app
WORKDIR /usr/src/app

# Copia el resto del código fuente del proyecto
COPY . .

# Expone el puerto en el que corre la aplicación
EXPOSE ${AUTH_SERVICE_PORT}

# APLICA LOS PERMISOS AL FINAL, DESPUÉS DE COPIAR TODO
RUN chmod +x apps/auth-service/node_modules/.bin/nodemon

# Comando para ejecutar la aplicación (será sobreescrito por docker-compose en desarrollo)
CMD [ "node", "apps/auth-service/src/server.js" ]