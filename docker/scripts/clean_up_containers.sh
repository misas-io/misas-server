#!/usr/bin/env bash
source './docker/scripts/common_container_utils.sh'
set -x
docker ps -a
container_ids=($( docker ps -q -a -f "name=`gen_container_name`" ))      
if [ ${#container_ids[@]} -gt 0 ]; then
  docker stop ${container_ids[@]}
  docker rm ${container_ids[@]}
fi
