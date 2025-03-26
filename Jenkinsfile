pipeline {
    agent { label 'worker' }  // Runs the pipeline on Jenkins VM

    environment {
        GITHUB_TOKEN = credentials('github-token') // GitHub token stored in Jenkins credentials
        DOCKER_CREDENTIALS = credentials('dockerhub-token') // Docker Hub token
        DOCKER_HUB_USERNAME = 'salmahesham1114'  // Your Docker Hub username
        IMAGE_REPO = 'salmahesham1114/solution_plus_project' // Docker Hub repo
    }

    stages {

        stage('Clean old files if exist') {
            steps {
                sh "rm -rf solution_plus_project"  // Clean old files if exist
            }
        }

        stage('Check Docker Images in Repo') {
            steps {
                script {
                    def webImageExists = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' https://hub.docker.com/v2/repositories/\$IMAGE_REPO/tags/web-img-latest/",
                        returnStdout: true
                    ).trim()

                    def dbImageExists = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' https://hub.docker.com/v2/repositories/\$IMAGE_REPO/tags/db-img-latest/",
                        returnStdout: true
                    ).trim()

                    if (webImageExists != '200' || dbImageExists != '200') {
                        echo "Docker images are missing in the repository. Proceeding to build them..."
                        env.BUILD_IMAGES = 'true'  // Flag to trigger image building
                    } else {
                        echo "Both Docker images are available in the repository. Proceeding with deployment."
                        env.BUILD_IMAGES = 'false'
                    }
                }
            }
        }

        stage('Build and Push Docker Images in Kubernetes Pod') {
            when {
                expression { env.BUILD_IMAGES == 'true' } // Only build images if they are missing
            }
            agent {
                kubernetes {
                    yamlFile 'dynamic-docker-build.yaml' // Uses external YAML pod definition
                }
            }
            steps {
                container('docker') {
                    script {
                        def appDir = "application"

                        sh """
                            set -e  # Exit on error

                            echo "Cloning source code inside the Pod..."
                            rm -rf solution_plus_project  # Clean old files if exist
                            git clone https://\$GITHUB_TOKEN@github.com/belalelnady/solution_plus_project.git
                            cd solution_plus_project
                            git checkout salma

                            echo "Moving into application directory..."
                            cd ${appDir}

                            echo "Logging into Docker Hub..."
                            echo "\$DOCKER_CREDENTIALS_PSW" | docker login -u "\$DOCKER_CREDENTIALS_USR" --password-stdin

                            echo "Building first Docker image: Web App"
                            docker build -t \$IMAGE_REPO:web-img-latest -f Dockerfile .
                            docker push \$IMAGE_REPO:web-img-latest

                            echo "Building second Docker image: MySQL"
                            docker build -t \$IMAGE_REPO:db-img-latest -f Docker-mysql .
                            docker push \$IMAGE_REPO:db-img-latest

                            echo "Docker images pushed successfully!"

                            docker logout
                        """
                    }
                }
            }
        }

        stage('Scan Images with Trivy and Generate Report') {
            steps {
                script {
                    sh """
                        set -e
                        mkdir -p trivy_reports

                        echo "Scanning Web App Image..."
                        trivy image --exit-code 1 --no-progress ${IMAGE_REPO}:web-img-latest > trivy_reports/web-img-report.txt 2>/dev/null || true

                        echo "Scanning MySQL Image..."
                        trivy image --exit-code 1 --no-progress ${IMAGE_REPO}:db-img-latest > trivy_reports/db-img-report.txt 2>/dev/null || true


                        echo "Security scan completed! Reports saved in trivy_reports/"
                    """
                }
            }
        }

        stage('Archive Trivy Reports') {
            steps {
                archiveArtifacts artifacts: 'trivy_reports/*.txt', fingerprint: true
                echo "Trivy reports archived for review."
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh """
                        pwd
                        cd manifest-files
                        echo "Deleting existing Kubernetes resources..."
                        # Ignore errors if resources do not exist
                        kubectl delete deployment mysql-deployment --ignore-not-found=true
                        kubectl delete deployment app-deployment --ignore-not-found=true
                        kubectl delete service mysql-service --ignore-not-found=true
                        kubectl delete service app-service --ignore-not-found=true
                        kubectl delete pvc mysql-pvc --ignore-not-found=true
                        kubectl delete configmap app-config --ignore-not-found=true
                        kubectl delete configmap mysql-config --ignore-not-found=true
                        kubectl delete secret app-secrets --ignore-not-found=true

                        echo "Deploying application using Kubernetes manifests..."
                        kubectl apply -f secrets.yml
                        kubectl apply -f configmap.yml
                        kubectl apply -f configmap-mysql.yml
                        kubectl apply -f pvc.yml
                        kubectl apply -f mysql-deployment.yml
                        kubectl apply -f app-deployment.yml
                        kubectl apply -f mysql-service.yml
                        kubectl apply -f app-service.yml
                        echo "Deployment completed!"
                    """
                }
            }
        }
    }
}