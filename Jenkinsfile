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
        EMAIL_RECIPIENT = 'mohamedamr99t@gmail.com'  // Email to notify
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

        stage('Remove Unchanged Kubernetes Resources') {
            steps {
                script {
                    sh '''
                        set -e
                        echo "Removing unchanged Kubernetes resources..."
                        
                        # Delete unchanged resources in Kubernetes
                        kubectl delete deployment.apps/my-app --ignore-not-found=true || true
                        kubectl delete secret/my-app-secret --ignore-not-found=true || true
                        kubectl delete service/my-app --ignore-not-found=true || true
                        kubectl delete configmap/app-config --ignore-not-found=true || true
                        kubectl delete configmap/mysql-config --ignore-not-found=true || true
                        kubectl delete persistentvolumeclaim/mysql-data --ignore-not-found=true || true
                        kubectl delete configmap/mysql-db-cm1 --ignore-not-found=true || true
                        kubectl delete configmap/mysql-db-cm2 --ignore-not-found=true || true
                        kubectl delete deployment.apps/mysql-db --ignore-not-found=true || true
                        kubectl delete persistentvolume/mysql-pv --ignore-not-found=true || true
                        kubectl delete secret/mysql-secret --ignore-not-found=true || true
                        kubectl delete service/mysql-db --ignore-not-found=true || true
                    '''
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

        stage('Send Success Email') {
            steps {
                script {
                    sh '''
                        echo "Sending success email..."
                        echo "Build and Kubernetes deployment for SolutionPlus Web App was successful!" | mail -s "Build Success: SolutionPlus" $EMAIL_RECIPIENT
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}

