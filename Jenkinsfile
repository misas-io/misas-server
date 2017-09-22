/**
 * This pipeline will build misas-server
 */
properties([
  buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '3')), 
  pipelineTriggers([]),
  disableConcurrentBuilds()
])
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
      image: 'cgswong/aws', 
      ttyEnabled: true, 
      command: 'cat'
    )
  ],
  volumes: [
    hostPathVolume(
      hostPath: '/var/run/docker.sock', 
      mountPath: '/var/run/docker.sock'
    ),
    /*secretVolume( 
      mountPath: '/home/jenkins/ssh-keys/',
      secretName: 'github-ssh' 
    ),*/
    configMapVolume(
      mountPath: '/home/jenkins/values/', 
      configMapName: 'helm-misas-values'
    )
  ]
){
  def image = "victor755555/misas"
  def helm_version = "v2.6.1"
  def develop_branch = "develop"
  def master_branch = "master"
  def github_user_email = "victor.j.fdez@gmail.com"
  def github_user_name  = "Victor Fernandez"
  def github_user_username  = "victor755555"
  def branch = env.JOB_BASE_NAME
  node('docker') {
    stage('Build image') {
      //sh ' whoami '
      //sh ' whoami '
      //sh 'ls -lRa /home/jenkins/ssh-keys/'
      //sh 'mkdir $HOME/.ssh/ && cp -L $HOME/ssh-keys/id_rs* $HOME/.ssh/ && chmod 600 $HOME/.ssh/id_rs*'
      //sh 'ssh -v git@github.com'
      git credentialsId: 'github-ssh-keys', url: 'git@github.com:misas-io/misas-server.git', branch: env.JOB_BASE_NAME
      //sh 'ls -lRa /home/jenkins/'
      container('docker') {
        sh '''
            set +x
            docker login --username $DOCKER_USERNAME --password $DOCKER_PASSWORD
            set -x
           '''
        
        if ([master_branch].contains(branch)){    
          sh "docker build -t ${image}:latest -t ${image}:${branch} ."
        } else {
          sh "docker build -t ${image}:${branch} ."
        }
        if ([develop_branch, master_branch].contains(branch)){    
          sh "docker push ${image}"
        }
      }
    }
    stage('Test image'){
      container('docker') {
        sh "docker run --rm ${image}:${branch} run test "
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
    }
    stage("Build chart") {
      if ([develop_branch, master_branch].contains(branch)){    
        sh 'ls -l $HOME/values/'
        sh './helm init -c' 
        sh './helm dep build ./charts/misas-server/'
        sh './helm package ./charts/misas-server/'
        sh "./helm repo index ./"
        sh 'mkdir -p helm-charts/'
        sh 'mv index.yaml *.tgz helm-charts/' 
        container('aws'){
          sh "aws s3 ls s3://charts.misas.io/${branch}/"
          sh "aws s3 sync --delete helm-charts/ s3://charts.misas.io/${branch}/" 
        }
        // check if repo has been added yet else add it
        def command = $/ ./helm repo list | grep misas-${branch} /$
        def exitCode = sh script: command, returnStatus: true
        if(exitCode != 0){
          sh "./helm repo add misas-${branch} http://charts.misas.io/${branch}"  
        }
        sh './helm repo update'
      }
    }
    stage("Deploy chart"){
      if ([develop_branch, master_branch].contains(branch)){    
        // if misas is not deployed, then deploy it
        def command = $/ ./helm list | grep misas-${branch} /$
        def exitCode = sh script: command, returnStatus: true
        if (exitCode != 0) {
          sh "./helm install -f $HOME/values/${branch}.yaml misas-${branch}/misas-server"
        } else {
          sh "./helm upgrade -f $HOME/values/${branch}.yaml misas-${branch} "
        }
      } 
    }
    stage('Build Docs'){
      def container_name = "${env.JOB_BASE_NAME}-${env.BUILD_NUMBER}"
      if ([develop_branch].contains(branch)){    
        container('docker') {
          sh "docker run --name ${container_name} ${image}:${branch} run prod:docs" 
            sh "docker cp ${container_name}:/usr/src/app/docs/ ./docs/"
            sh "chmod -R ugo+rw ${pwd()}/docs/"
            //stash includes: 'docs/', name: 'docs'
            sh "docker rm -f ${container_name}"
        }
        //sh "ls -Rla ${pwd()}/docs/"
        stash includes: 'docs/', name: 'docs'
        sh 'git checkout --orphan gh-pages'
        sh 'rm -rf *' 
        unstash 'docs'
        sh 'git add docs/*'
        sshagent(['github-ssh-keys']) {

          def command = $/ git config --global user.email \\\"victor.j.fdez@gmail.com\\\" /$
          sh command
          command = $/ git config --global user.name \\\"Victor Fernandez\\\" /$
          sh command
          command = $/ git commit -m \\\"develop docs\\\" /$
          sh command
          sh 'git push -f origin gh-pages' 
        }
      }
    }
    stage("Remove Docker image"){
      container('docker') {
        sh "docker rmi -f --no-prune ${image}:${branch}"
      } 
    }
  }
}
