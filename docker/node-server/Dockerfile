FROM node:8-alpine

WORKDIR /api-dir
COPY api/package*.json ./
RUN npm install

COPY api .

CMD npm start
