FROM node:8-alpine

WORKDIR /data
COPY v1/api .
# COPY v1/api/package*.json ./
RUN npm install

# RUN ls /data

CMD [ "npm", "start" ]
# CMD npm run start-dev
