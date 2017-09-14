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
  def develop_branch = "develop"
  def master_branch = "master"
  node('docker') {
    stage('Build Docker image (misas-server) for all branches') {
      git url: 'https://github.com/misas-io/misas-server.git', branch: env.JOB_BASE_NAME
      container('docker') {
        sh '''
            set +x
            docker login --username $DOCKER_USERNAME --password $DOCKER_PASSWORD
            set -x
           '''
        sh "docker build -t ${image} ."
        sh "docker push ${image}"
      }
    }
    stage('Test Docker image for all branches'){
      container('docker') {
        sh "docker run --rm ${image} run test "
      } 
    }
    stage('Build Docs for develop branch'){
      def container_name = "${env.JOB_BASE_NAME}-${env.BUILD_NUMBER}"
      if ([develop_branch].contains(env.JOB_BASE_NAME)){    
        container('docker') {
          sh "docker run --name ${container_name} ${image} run prod:docs" 
          sh "docker cp ${container_name}:/usr/src/app/docs/ ./docs/"
          sh "ls -la ${pwd()}/docs/"
          stash includes: 'docs/', name: 'docs'
        }
      }
      unstash 'docs'
      sh 'ls -la'
    }
    stage("Remove Docker image ${image} for all branches"){
      container('docker') {
        sh "docker rmi ${image}"
      } 
    }
    stage("Get helm (${helm_version})"){
      httpRequest(
        outputFile: 'helm.tar.gz', 
        responseHandle: 'NONE', 
        url: "https://storage.googleapis.com/kubernetes-helm/helm-${helm_version}-linux-amd64.tar.gz"
      )
      sh 'tar -xf ./helm.tar.gz && rm -f ./helm.tar.gz'
      sh 'cp ./linux-amd64/helm ./ && rm -rf ./linux-amd64/'
      sh './helm list'
    }
    stage("Build chart only for (develop, master) branches") {
    }
  }
}
