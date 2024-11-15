#!/bin/bash
set -e
host=slayer.marioslab.io
host_dir=/home/badlogic/vidsky.mariozechner.at

rsync -avz --exclude node_modules --exclude .git --exclude docker/data ./ $host:$host_dir

if [ "$1" == "server" ]; then
    echo "Publishing client & server"
    ssh -t $host "cd $host_dir && ./docker/control.sh stop && ./docker/control.sh start && ./docker/control.sh logs"
else
    echo "Publishing client only"
fi