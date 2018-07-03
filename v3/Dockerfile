FROM ubuntu:14.04

RUN rm -vf /var/lib/apt/lists/* && apt-get update
RUN apt-get install -y nodejs npm spamassassin curl apt-transport-https ca-certificates
RUN curl --fail -ssL -o setup-nodejs https://deb.nodesource.com/setup_8.x && bash setup-nodejs && apt-get install -y nodejs build-essential

COPY v3 /data
COPY mailtest /data/mailtest
RUN cd /data && npm install

WORKDIR /data

CMD ["npm", "start"]