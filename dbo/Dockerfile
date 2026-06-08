#stage 1
FROM node:20 as node

ARG http_proxy
ARG https_proxy

ENV http_proxy=${http_proxy}
ENV https_proxy=${https_proxy}

WORKDIR /app
ADD package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

#stage 2
FROM nginx:alpine as nginx

ARG http_proxy
ARG https_proxy

ENV http_proxy=${http_proxy}
ENV https_proxy=${https_proxy}

COPY --from=node /app/dist/corp-hamkor/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
