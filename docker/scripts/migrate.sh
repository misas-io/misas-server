#!/usr/bin/env bash

source './docker/scripts/common_container_utils.sh'
set -x
#run docker build process 
docker run --rm -v "`get_misas_location`":/usr/src/app/misas.toml `gen_image_name` run migrate up
