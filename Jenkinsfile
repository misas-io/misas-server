node {
  stage 'checkout'
  git url: 'git@github.com:misas-io/misas-server.git', branch: env.JOB_BASE_NAME
  stage 'build container'
  sh './docker/scripts/build_container.sh' 
  stage 'build docs'
  sh './docker/scripts/build_docs.sh' 
  stage 'test server'
  sh './docker/scripts/test_container.sh' 
  stage 'deploy containers'
  sh './docker/scripts/run_container.sh'
}
