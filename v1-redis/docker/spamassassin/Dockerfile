FROM ubuntu:18.04
COPY v1-redis/spamassassin/. .
RUN apt-get update 
RUN apt-get install -y spamassassin inotify-tools shellcheck redis-tools
RUN mkdir -p /mail_content/spam && mkdir -p /mail_content/ham && chmod a+rx script.sh && chmod a+rx redis.sh
COPY mailtest/ ../mailtest/
RUN shellcheck /script.sh
# RUN source /script.sh
# CMD [ "script.sh" ]
CMD ./script.sh