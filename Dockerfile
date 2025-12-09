FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app

# copy package files first for caching
COPY package.json package-lock.json* ./
COPY . .

# install deps (dev deps needed for build)
RUN npm install

# build both client (vite) and server (esbuild) as defined in root package.json
RUN npm run build


FROM node:20-alpine AS server
WORKDIR /app
ENV NODE_ENV=production

# copy built server bundle and production node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000
CMD ["node", "dist/index.js"]


FROM nginx:stable-alpine AS web
# Serve the built frontend
COPY --from=builder /app/dist/public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
