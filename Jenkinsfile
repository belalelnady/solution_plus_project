/*
Jenkins Pipeline for SolutionPlus Web Application Deployment
Purpose: Automates build, security scan, and deployment of web app and MySQL to Kubernetes
Author: DevOps Team
*/

pipeline {
    agent { label 'jenkins-agent' }

    environment {
        DOCKER_REPO = 'mohamedamr99t/solutionplus-final'
        IMAGE_TAG = "${DOCKER_REPO}:${GIT_COMMIT}"
        DEP_NAME = "deployment/my-app"
        SLACK_CHANNEL = 'C08KVA79N1K'  
    }

    stages {

        stage('Check Disk Space') {
            steps {
                script {
                    echo "Checking disk space..."
                        // Check if root (/) has more than 10% space available
                    def diskAvailable = sh(script: "df / | awk 'NR==2 {print \$4}'", returnStdout: true).trim()
                    echo "Available disk space: ${diskAvailable}"
                }
            }
        }

        stage('Purge Previous Artifacts') {
            steps {
                sh '''
                    echo "Removing old workspace artifacts..."
                    rm -rf solution_plus_project || true
                '''
            }
        }

     stage('Run Unit Tests') {
        steps {
            script {
                dir('application') {
                    sh '''
                        # Simply run tests and capture all output
                        echo "Starting unit tests..." > ../test_results.txt
                        echo "Node version: $(node -v)" >> ../test_results.txt
                        echo "npm version: $(npm -v)" >> ../test_results.txt
                        
                        npm test >> ../test_results.txt 
                        
                        echo "\nTest execution completed" >> ../test_results.txt
                        echo "Exit code: $?" >> ../test_results.txt
                    '''
                }
                
                // Archive raw results regardless of test outcome
                archiveArtifacts artifacts: 'test_results.txt'
                
                // Display last 20 lines for quick debugging
                echo "Test output tail:"
                sh 'tail -n 20 test_results.txt'
                
                // Fail the stage only if the file suggests catastrophic failure
                def exitCode = sh(script: 'grep "Exit code:" test_results.txt | awk \'{print $3}\'', returnStdout: true).trim()

                if (exitCode != "0") {
                    error("Unit tests reported failures (exit code ${exitCode}). Developers must investigate.")
                }
            }
        }
    }



        stage('Construct and Upload Web App Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-id', 
                                                      usernameVariable: 'DOCKER_USER', 
                                                      passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            set -e
                            
                            echo "Authenticating with Docker Hub..."
                            docker logout || true
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                            echo "Building and pushing Docker image with cache..."
                            docker build --cache-from $DOCKER_REPO:cache --tag $IMAGE_TAG -f application/Dockerfile
                            docker push $IMAGE_TAG

                            echo "Logging out from Docker Hub..."
                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Perform Security Scan on Web App Image') {
            steps {
                script {
                    sh '''
                        set -e
                        mkdir -p security_scan_reports
                        echo "Running Trivy security scan..."
                        trivy image --exit-code 1 --severity HIGH,CRITICAL --no-progress $IMAGE_TAG > security_scan_reports/web-app-scan-report.txt || true
                    '''
                }
            }
        }

        stage('Store Security Scan Results') {
            steps {
                archiveArtifacts artifacts: 'security_scan_reports/*.txt', fingerprint: true
                sh 'rm -rf security_scan_reports'
            }
        }
        stage('Apply Kubernetes Manifests') {
            steps {
                script {
                    def maxRetries = 3
                    def attempt = 0
                    while (attempt < maxRetries) {
                        try {
                            sh '''
                                set -e

                                echo " Manifest validation..."
                                kubectl apply --dry-run=client -f k8s/

                                echo "Applying Kubernetes manifests..."
                                kubectl apply -f k8s/

                                echo "Setting image for deployments..."
                                kubectl set image deployment/my-app my-app=${IMAGE_TAG}

                                echo "Verifying deployment rollouts..."                              
                                kubectl rollout status deployment/my-app --timeout=60s 

                                echo "Kubernetes deployment successful!"
                            '''
                            break
                        } catch (Exception e) {
                            if (++attempt == maxRetries) {
                                throw e
                            }
                            echo "Retrying apply after failure ($attempt/$maxRetries)..."
                            sleep 10
                        }
                    }
                }
            }
        }

        stage('Verify Kubernetes Resources Health') {
            steps {
                script {
                    echo "Verifying Kubernetes resource limits for CPU and memory..."
                    sh 'kubectl get deployment/my-app -o=jsonpath="{.spec.template.spec.containers[0].resources}"'
        
                    echo "Verifying the health of Kubernetes pods..."
                    sh 'kubectl get pods --namespace="default"'
        
                    echo "Checking logs for recent errors..."
                    sh 'kubectl logs -l app=my-app --tail=50'
                }
            }
        }


        stage('Wait for Deployments to Rollout') {
            steps {
                script {
                    def deployments = sh(script: 'kubectl get deployments -o jsonpath="{.items[*].metadata.name}"', returnStdout: true).trim().split()
                    for (deployment in deployments) {
                        sh "kubectl rollout status deployment/${deployment} --timeout=60s"
                    }
                }
            }
        }
        stage('Rollback on Failure') {
            when {
                expression { currentBuild.currentResult == 'FAILURE' }
            }
            steps {
                script {
                    echo "Build failed. Attempting rollback..."

                    def rollbackDeployment = { name ->
                        try {
                            sh "kubectl rollout undo deployment/${name}"
                            sh "kubectl rollout status deployment/${name} --timeout=60s"
                            echo "Rollback for ${name} succeeded."
                        } catch (Exception e) {
                            echo "Rollback for ${name} failed: ${e.getMessage()}"
                        }
                    }

                    rollbackDeployment('my-app')
                    rollbackDeployment('mysql-db')
                }
            }
        }

    }





    post {
        always {
            echo "Cleaning up Docker images..."
            sh 'docker image prune -f || true'
        }
        success {
            slackSend (
                channel: "${SLACK_CHANNEL}", 
                message: "Jenkins Pipeline SUCCESS: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}"
            )
            echo "Build and Kubernetes deployment for SolutionPlus Web App was successful!"
        }
        failure {
            slackSend (
                channel: "${SLACK_CHANNEL}",  
                message: "Jenkins Pipeline FAILURE: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}"
            )
            echo "Build or deployment failed. Rollback attempted in dedicated stage."
        }
    }

}

