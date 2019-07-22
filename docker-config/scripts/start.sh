#!/bin/sh

pm2 start /home/node/img-runner/app.js --name "img-runner"


while true;
do
  sleep 5
done