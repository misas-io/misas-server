/**
 * This pipeline will run a Docker image build
 */
  https://storage.googleapis.com/kubernetes-helm/helm-v2.6.1-darwin-amd64.tar.gz

podTemplate(
  label: 'docker',
  containers: [
    containerTemplate(
      name: 'docker', 
      image: 'docker:17.09.0-ce', 
      ttyEnabled: true, 
      command: 'cat',
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
  def image = "victor755555/misas"
  def helm_version = "v2.6.1"
  node('docker') {
    stage('Build Docker image (misas-server)') {
      git url: 'https://github.com/misas-io/misas-server.git', branch: env.JOB_BASE_NAME
      container('docker') {
        sh 'env' 
        sh 'ls -la ./ ~/'
        sh '''
            set +x
            docker login --username $DOCKER_USERNAME --password $DOCKER_PASSWORD
            set -x
           '''
        sh "docker build -t ${image} ."
        sh "docker push ${image}"
      }
    }
    /*stage('Generate new helm chart') {
    }*/
    stage('Deploy helm upgrade') {
      httpRequest(
        outputFile: 'helm', 
        responseHandle: 'NONE', 
        url: "https://storage.googleapis.com/kubernetes-helm/helm-${helm_version}-linux-amd64.tar.gz"
      )
      sh 'chmod +x ./helm'
      sh './helm status'
      sh './helm list'
    }
  }
}
