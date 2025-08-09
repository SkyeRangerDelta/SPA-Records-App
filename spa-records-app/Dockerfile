# Stage 1: Build the Angular app
FROM node:24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build -- --output-path=dist

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
ENV HOST=0.0.0.0
ENV PORT=80
COPY --from=build /app/dist /usr/share/nginx/html
COPY public/favicon.ico /usr/share/nginx/html/favicon.ico
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE ${PORT}
CMD ["sh", "-c", "nginx -g 'daemon off;'"]

