FROM node:18.3.0-alpine3.14

RUN mkdir -p /home/app
WORKDIR /home/app

RUN apk update
RUN apk add --no-cache make gcc g++ python3 linux-headers udev

ENV NODE_ENV production

COPY package.json npm-shrinkwrap.json ./
RUN npm ci --production

COPY . .

EXPOSE 9850
ENTRYPOINT ["node", "cli.js"]
