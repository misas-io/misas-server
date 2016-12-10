#!/usr/bin/env bash

source './docker/scripts/common_container_utils.sh'
set +x
#source '/secrets'
set -x
gen_docker_rancher_compose "api"
rancher-compose -p "`gen_stack_name`" \
                up \
                --upgrade \
                --confirm-upgrade \
                --interval 30000 \
                "api"
