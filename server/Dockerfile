FROM node:16.15.0-alpine3.15

WORKDIR /code

COPY package.json ./package.json

RUN npm install

COPY . ./

CMD ["npm", "start"]