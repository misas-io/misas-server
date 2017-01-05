#!/usr/bin/env bash

MISAS_URL="api.misas.io"
MISAS_PACKAGE="package.json"
MISAS_BASE="misas"

package_version(){
  cat "$MISAS_PACKAGE" | grep '"version"' | grep -o '\d\+\.\d\+\.\d\+' | head -1
}

gen_image_name(){
  if [ -z "${BUILD_NUMBER}" ]; then
    echo "Error: env variable BUILD_NUMBER required" 1>&2
    exit -1
  fi
  echo "victor755555/$MISAS_BASE:`package_version`_${BUILD_NUMBER:-0}"
}

gen_service_name(){
  echo "api"
}

gen_stack_name(){
  echo "misas_${JOB_BASE_NAME%%-*}"
}

is_env_develop(){
  if [[ "${JOB_BASE_NAME}" == "develop" ]]; then
    return 0
  fi
  return 1
}

get_misas_env(){
  case "${JOB_BASE_NAME}" in
    develop)
      echo "development"
      ;;
    master)
      echo "production"
      ;;
    *)
      echo "ERROR: branch is not handled currently" 1>&2
      exit -1;
      ;;
  esac    # --- end of case ---
}

get_misas_location(){
  local ENV_FILE
  ENV_FILE=""
  case "${JOB_BASE_NAME}" in
    develop)
      ENV_FILE="misas.io.develop.toml"
      ;;
    master)
      ENV_FILE="misas.io.master.toml"
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
      override="dev.api.misas.io"
      scale=1
      stack="stack"
      ;;
    master)
      service_name="$1"
      override="api.misas.io"
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

gen_docker_compose_migrate(){
docker_compose=$( cat <<EOF
migrate:
  command: run migrate up 
  image: $(gen_image_name)
  labels:
    io.rancher.container.start_once: true
    io.rancher.scheduler.affinity:host_label: provider=scaleway
  volumes:
    - $(get_misas_location):/usr/src/app/misas.toml
  environment:
    - NODE_ENV=$(get_misas_env)
EOF
)
  echo "$docker_compose" > docker-compose.yml
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
  command: run "prod:server"
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
  environment:
    - NODE_ENV=$(get_misas_env)
  volumes:
    - $(get_misas_location):/usr/src/app/misas.toml
scheduler: 
  image: ${image}
  command: run "prod:scheduler"
  labels:
    io.rancher.scheduler.affinity:host_label: provider=scaleway
  environment:
    - NODE_ENV=$(get_misas_env)
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
scheduler:
  scale: 1 
EOF
  )
  echo "$docker_compose" > rancher-compose.yml
}
