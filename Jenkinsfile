pipeline {
    agent { label 'worker' }  // Runs the pipeline on Jenkins VM

    environment {
        GITHUB_TOKEN = credentials('github-token') // GitHub token stored in Jenkins credentials
        DOCKER_CREDENTIALS = credentials('dockerhub-tocken') // Docker Hub token
        DOCKER_HUB_USERNAME = 'salmahesham1114'  // Your Docker Hub username
        LAST_COMMIT_FILE = 'last_commit.txt'  // Stores last built commit hash
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


        stage('Build and Push Docker Images in Kubernetes Pod') {
            agent {
                kubernetes {
                    yamlFile 'solution_plus_project/application/dynamic-docker-build.yaml' // Uses external YAML pod definition
                }
            }
            steps {
                container('docker') {
                    script {
                        def appDir = "solution_plus_project/application"

                        sh """
                            set -e  # Exit on error

                            echo "Moving into application directory..."
                            cd ${appDir}

                            echo "Logging into Docker Hub..."
                            echo "\$DOCKER_CREDENTIALS_PSW" | docker login -u "\$DOCKER_CREDENTIALS_USR" --password-stdin

                            echo "Building first Docker image: Web App"
                            docker build -t \$DOCKER_HUB_USERNAME/web-img:latest -f Dockerfile .

                            echo "Building second Docker image: MySQL"
                            docker build -t \$DOCKER_HUB_USERNAME/db-img:latest -f Docker-mysql .

                            echo "Pushing images to Docker Hub..."
                            docker push \$DOCKER_HUB_USERNAME/web-img:latest
                            docker push \$DOCKER_HUB_USERNAME/db-img:latest

                            echo "Docker images pushed successfully!"

                            docker logout
                        """
                    }
                }
            }
        }

        stage('Scan Images with Trivy and Generate Report') {
            agent { label 'worker' }  // Runs on Jenkins VM, where Trivy is installed
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

        stage('Save Last Commit') {
            steps {
                script {
                    def latestCommit = sh(script: "cd solution_plus_project && git rev-parse HEAD", returnStdout: true).trim()
                    writeFile file: LAST_COMMIT_FILE, text: latestCommit
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
