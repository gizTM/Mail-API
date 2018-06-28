FROM node:8-alpine

WORKDIR /usr/src/app
COPY api/package*.json ./
RUN npm install

COPY api .

CMD npm start
