#!/bin/sh
MONITORDIR="/mail_content"
inotifywait -m -r -e create --format '%w%f' "${MONITORDIR}" | while read NEWFILE
do
        echo "This is the body of your mail" | mailx -s "File ${NEWFILE} has been created" "yourmail@addresshere.tld"
done