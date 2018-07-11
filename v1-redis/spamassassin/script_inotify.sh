#!/bin/bash
monitor_dir="/mail_content"
mail_train_dir="/mailtest"
# shellcheck disable=SC2005,SC2162
inotifywait -m -e close_write --format '%f' "$monitor_dir" | while
	read newfile
do
	# cat "$monitor_dir"/"$newfile";
	case "$newfile" in
	"spam.json")
		echo "sa-learn --spam $monitor_dir/$newfile called"
		echo "$(sa-learn --spam "$monitor_dir"/"$newfile")" >"$monitor_dir"/response.json
		cat "$monitor_dir"/response.json
		;;
	"ham.json")
		echo "sa-learn --ham $monitor_dir/$newfile called"
		echo "$(sa-learn --ham "$monitor_dir"/"$newfile")" >"$monitor_dir"/response.json
		cat "$monitor_dir"/response.json
		;;
	"test.json")
		echo "spamassassin -t $monitor_dir/$newfile called"
		TEST=$(spamassassin -t "$monitor_dir"/"$newfile")
		# echo "$TEST";
		STATUS=${TEST#*X-Spam-Status: }
		SCORE=${TEST#*score=}
		REQUIRE=${TEST#*required=}
		echo "${STATUS%%,*}" "${SCORE%% *}" "${REQUIRE%% *}" >"$monitor_dir"/response.json
		cat "$monitor_dir"/response.json
		;;
	"clear.json")
		echo "sa-learn --clear called"
		echo "$(sa-learn --clear)"
		echo "clear success" >"$monitor_dir"/response.json
		;;
	"peek.json")
		echo "sa-learn --backup | grep '^v' called"
		echo "$(sa-learn --backup | grep '^v')" >"$monitor_dir"/response.json
		;;
	"spams.json")
		path=$(cat "$monitor_dir"/"$newfile")
		path="$mail_train_dir"/$path
		echo "sa-learn --spam $path called"
		echo "$(sa-learn --spam "$path")" >"$monitor_dir"/response.json
		cat "$monitor_dir"/response.json
		;;
	"hams.json")
		path=$(cat "$monitor_dir"/"$newfile")
		path="$mail_train_dir"/$path
		echo "sa-learn --ham $path called"
		echo "$(sa-learn --ham "$path")" >"$monitor_dir"/response.json
		cat "$monitor_dir"/response.json
		;;
	esac
done
