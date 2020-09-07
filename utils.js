const getInstanceById = async (id) => {
    // database interface
    // const instance = await api.services.instance.findOne({id});
    // fake return instance
    const instance = {
        deployment: {
            "version": "3",
            "services": {
                "containerA": {
                    "image": "eu.gcr.io/myProj/containerA",
                    "restart": "unless-stopped",
                    "ports": ["5672:5672", "15672:15672"]
                },
                "orchestrator": {
                    "image": "eu.gcr.io/myProj/orchestrator",
                    "volumes": ["site-case:/site/case", "localStorage:/storage"],
                    "environment": ["TEST_ENV=test_value"],
                    "depends_on": ["containerA", "engine"]
                },
                "engine": {
                    "image": "eu.gcr.io/myProj/engine",
                    "restart": "unless-stopped",
                    "environment": ["PYTHONUNBUFFERED=0"],
                    "volumes": ["site-case:/site/case", "localstorage:/storage"],
                    "depends_on": ["containerA"]
                }
            },
            "volumes": {
                "localStorage": {
                    "external": true
                },
                "site-case": null
            },
            "networks": {
                "default": {
                    "external": {
                        "name": "my-net"
                    }
                }
            }
        }
    };
    return instance;
}

const updateInstance = async (id, deployment) => {
    // database interface
    // const instance = await api.services.instance.update({id}, {deployment});
    // fake return instance
    const instance = {deployment};
    return instance;
}

const getContainerIndex = (containerCollection, containerName) => {
    let containerIndex = undefined;
    for (var i=0; i<containerCollection.length; i++){
        if (containerCollection[i].name === containerName){
            containerIndex = i;
            break;
        }
    }
    return containerIndex;
}

const updateDeploymentByPayloadLocal = (deployment, payload) => {
    deployment.services.orchestrator.environment = [];
    payload.environment.forEach((en) => {
        deployment.services[en.container].environment.push(`${en.name}=${en.value}`)
    })
    return deployment;
}

const updateDeploymentByPayloadCloud = (deployment, payload) => {
    deployment.metadata.name = payload.id.toLowerCase();
    deployment.metadata.labels.app = payload.runMode;
    deployment.spec.selector.matchLabels.app = payload.runMode;
    deployment.spec.template.metadata.labels.app = payload.runMode;

    // copy environment variables from docker-compose
    payload.environment.forEach((en) => {
        let containerIndex = getContainerIndex(deployment.spec.template.spec.containers, en.container);
        deployment.spec.template.spec.containers[containerIndex].env.push({
            "name": en.name,
            "value": en.value
        })
    })
    return deployment;
}

module.exports = {
    getInstanceById,
    updateInstance,
    updateDeploymentByPayloadLocal,
    updateDeploymentByPayloadCloud
}