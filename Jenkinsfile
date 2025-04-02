/*
Jenkins Pipeline for SolutionPlus Web Application Deployment
Purpose: Automates build, security scan, and deployment of web app and MySQL to Kubernetes
Author: DevOps Team
*/

pipeline {
    // Execute pipeline on pre-configured worker node labeled 'worker'
    agent { label 'jenkins-agent' }  

    stages {
        // Cleanup stage to ensure fresh workspace for each build
        stage('Purge Previous Artifacts') {
            steps {
                sh '''
                    echo "Removing old workspace artifacts to ensure a clean build..."
                    rm -rf solution_plus_project || true
                '''
            }
        }

        /*
        Docker Image Build Stage:
        - Uses Kubernetes pod agent with dynamic pod definition
        - Builds web application Docker image
        - Pushes to private Docker Hub repository
        */
        stage('Construct and Upload Web App Image') {
            agent {
                kubernetes {
                    yamlFile 'dynamic-docker-build.yaml'  // Contains pod template with Docker tools
                }
            }
            steps {
                container('docker') {
                    script {
                        // Image configuration variables
                        def applicationDir = "application"
                        def dockerRepo = 'mohamedamr99t/solutionplus-final'
                        def imageTag = "${dockerRepo}:web-img-latest"

                        // Securely authenticate with Docker Hub using Jenkins credentials
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-id', 
                                                        usernameVariable: 'DOCKER_USER', 
                                                        passwordVariable: 'DOCKER_PASS')]) {
                            sh '''
                                set -e  # Exit on any error

                                echo "Navigating to the application source directory..."
                                cd ''' + applicationDir + '''

                                echo "Authenticating with Docker Hub..."
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                                echo "Building the web application Docker image..."
                                docker build -t ''' + imageTag + ''' -f Dockerfile .

                                echo "Pushing the image to Docker Hub..."
                                docker push ''' + imageTag + '''

                                echo "Image successfully uploaded to Docker Hub!"

                                echo "Logging out from Docker Hub..."
                                docker logout
                            '''
                        }
                    }
                }
            }
        }

        /*
        Security Scanning Stage:
        - Uses Trivy to scan built Docker image for vulnerabilities
        - Generates report while continuing pipeline even if vulnerabilities found
        */
        stage('Perform Security Scan on Web App Image') {
            steps {
                script {
                    def dockerRepo = 'mohamedamr99t/solutionplus-final'
                    def imageTag = "${dockerRepo}:web-img-latest"

                    sh '''
                        set -e  # Exit on any error

                        echo "Creating directory for Trivy scan reports..."
                        mkdir -p security_scan_reports

                        echo "Running Trivy security scan on the web app image..."
                        trivy image --exit-code 1 --no-progress ''' + imageTag + ''' > security_scan_reports/web-app-scan-report.txt 2>/dev/null || true

                        echo "Security scan completed! Report saved in security_scan_reports/"
                    '''
                }
            }
        }

        // Artifact Archival Stage: Stores security reports for audit purposes
        stage('Store Security Scan Results') {
            steps {
                archiveArtifacts artifacts: 'security_scan_reports/*.txt', fingerprint: true
                echo "Security scan reports have been archived for review."
            }
        }

        /*
        Kubernetes Deployment Stage:
        - Applies all Kubernetes manifests in sequence
        - Includes configuration, secrets, volumes, deployments and services
        - Verifies successful rollout of both web app and MySQL
        */
        stage('Apply Kubernetes Manifests') {
            steps {
                script {
                    sh '''
                        set -e  # Exit on any error

                        echo "Current working directory:"
                        pwd

                        echo "Navigating to the Kubernetes manifests directory..."
                        cd k8s

                        echo "Applying Kubernetes manifests to the cluster..."
                        # Apply configuration and secrets first
                        kubectl apply -f my-app-secret.yaml || { echo "Failed to apply my-app-secret.yaml"; exit 1; }
                        kubectl apply -f mysql-secret.yaml || { echo "Failed to apply mysql-secret.yaml"; exit 1; }
                        kubectl apply -f myapp-config.yaml || { echo "Failed to apply myapp-config.yaml"; exit 1; }
                        kubectl apply -f mysql-config.yaml || { echo "Failed to apply mysql-config.yaml"; exit 1; }
                        
                        # Apply configmaps
                        kubectl apply -f mysql-db-cm1-configmap.yaml || { echo "Failed to apply mysql-db-cm1-configmap.yaml"; exit 1; }
                        kubectl apply -f mysql-db-cm2-configmap.yaml || { echo "Failed to apply mysql-db-cm2-configmap.yaml"; exit 1; }
                        
                        # Apply storage configuration before deployments
                        kubectl apply -f mysql-pv.yaml || { echo "Failed to apply mysql-pv.yaml"; exit 1; }
                        kubectl apply -f mysql-data-persistentvolumeclaim.yaml || { echo "Failed to apply mysql-data-persistentvolumeclaim.yaml"; exit 1; }
                        
                        # Apply deployments
                        kubectl apply -f mysql-db-deployment.yaml || { echo "Failed to apply mysql-db-deployment.yaml"; exit 1; }
                        kubectl apply -f my-app-deployment.yaml || { echo "Failed to apply my-app-deployment.yaml"; exit 1; }
                        
                        # Apply services
                        kubectl apply -f mysqldb-service.yaml || { echo "Failed to apply mysqldb-service.yaml"; exit 1; }
                        kubectl apply -f my-app-service.yaml || { echo "Failed to apply my-app-service.yaml"; exit 1; }
                        
                        # Apply ingress last
                        kubectl apply -f ingress.yaml || { echo "Failed to apply ingress.yaml"; exit 1; }

                        echo "Monitoring deployment rollout for the web app..."
                        kubectl rollout status deployment/my-app --timeout=300s || { echo "Web app deployment rollout failed"; exit 1; }

                        echo "Monitoring deployment rollout for the MySQL database..."
                        kubectl rollout status deployment/mysql-db --timeout=300s || { echo "MySQL deployment rollout failed"; exit 1; }

                        echo "Kubernetes deployment completed successfully!"
                    '''
                }
            }
        }
    }

    /*
    Post-build Actions:
    - Always executes, even if pipeline fails
    - Cleans up Docker images to conserve disk space
    */
    post {
        always {
            script {
                echo "Cleaning up Docker images on the worker node to free up space..."
                sh '''
                    docker image prune -f || true
                '''
            }
        }
    }
}
