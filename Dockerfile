FROM node:10-alpine as nodebuild

# copy the package.json to install dependencies
COPY package.json ./

# Install the dependencies and make the folder
RUN yarn install && mkdir /lorelog-ui && mv ./node_modules ./lorelog-ui

WORKDIR /lorelog-ui

COPY . .

# Build the project and copy the files
RUN yarn run build

FROM nginx:alpine

#!/bin/sh

COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

COPY --from=nodebuild /lorelog-ui/build /usr/share/nginx/html

EXPOSE 3000 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]