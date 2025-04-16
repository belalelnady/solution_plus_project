pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'Dockerfile'
        KUBE_NAMESPACE = 'default'
        GIT_REPO = 'https://github.com/belalelnady/solution_plus_project.git'
        GIT_BRANCH = 'aya'
    }

    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'jenkins-agent', url: "${GIT_REPO}", branch: "${GIT_BRANCH}"
            }
        }

        stage('Code Analysis') {
            steps {
                sh 'npm install'
                sh 'npm run lint'
                sh 'npm run test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    try {
                        sh "docker build -t ${DOCKER_IMAGE}:latest ."
                    } catch (e) {
                        error "Docker build failed: ${e}"
                    }
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    try {
                        sh "trivy image ${DOCKER_IMAGE}:latest --exit-code 1 --severity HIGH,CRITICAL"
                    } catch (e) {
                        error "Trivy scan found critical vulnerabilities: ${e}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    try {
                        sh "kubectl apply -n ${KUBE_NAMESPACE} -f your-manifest.yaml"
                        sh "kubectl rollout status deployment/your-deployment-name -n ${KUBE_NAMESPACE} --timeout=60s"
                    } catch (e) {
                        error "Kubernetes deployment failed: ${e}"
                    }
                }
            }
        }

        stage('Integration Tests') {
            steps {
                script {
                    try {
                        sh 'npm run integration-test'
                    } catch (e) {
                        error "Integration tests failed: ${e}"
                    }
                }
            }
        }

        stage('Monitoring Setup') {
            steps {
                script {
                    try {
                        sh 'kubectl apply -n monitoring -f prometheus.yaml'
                        sh 'kubectl apply -n monitoring -f grafana.yaml'
                    } catch (e) {
                        error "Monitoring setup failed: ${e}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

-------------------------------------------------
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'Dockerfile'
        KUBE_NAMESPACE = 'default'
        GIT_REPO = 'https://github.com/belalelnady/solution_plus_project.git'
        GIT_BRANCH = 'aya'
    }

    stages {

        stage('Build Docker Image') {
            steps {
                script {
                    try {
                        sh "docker build -t ${DOCKER_IMAGE}:latest ."
                    } catch (e) {
                        error "Docker build failed: ${e}"
                    }
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    try {
                        sh "trivy image ${DOCKER_IMAGE}:latest --exit-code 1 --severity HIGH,CRITICAL"
                    } catch (e) {
                        error "Trivy scan found critical vulnerabilities: ${e}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    try {
                        sh "kubectl apply -n ${KUBE_NAMESPACE} -f your-manifest.yaml"
                        sh "kubectl rollout status deployment/your-deployment-name -n ${KUBE_NAMESPACE} --timeout=60s"
                    } catch (e) {
                        error "Kubernetes deployment failed: ${e}"
                    }
                }
            }
        }

        stage('Integration Tests') {
            steps {
                script {
                    try {
                        sh 'npm run integration-test'
                    } catch (e) {
                        error "Integration tests failed: ${e}"
                    }
                }
            }
        }

        stage('Monitoring Setup') {
            steps {
                script {
                    try {
                        sh 'kubectl apply -n monitoring -f prometheus.yaml'
                        sh 'kubectl apply -n monitoring -f grafana.yaml'
                    } catch (e) {
                        error "Monitoring setup failed: ${e}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
--------------------------------------------------
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'Dockerfile'
        KUBE_NAMESPACE = 'default'
        GIT_REPO = 'https://github.com/belalelnady/solution_plus_project.git'
        GIT_BRANCH = 'aya'
    }

    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'jenkins-agent', url: "${GIT_REPO}", branch: "${GIT_BRANCH}"
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    try {
                        sh "docker build -t ${DOCKER_IMAGE}:latest ."
                    } catch (e) {
                        error "Docker build failed: ${e}"
                    }
                }
            }
        }

       stage('Trivy Scan') {
    steps {
        script {
            def trivyOutput = sh(script: "trivy image ${DOCKER_IMAGE}:latest --format json", returnStdout: true).trim()
            def trivyResults = readJSON text: trivyOutput

            if (trivyResults?.Results?.any { it?.Weaknesses?.find { it.Severity == "CRITICAL" } }) {
                error "Critical Weaknesses found. Sending report."
                mail to: 'aya@gmail.com', subject: 'Critical Weaknesses Found', body: "Critical Weaknesses found in Trivy scan."
            } else {
                echo "No critical Weaknesses found. Continuing pipeline."
            }
        }
    }
}

        stage('Deploy to Kubernetes') {
    steps {
        script {
            try {
                sh "kubectl apply -n ${KUBE_NAMESPACE} -f manifest-files"
                if (sh(script: 'echo $?', returnStdout: true).trim() != '0') {
                    error "kubectl apply failed."
                }
                sh "kubectl wait --for=condition=Available --timeout=120s deployment/app-deployment.yml -n ${KUBE_NAMESPACE}"
                sh "kubectl wait --for=condition=Available --timeout=120s deployment/mysql-deployment.yml -n ${KUBE_NAMESPACE}"

                echo "Kubernetes deployments successful."

            } catch (e) {
                error "Kubernetes deployment failed: ${e}"
            }
        }
    }
}

       stage('Integration Tests') {
    steps {
        script {
            try {
                def integrationTestOutput = sh(script: 'npm run integration-test', returnStdout: true).trim()
                if (integrationTestOutput.contains('FAILED')) {
                    error "Integration tests failed. Check logs for details."
                }

                echo integrationTestOutput

            } catch (e) {
                retry(2) {
                    sh(script: 'npm run integration-test', timeout: 150)
                }
                error "Integration tests failed after retry: ${e}"
            }
        }
    }
}

        stage('Monitoring Setup') {
            steps {
                script {
                    try {
                        sh 'kubectl apply -n monitoring -f prometheus.yaml'
                        sh 'kubectl apply -n monitoring -f grafana.yaml'
                    } catch (e) {
                        error "Monitoring setup failed: ${e}"
                    }
                }
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}