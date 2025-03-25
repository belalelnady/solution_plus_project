pipeline {
    agent { label 'worker' }  // Runs the pipeline on Jenkins VM

    environment {
        GITHUB_TOKEN = credentials('github-token') // GitHub token stored in Jenkins credentials
        DOCKER_CREDENTIALS = credentials('dockerhub-tocken') // Docker Hub token
        DOCKER_HUB_USERNAME = 'salmahesham1114'  // Your Docker Hub username
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
                    yamlFile 'dynamic-docker-build.yaml' // Uses external YAML pod definition
                }
            }
            steps {
                container('docker') {
                    script {
                        def appDir = "solution_plus_project/application"
                        def webImageExists = sh(
                            script: "curl -s -o /dev/null -w '%{http_code}' https://hub.docker.com/v2/repositories/\$DOCKER_HUB_USERNAME/web-img/tags/latest/",
                            returnStdout: true
                        ).trim()

                        def dbImageExists = sh(
                            script: "curl -s -o /dev/null -w '%{http_code}' https://hub.docker.com/v2/repositories/\$DOCKER_HUB_USERNAME/db-img/tags/latest/",
                            returnStdout: true
                        ).trim()

                        sh """
                            set -e  # Exit on error

                            echo "Moving into application directory..."
                            cd ${appDir}

                            echo "Logging into Docker Hub..."
                            echo "\$DOCKER_CREDENTIALS_PSW" | docker login -u "\$DOCKER_CREDENTIALS_USR" --password-stdin
                        """

                        if (webImageExists != '200') {
                            echo "Web image does not exist, building..."
                            sh """
                                docker build -t \$DOCKER_HUB_USERNAME/web-img:latest -f Dockerfile .
                                docker push \$DOCKER_HUB_USERNAME/web-img:latest
                            """
                        } else {
                            echo "Web image already exists on Docker Hub. Skipping build."
                        }

                        if (dbImageExists != '200') {
                            echo "DB image does not exist, building..."
                            sh """
                                docker build -t \$DOCKER_HUB_USERNAME/db-img:latest -f Docker-mysql .
                                docker push \$DOCKER_HUB_USERNAME/db-img:latest
                            """
                        } else {
                            echo "DB image already exists on Docker Hub. Skipping build."
                        }

                        sh "docker logout"
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


        stage('Archive Trivy Reports') {
            steps {
                archiveArtifacts artifacts: 'trivy_reports/*.txt', fingerprint: true
                echo "Trivy reports archived for review."
            }
        }
    }
}
