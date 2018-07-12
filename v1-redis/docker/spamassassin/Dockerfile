FROM ubuntu:18.04
COPY v1-redis/spamassassin/. .
RUN apt-get update 
RUN apt-get install -y spamassassin inotify-tools shellcheck net-tools redis-tools
RUN mkdir -p /mail_content && chmod a+rx script.sh && chmod a+rx redis.sh
COPY mailtest/ ../mailtest/
RUN shellcheck /script.sh
# RUN source /script.sh
# CMD [ "script.sh" ]
CMD ./script.sh