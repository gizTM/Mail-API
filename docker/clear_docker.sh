#!/bin/bash
docker ps -q -f status=exited | xargs --no-run-if-empty docker rm
docker images -q -f dangling=true | xargs --no-run-if-empty docker rmi