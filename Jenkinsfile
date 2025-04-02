pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'Dockerfile'
        KUBE_NAMESPACE = 'default'
        GIT_REPO = 'https://github.com/belalelnady/solution_plus_project.git'
        GIT_BRANCH = 'aya'
    }

    stages {

        stage('Code Analysis') {
            steps {
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
