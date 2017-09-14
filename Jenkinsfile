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
    ),
    containerTemplate(
      name: 'aws', 
      image: 'cgswong/aws:s3cmd', 
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
          sh "chmod -R ugo+rw ${pwd()}/docs/"
          //stash includes: 'docs/', name: 'docs'
          sh "docker rm -f ${container_name}"
        }
        //sh "ls -Rla ${pwd()}/docs/"
      }
    }
    stage("Remove Docker image ${image} for all branches"){
      container('docker') {
        sh "docker rmi -f ${image}"
      } 
    }
    stage("Get helm (${helm_version}) for (develop, master) branches"){
      httpRequest(
        outputFile: 'helm.tar.gz', 
        responseHandle: 'NONE', 
        url: "https://storage.googleapis.com/kubernetes-helm/helm-${helm_version}-linux-amd64.tar.gz"
      )
      sh 'tar -xf ./helm.tar.gz && rm -f ./helm.tar.gz'
      sh 'cp ./linux-amd64/helm ./ && rm -rf ./linux-amd64/'
    }
    stage("Build chart only for (develop, master) branches") {
      if ([develop_branch, master_branch].contains(env.JOB_BASE_NAME)){    
        sh './helm init -c' 
        sh './helm dep build ./charts/misas-server/'
        sh './helm package ./charts/misas-server/'
        sh './helm repo index ./charts/misas-server/'
        sh 'mkdir -p helm-charts/'
        sh 'mv ./charts/misas-server/index.yaml *.tgz helm-charts/' 
        container('aws'){
          sh 's3cmd ls s3://charts.misas.io/develop/'    
          sh 's3cmd sync --delete helm-charts/ s3://charts.misas.io/develop/'    
        }
      }
    }
  }
}
