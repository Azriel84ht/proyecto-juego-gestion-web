# ---- Etapa 1: Build ----
# Usa una imagen de Node para instalar dependencias y compilar la aplicación React
FROM node:20-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de manifiesto y de bloqueo de paquetes
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código fuente de la aplicación
COPY . .

# Ejecuta el script de build para generar los archivos estáticos
RUN npm run build

# ---- Etapa 2: Production ----
# Usa una imagen ligera de Nginx para servir el contenido estático
FROM nginx:stable-alpine AS production

# Copia los archivos estáticos compilados desde la etapa de build al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia el archivo de configuración personalizado de Nginx
# Este archivo es crucial para que el enrutamiento de la SPA funcione correctamente
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80 para permitir el tráfico entrante
EXPOSE 80

# Comando para iniciar el servidor Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]