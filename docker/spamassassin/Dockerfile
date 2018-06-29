FROM ubuntu:latest
COPY ./spamassassin/script.sh ./
RUN apt-get update && apt-get install -y spamassassin inotify-tools && mkdir -p /mail_content && chmod a+rx script.sh
CMD ./script.sh
