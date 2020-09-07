const compose = require("docker-compose");
const { 
    getInstanceById, 
    updateInstance, 
    updateDeploymentByPayloadLocal, 
    updateDeploymentByPayloadCloud 
} = require("../utils.js");
const { 
    kubernetesUp, 
    kubernetesDown
} = require("./kubernetes.js");

const dockerComposeTemplate = require('./templates/docker-compose.json');
const kubernetesDeploymentTemplate = require('./templates/kubernetes-template.json');

// Fetch a specific docker-compose template (json instead of yaml)
const getDeployment = (isLocal) => {
    if (isLocal){
        return dockerComposeTemplate;
    }else{
        return kubernetesDeploymentTemplate;
    }
}

// Start a deployment
const startDeployment = (payload, isLocal) => {
    // fetch the deployment configuration in the form of a docker compose file
    let deployment= getDeployment(isLocal);
    // make some adjustments to the template based on the specifics of this deployment
    deployment = updateDeployment(payload, deployment, isLocal);
    // store a reference to this deployment in the DB
    updateInstance(payload.instanceId, deployment);
    return deploymentUp(deployment, isLocal);
}

// Stop a deployment
const stopDeployment = async (payload, isLocal) => {
    //  get a reference to the deployment file from the db
    let deploymentInstance = await getInstanceById(payload.instanceId);
    let deployment = deploymentInstance.deployment;
    return deploymentDown(deployment, isLocal);
}

const updateDeployment = (payload, deployment, isLocal) => {
    if (isLocal){
        return updateDeploymentByPayloadLocal(deployment, payload);;
    }else{
        return updateDeploymentByPayloadCloud(deployment, payload);;
    }
}

const deploymentUp = (deployment, isLocal) => {
    // use either docker-compose or kubernetes depending on
    // whether this is a local running deployment or cloud based
    if (isLocal){
        return compose.upAll({ cwd: deployment, log: true });
    }else{
        return kubernetesUp(deployment);
    }
}

const deploymentDown = (deployment, isLocal) => {
    // use either docker-compose or kubernetes depending on
    // whether this is a local running deployment or cloud based
    if (isLocal){
        return compose.down({ cwd: deployment, log: true });
    }else{
        return kubernetesDown(deployment);
    }
}

module.exports = {
    startDeployment,
    stopDeployment,
    getDeployment,
    updateDeployment,
    deploymentUp,
    deploymentDown
}