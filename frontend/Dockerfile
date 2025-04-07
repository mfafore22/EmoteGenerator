# frontend/Dockerfile

#Some implementation ideas provided below, but feel free to use your own.

#FROM nginx:alpine

#COPY . /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf

FROM node:18 AS build
WORKDIR /App
COPY package.json .
RUN npm install
COPY . . 
RUN npm run build

FROM nginx:alpine
COPY --from=build /App/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]