// just using dummy kubernetes functions for starting & stopping

const kubernetesUp = (deployment) => {
    // kubernetes function/class normally fetches compute resource information, endpoint, credentials etc
    // the kubernetes API is then called to start the deployment/replicaset/job
    // POST the deployment to something like http://127.0.0.1:8001/apis/apps/v1/namespaces/default/deployments

    return "k8s up"
}

const kubernetesDown = (deployment) => {
    // kubernetes function/class normally fetches compute resource information, endpoint, credentials etc
    // the kubernetes API is then called to start the deployment/replicaset/job
    // POST http://127.0.0.1:8001/apis/apps/v1/namespaces/default/deployments/deployment-name
    // setting the proper grace period is important since a deployment should be taken down as quickly as possible
    // so that potentially a new one with the same ID can be restarted

    return 'k8s down'
}

module.exports = {
    kubernetesUp,
    kubernetesDown
}