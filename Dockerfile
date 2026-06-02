FROM node:22 as build
WORKDIR /app
COPY . .
RUN npm config set registry https://nexus.hamkorbank.uz/repository/npm-proxy/ && \
    npm install --legacy-peer-deps --engine-strict=false
RUN npm run build:testing

FROM nginx:alpine
COPY --from=build /app/dist/credit-fabric-remote/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
