FROM ubuntu:14.04

# ENV DEBIAN_FRONTEND noninteractive

RUN rm -vf /var/lib/apt/lists/* && apt-get update
RUN apt-get install -y nodejs npm spamassassin curl apt-transport-https ca-certificates
# TODO could uninstall some build dependencies

# fucking debian installs `node` as `nodejs`
# RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10
RUN curl --fail -ssL -o setup-nodejs https://deb.nodesource.com/setup_8.x && bash setup-nodejs && apt-get install -y nodejs build-essential

# VOLUME ["/data"]

COPY . /data
RUN cd /data && npm install
# RUN node --version

WORKDIR /data

CMD ["npm", "start"]