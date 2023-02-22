FROM node:16-slim

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production

COPY .next ./.next
COPY public ./public

CMD ["yarn", "next", "start"]