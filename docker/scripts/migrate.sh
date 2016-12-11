#!/usr/bin/env bash

source './docker/scripts/common_container_utils.sh'
set -x
#run docker build process 
gen_docker_compose_migrate
rancher-compose -p "`gen_stack_name`" \
                up \
                --upgrade \
                "migrate"
