#!/bin/sh
MONITORDIR="/mail_content"
inotifywait -m -e close_write --format '%f' "${MONITORDIR}" | while
	read NEWFILE
do
	if [ ${NEWFILE} = "spam.json" ]; then
		echo "/spam called"
		echo $(sa-learn --spam ${MONITORDIR}/${NEWFILE}) >${MONITORDIR}/response.json
		# cat ${MONITORDIR}/response.json
	elif [ ${NEWFILE} = "ham.json" ]; then
		echo "/ham called"
		echo $(sa-learn --ham ${MONITORDIR}/${NEWFILE}) >${MONITORDIR}/response.json
		# cat ${MONITORDIR}/response.json
	elif [ ${NEWFILE} = "test.json" ]; then
		echo "/test called"
                echo $(spamassassin -t ${MONITORDIR}/${NEWFILE}) >${MONITORDIR}/response.json
                cat ${MONITORDIR}/response.json
	fi
done
