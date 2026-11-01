<<<<<<< HEAD
FROM node:22-alpine
=======
# Build the React client and run the Express API as a single production service.
FROM node:22-alpine AS build
>>>>>>> backup-local-files
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
<<<<<<< HEAD
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm","run","dev:server"]
=======
RUN npm ci
COPY . .
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci --omit=dev
COPY server ./server
COPY --from=build /app/client/dist ./client/dist
EXPOSE 5000
CMD ["npm", "run", "start:prod"]
>>>>>>> backup-local-files
