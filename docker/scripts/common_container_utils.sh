#!/usr/bin/env bash

MISAS_URL="api.misas.us"
MISAS_PACKAGE="package.json"
MISAS_BASE="misas-server"

package_version(){
  cat "$MISAS_PACKAGE" | grep '"version"' | grep -o '\d\+\.\d\+\.\d\+' | head -1
}

gen_image_name(){
  if [ -z "${BUILD_NUMBER}" ]; then
    echo "Error: env variable BUILD_NUMBER required" 1>&2
    exit -1
  fi
  echo "$MISAS_BASE:`package_version`_${BUILD_NUMBER:-0}"
}

gen_service_name(){
  local tmp
  echo "api"
}

gen_stack_name(){
  echo "misas-server_${JOB_BASE_NAME%%-*}"
}

gen_container_name(){
  echo "misas-server${JOB_BASE_NAME}"
}

get_misas_location(){
  local ENV_FILE
  ENV_FILE=""
  case "${JOB_BASE_NAME}" in
    develop)
      ENV_FILE="misas-server.us.develop.toml"
      ;;
    master)
      ENV_FILE="misas-server.us.master.toml"
      ;;
    *)
      echo "ERROR: branch is not handled currently" 1>&2
      exit -1;
      ;;
  esac    # --- end of case ---
  set +x
  echo "$ENV_FOLDER/$ENV_FILE"
  set -x
}


gen_docker_rancher_compose(){
  local image service_name domains scale stack
  image="`gen_image_name`" || exit -1
  domain="${MISAS_URL}"
  override=""
  stack="true"
  ENV_FILE=""
  case "${JOB_BASE_NAME}" in
    develop)
      service_name="$1"
      override="dev.api.misas.us"
      scale=1
      stack="stack"
      ;;
    master)
      service_name="$1"
      override="api.misas.us"
      scale=2
      stack="stack"
      ;;
    *)
      echo "ERROR: branch is not handled currently" 1>&2
      exit -1;
      ;;
  esac    # --- end of case ---
  gen_docker_compose "$service_name" "$image" "$domain" "$override" "$stack"
  gen_rancher_compose "$service_name" "$scale"
}

gen_docker_compose(){
  local service_name image domains override
  service_name=$1
  image=$2
  domains=$3
  override=$4
  stack=$5
  docker_compose=$( cat <<EOF
${service_name}:
  image: ${image}
  labels:
    traefik.enable: ${stack} 
    traefik.domain: ${domains}
    traefik.port: 8084
$( 
  if [ ! -z "$override" ]; then
    echo "    traefik.override: $override"
  fi
)
    io.rancher.scheduler.affinity:host_label: provider=scaleway
  volumes:
    - $(get_misas_location):/usr/src/app/misas.toml
EOF
  )
  echo "$docker_compose" > docker-compose.yml
}

gen_rancher_compose(){
  service_name=$1
  image=$2
  docker_compose=$( cat <<EOF
${service_name}:
  scale: ${scale}
  health_check:
    port: 8084
    interval: 2000
    initializing_timeout: 60000
    unhealthy_threshold: 3
    strategy: recreate
    response_timeout: 2000
    request_line: GET "/health" "HTTP/1.0"
    healthy_threshold: 2
EOF
  )
  echo "$docker_compose" > rancher-compose.yml
}
