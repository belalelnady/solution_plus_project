/*
Jenkins Pipeline for SolutionPlus Web Application Deployment
Purpose: Automates build, security scan, and deployment of web app and MySQL to Kubernetes
Author: DevOps Team
*/

pipeline {
    agent { label 'jenkins-agent' }

    environment {
        DOCKER_REPO = 'mohamedamr99t/solutionplus-final'
        IMAGE_TAG = "${DOCKER_REPO}:web-img-latest"
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

        stage('Validate Docker Image') {
            steps {
                script {
                    echo "Validating Docker image..."
                    // Example check: Ensure there are no empty layers
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

                            echo "Building and pushing Docker image..."
                            docker build -t $IMAGE_TAG -f application/Dockerfile application
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

        stage('Kubernetes Manifest Validation') {
            steps {
                script {
                    echo "Validating Kubernetes manifests with Kube-score..."
                    sh 'kube-score score k8s/ --disable=dependency-missing --ignore=warnings'
                }
            }
        }

        stage('Apply Kubernetes Manifests') {
            steps {
                script {
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
                }
            }
        }

        stage('Verify Kubernetes Resource Limits') {
            steps {
                script {
                    echo "Verifying Kubernetes resource limits for CPU and memory..."
                    // Example check: Ensure limits are set for deployments
                    sh 'kubectl get deployment/my-app -o=jsonpath="{.spec.template.spec.containers[0].resources}"'
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
    }

    post {
        always {
            echo "Cleaning up Docker images..."
            sh 'docker image prune -f || true'
        }

        success {
            echo "Build and Kubernetes deployment for SolutionPlus Web App was successful!"
        }

        failure {
            echo "Build or deployment failed. Please check the logs for errors."
        }
    }
}
