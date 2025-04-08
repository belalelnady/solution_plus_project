pipeline {
    agent any
    parameters {
        booleanParam(name: 'RUN_TESTS', defaultValue: false, description: 'Set to false if you have no tests')
    }
    environment {
        DOCKER_IMAGE_NAME = 'belalelnady/solution-plus'
        DEPLOYMENT_NAME = 'my-app'
        CONTAINER_NAME = 'uni-app'

        K8S_MANIFEST_DIR = './k8s'
        K8S_NAMESPACE = 'productionz'

        DOCKER_HUB_CREDENTIALS = credentials('docker-cred')
        SLACK_CHANNEL = 'C08KVA79N1K'  // #channelName OR channelID 
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github',
                    url: 'https://github.com/belalelnady/solution_plus_project.git'
            }
        }

        stage('Test & audit') {
            when { expression { params.RUN_TESTS } }
            steps {
                sh "npm run test || exit 1"
                sh "npm audit fix"
            }
        }

         stage('Build') {
            steps {
                script {
                    // build the image
                    sh "docker build -t ${DOCKER_IMAGE_NAME}:v${env.BUILD_NUMBER} ./application"
                    // Scan with trivy
                    sh "trivy image --format json --output trivy-report.json --exit-code 1 --severity CRITICAL ${DOCKER_IMAGE_NAME}:v${env.BUILD_NUMBER}"
                     // Push to dockr hub
                    sh "docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW"
                    sh "docker push ${DOCKER_IMAGE_NAME}:v${env.BUILD_NUMBER}"
                }
            }
         }

        stage('Deploy and Verify') {
            steps {
                script {
                    try {
                        // create a name space if it didn't exist
                        sh "kubectl get namespace ${K8S_NAMESPACE} || kubectl create namespace ${K8S_NAMESPACE}"
                        // Apply any new changes to the manafist files
                        sh "kubectl apply -f ./${K8S_MANIFEST_DIR} -n ${K8S_NAMESPACE}"
                        // Set the new image and restart the deployment
                        sh "kubectl set image deployment/${DEPLOYMENT_NAME} ${CONTAINER_NAME}=${DOCKER_IMAGE_NAME}:v${env.BUILD_NUMBER} -n ${K8S_NAMESPACE}"
                        
                    } catch (e) {
                        echo "Deployment failed, rolling back..."
                        // rollback to previos image if any command fails
                        sh "kubectl rollout undo deployment/${DEPLOYMENT_NAME} -n ${K8S_NAMESPACE}"
                        error "Rolled back to previous image. Error: ${e.message}"
                        sh "kubectl get events --sort-by=.metadata.creationTimestamp -n ${K8S_NAMESPACE}"
                    }
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline succeeded!'
            script {
                if (fileExists('trivy-report.json')) {
                    //Create artifacts from triv report to keep it available 
                    archiveArtifacts artifacts: 'trivy-report.json'
                    //Send a notification message to slack
                    slackSend(
                            channel: "${SLACK_CHANNEL}",
                            color: 'good',
                            message: "Build #${env.BUILD_NUMBER} success!\nTrivy security scan report attached")

                    //Send the triv report to slack
                    slackUploadFile(
                            channel: "${SLACK_CHANNEL}",                 
                            filePath: 'trivy-report.json',
                            initialComment: "Trivy Report for Build #${env.BUILD_NUMBER}")

                } else {
                    slackSend(
                            channel: "${SLACK_CHANNEL}",                          
                            color: 'good',
                            message: "Build #${env.BUILD_NUMBER} success!\nNo Trivy report generated")
                }
            
            }
          
        }
        failure {
            echo 'Pipeline failed!'
            script {
                if (fileExists('trivy-report.json')) {
                    archiveArtifacts artifacts: 'trivy-report.json'
                    slackSend(
                            channel: "${SLACK_CHANNEL}",
                            color: 'danger',
                            message: "Build #${env.BUILD_NUMBER} failed!\nTrivy security scan report attached")

                    slackUploadFile(
                            channel: "${SLACK_CHANNEL}",
                            filePath: 'trivy-report.json',
                            initialComment: "Trivy Report for Failed Build #${env.BUILD_NUMBER}")
                } else {
                    slackSend(
                            channel: "${SLACK_CHANNEL}",
                            color: 'danger',
                            message: "Build #${env.BUILD_NUMBER} failed! \nNo Trivy report")
                }
                
            }
           
        }
        always {
            script {
                echo "Cleaning up resources..."
                sh "docker image prune -a -f "
                sh "kubectl delete pod --field-selector=status.phase=Failed -n ${K8S_NAMESPACE} || true"
                sh "kubectl delete job --field-selector=status.successful=1 -n ${K8S_NAMESPACE} || true"
                sh "rm -f trivy-report.json || true"
                echo "Cleanup completed successfully."
            }
            echo "Pipeline finished"
        }
    }
}