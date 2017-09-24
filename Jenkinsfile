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
  def git_branch_name = env.JOB_BASE_NAME.replace('%2F','/')
  def branch_name = env.JOB_BASE_NAME.replace('%2F','_')
  def container_name = "${env.JOB_BASE_NAME}-${env.BUILD_NUMBER}"
  node('docker') {
    stage('Build image') {
      // checkout the code
      echo env.JOB_BASE_NAME
      echo git_branch_name
      echo branch_name
      git credentialsId: 'github-ssh-keys', url: 'git@github.com:misas-io/misas-server.git', branch: git_branch_name 
      container('docker') {
        sh '''
            set +x
            docker login --username $DOCKER_USERNAME --password $DOCKER_PASSWORD
            set -x
           '''
        // build the image 
        if ([master_branch].contains(branch_name)){    
          sh "docker build -t ${image}:latest -t ${image}:${branch_name} ."
        } else {
          sh "docker build -t ${image}:${branch_name} ."
        }
        if ([develop_branch, master_branch].contains(branch_name)){    
          sh "docker push ${image}"
        }
      }
    }
    stage('Test image'){
      container('docker') {
        sh "docker run --rm ${image}:${branch_name} run test "
      } 
    }
    if ([develop_branch, master_branch].contains(branch_name)){    
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
        sh 'ls -l $HOME/values/'
        sh './helm init -c' 
        sh './helm dep build ./charts/misas-server/'
        sh './helm package ./charts/misas-server/'
        sh "./helm repo index ./"
        sh 'mkdir -p helm-charts/'
        sh 'mv index.yaml *.tgz helm-charts/' 
        container('aws'){
          sh "aws s3 ls s3://charts.misas.io/${branch_name}/"
          sh "aws s3 sync --delete helm-charts/ s3://charts.misas.io/${branch_name}/" 
        }
        // check if repo has been added yet else add it
        def command = $/ ./helm repo list | grep misas-${branch_name} /$
        def exitCode = sh script: command, returnStatus: true
        if(exitCode != 0){
          sh "./helm repo add misas-${branch_name} http://charts.misas.io/${branch_name}"  
        }
        sh './helm repo update'
      }
      stage("Deploy chart"){
        // if misas is not deployed, then deploy it
        def command = $/ ./helm list | grep misas-${branch_name} /$
        def exitCode = sh script: command, returnStatus: true
        if (exitCode != 0) {
          sh " ./helm install -f $HOME/values/${branch_name}.yaml --namespace misas-${branch_name} --name misas-${branch_name} misas-${branch_name}/misas-server "
        } else {
          sh " ./helm upgrade -f $HOME/values/${branch_name}.yaml --namespace misas-${branch_name} misas-${branch_name} misas-${branch_name}/misas-server " 
        }
      }
    }
    if ([develop_branch].contains(branch_name)){    
      stage('Build Docs'){
        container('docker') {
            sh "docker run --name ${container_name} ${image}:${branch_name} run prod:docs" 
            sh "docker cp ${container_name}:/usr/src/app/docs/ ./docs/"
            sh "chmod -R ugo+rw ${pwd()}/docs/"
            //stash includes: 'docs/', name: 'docs'
            sh "docker rm -f ${container_name}"
        }
        // store the documents
        stash includes: 'docs/', name: 'docs'
        sh 'git checkout --orphan gh-pages'
        sh 'rm -rf * .gitignore .babelrc' 
        sh 'git rm -f -r --cached ./'
        // put documents in current directory
        unstash 'docs'
        sh 'mv docs/* ./ && rm -rf docs/'
        sh 'git status'
        sh 'git add ./'
        sh 'ls -la ./'
        // push new branch_name
        sshagent(['github-ssh-keys']) {
          sh 'git config --global user.email victor.j.fdez@gmail.com'
          command = $/ git config --global user.name 'Victor Fernandez' /$
          sh command
          sh 'git commit -m "docs"'
          sh 'git push -f origin gh-pages' 
        }
      }
    }
    stage("Remove Docker image"){
      container('docker') {
        sh "docker rmi -f --no-prune ${image}:${branch_name}"
      } 
    }
  }
}
