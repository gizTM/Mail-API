#!/bin/bash
MONITORDIR="/mail_content"
# shellcheck disable=SC2005,SC2162
inotifywait -m -e close_write --format '%f' "$MONITORDIR" | while
	read NEWFILE
do
	if [ "$NEWFILE" = "spam.json" ]; then
		echo "/spam called"
		echo "$(sa-learn --spam "$MONITORDIR"/"$NEWFILE")" >"$MONITORDIR"/response.json
	elif [ "$NEWFILE" = "ham.json" ]; then
		echo "/ham called"
		echo "$(sa-learn --ham "$MONITORDIR"/"$NEWFILE")" >"$MONITORDIR"/response.json
	elif [ "$NEWFILE" = "test.json" ]; then
		echo "/test called"
		TEST=$(spamassassin -t "$MONITORDIR"/"$NEWFILE");
		STATUS=${TEST#*X-Spam-Status: };
		SCORE=${TEST#*score=};
		REQUIRE=${TEST#*required=};
		echo "${STATUS%%,*}" "${SCORE%% *}" "${REQUIRE%% *}" >"$MONITORDIR"/response.json;
	elif [ "$NEWFILE" = "clear.json" ]; then 
		echo "/clear called";
		echo "$(sa-learn --clear)";
		echo "clear success" >"$MONITORDIR"/response.json;
	fi
done
