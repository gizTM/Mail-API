#!/bin/bash
docker ps -a | cut -f5 -d' ';