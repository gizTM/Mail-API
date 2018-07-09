FROM ubuntu:18.04
COPY v1/spamassassin/script.sh .
RUN apt-get update 
RUN apt-get install -y spamassassin inotify-tools shellcheck
RUN mkdir -p /mail_content && chmod a+rx script.sh
COPY mailtest/ ../mailtest/
RUN shellcheck /script.sh
# RUN source /script.sh
# CMD [ "script.sh" ]
CMD ./script.sh