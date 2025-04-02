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
    }

    stages {
        stage('Purge Previous Artifacts') {
            steps {
                sh '''
                    echo "Removing old workspace artifacts..."
                    rm -rf solution_plus_project || true
                '''
            }
        }

        stage('Run Unit Tests and Capture Warnings') {
            steps {
                script {
                    echo "Running unit tests and capturing warnings..."
                    sh '''
                        set -e
                        cd application

                        # Run npm test and capture any warnings/errors
                        echo "Running npm test..."
                        npm test > test_results.txt 2>&1 || { echo "npm test failed"; exit 1; }

                        # Append any Node.js related warnings/errors
                        echo "Capturing Node.js version and npm warnings..."
                        node -v >> test_results.txt || echo "Node.js not installed or incompatible version" >> test_results.txt
                        npm -v >> test_results.txt || echo "npm not installed" >> test_results.txt
                    '''
                }
            }
        }

        stage('Store Unit Test and Node.js Results') {
            steps {
                archiveArtifacts artifacts: 'application/test_results.txt', fingerprint: true
                sh 'cat application/test_results.txt'  // Print the content for visibility
            }
        }

        stage('Validate Docker Image') {
            steps {
                script {
                    echo "Validating Docker image..."
                    sh 'docker history $IMAGE_TAG | grep -q "empty layer" && exit 1 || echo "Valid image"'
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
                            docker build --cache-from $DOCKER_REPO:cache --tag $IMAGE_TAG -f application/Dockerfile application
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
                        trivy image --exit-code 0 --no-progress $IMAGE_TAG > security_scan_reports/web-app-scan-report.txt || true
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
                                echo "Applying Kubernetes manifests..."
                                kubectl apply -f k8s/

                                echo "Verifying deployment rollouts..."
                                for i in {1..5}; do
                                    kubectl rollout status deployment/my-app --timeout=60s && break || sleep 10
                                done

                                for i in {1..5}; do
                                    kubectl rollout status deployment/mysql-db --timeout=60s && break || sleep 10
                                done

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

        stage('Check Disk Space') {
            steps {
                script {
                    sh 'df -h'
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

        stage('Get Ingress External IP') {
            steps {
                script {
                    // Fetch the external IP of the ingress
                    def ingressIP = sh(script: 'kubectl get ingress my-app-ingress -o=jsonpath="{.status.loadBalancer.ingress[0].ip}"', returnStdout: true).trim()

                    // In case DNS is used instead of IP
                    if (ingressIP == "") {
                        ingressIP = sh(script: 'kubectl get ingress my-app-ingress -o=jsonpath="{.spec.rules[0].host}"', returnStdout: true).trim()
                    }

                    // Store the URL for later use
                    env.WEB_APP_URL = "http://$ingressIP"
                    echo "Website URL: $WEB_APP_URL"
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
                channel: 'U08643YCHLM', 
                message: "Jenkins Pipeline SUCCESS: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}. Git Commit: ${env.GIT_COMMIT}. Access the website at: ${env.WEB_APP_URL}"
            )
            echo "Build and Kubernetes deployment for SolutionPlus Web App was successful!"
        }

        failure {
            slackSend (
                channel: 'U08643YCHLM', 
                message: "Jenkins Pipeline FAILURE: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}. Error: ${currentBuild.description}"
            )
            echo "Build or deployment failed. Please check the logs for errors."

            sh 'kubectl rollout undo deployment/my-app'
            sh 'kubectl rollout undo deployment/mysql-db'
        }
    }
}
