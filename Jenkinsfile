pipeline {
    agent { label 'worker' }  // Runs the pipeline on Jenkins VM

    environment {
        GITHUB_TOKEN = credentials('github-token') // GitHub token stored in Jenkins credentials
        DOCKER_CREDENTIALS = credentials('dockerhub-token') // Docker Hub token
        DOCKER_HUB_USERNAME = 'salmahesham1114'  // Your Docker Hub username
        IMAGE_REPO = 'salmahesham1114/solution_plus_project' // Docker Hub repo
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    sh """
                        rm -rf solution_plus_project  # Ensure a clean workspace
                        git clone https://\$GITHUB_TOKEN@github.com/belalelnady/solution_plus_project.git
                        cd solution_plus_project
                        git checkout salma
                    """
                }
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

        stage('Build and Push Docker Images on Jenkins VM') {
            when {
                expression { env.BUILD_IMAGES == 'true' } // Only build images if they are missing
            }
            steps {
                script {
                    def appDir = "solution_plus_project/application"

                    sh """
                        set -e  # Exit on error

                        cd ${appDir}
                        echo "Logging into Docker Hub..."
                        echo "\$DOCKER_CREDENTIALS_PSW" | docker login -u "\$DOCKER_CREDENTIALS_USR" --password-stdin

                        echo "Building first Docker image: Web App"
                        docker build -t \$IMAGE_REPO:web-img-latest -f Dockerfile .
                        docker push \$IMAGE_REPO/web-img:latest

                        echo "Building second Docker image: MySQL"
                        docker build -t \$IMAGE_REPO:db-img-latest -f Docker-mysql .
                        docker push \$IMAGE_REPO/db-img:latest

                        echo "Docker images pushed successfully!"

                        docker logout
                    """
                }
            }
        }

        stage('Scan Images with Trivy and Generate Report') {
            steps {
                script {
                    sh """
                        set -e
                        
                        # Create a reports directory
                        mkdir -p trivy_reports

                        echo "Scanning web-img from Docker Hub..."
                        trivy image \$DOCKER_HUB_USERNAME/web-img:latest > trivy_reports/web-img-report.txt || true

                        echo "Scanning db-img from Docker Hub..."
                        trivy image \$DOCKER_HUB_USERNAME/db-img:latest > trivy_reports/db-img-report.txt || true

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
    }
}
