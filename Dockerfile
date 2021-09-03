FROM node:alpine as builder
WORKDIR '/app'
COPY ./package.json ./
ENV REACT_APP_WEB_SOCKET_URL="ws:https://webst-back.herokuapp.com:8000"
RUN npm install
COPY . .
RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
