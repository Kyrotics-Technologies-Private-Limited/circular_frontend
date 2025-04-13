# --- Stage 1: Build React App ---
FROM node:18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the React app for production
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:stable-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Copy static build files from the build stage to Nginx's web root
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /var/run \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /etc/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Create the nginx.conf file
RUN cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf \
    && chown nginx:nginx /etc/nginx/nginx.conf

# Switch to non-root user for security
USER nginx

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
# CMD ["npm", "run", "dev"]