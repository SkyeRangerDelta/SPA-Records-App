# Stage 1: Build the Angular app
FROM node:20 AS build
WORKDIR /app
COPY spa-records-app/package.json spa-records-app/package-lock.json ./spa-records-app/
WORKDIR /app/spa-records-app
RUN npm ci
COPY spa-records-app/ ./
RUN npm run build -- --output-path=dist

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/spa-records-app/dist/browser /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]