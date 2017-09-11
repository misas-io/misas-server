/**
 * This pipeline will run a Docker image build
 */

podTemplate(
  label: 'docker',
  containers: [
    containerTemplate(
      name: 'docker', 
      image: 'docker:17.09.0-ce', 
      ttyEnabled: true, 
      command: 'cat'
      envVars: [
        secretEnvVar(key: 'DOCKER_USERNAME', secretName: 'docker-registry', secretKey: 'username'),
        secretEnvVar(key: 'DOCKER_PASSWORD', secretName: 'docker-registry', secretKey: 'password')
      ],
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
    stage('Build Docker image (misas-server)') {
      git url: 'https://github.com/misas-io/misas-server.git', branch: env.JOB_BASE_NAME
      container('docker') {
        sh 'env' 
        sh 'ls -la ./ ~/'
        sh 'docker login --username $DOCKER_USERNAME --password $DOCKER_PASSWORD'
        sh "docker build -t ${image} ."
        sh "docker push ${image}"
      }
    }
  }
}
