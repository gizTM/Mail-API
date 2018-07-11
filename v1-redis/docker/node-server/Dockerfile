FROM node:8-alpine

WORKDIR /data
COPY v1-redis/api .
# COPY v1/api/package*.json ./
RUN npm install

# RUN ls /data

# CMD [ "npm", "start" ]
# CMD [ "nodemon", "/data/app.js" ]
CMD npm run start-dev
