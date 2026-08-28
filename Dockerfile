# Imagen ligera de Node.js
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del codigo
COPY . .

# Puerto expuesto para Node
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]