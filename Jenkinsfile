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

/**
 * This pipeline will run a Docker image build
 */

podTemplate(
  label: 'docker',
  containers: [
    containerTemplate(
      name: 'docker', 
      image: 'docker:1.11', 
      ttyEnabled: true, 
      command: 'cat'
    )
  ],
  volumes: [
    hostPathVolume(
      hostPath: '/var/run/docker.sock', 
      mountPath: '/var/run/docker.sock'
    )
  ]
){
  def image = "victor755555/misas-server"
  node('docker') {
    stage 'Showing environment'
    sh 'env' 
    stage('Build Docker image') {
      sh 'env' 
      git url: 'https://github.com/misas-io/misas-server.git', branch: env.JOB_BASE_NAME
      container('docker') {
        sh "docker build -t ${image} ."
      }
    }
  }
}
