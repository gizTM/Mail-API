FROM ubuntu:latest
COPY ./spamassassin/script.sh ./
RUN apt-get update 
RUN apt-get install -y spamassassin inotify-tools shellcheck
RUN mkdir -p /mail_content && chmod a+rx script.sh
RUN shellcheck /script.sh
CMD ./script.sh
