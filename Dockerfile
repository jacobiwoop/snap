# Stage 1: Build the React application
FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json from the root
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
