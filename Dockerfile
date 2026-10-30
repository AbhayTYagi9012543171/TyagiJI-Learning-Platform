FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm","run","dev:server"]
