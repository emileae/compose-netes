const { 
    startDeployment,
    stopDeployment,
    getDeployment, 
    updateDeployment
} = require('./composeDeployment.js');

const compose = require("docker-compose");

let payload = {
    id: "SomestringID1234567u",
    runMode: 'scenario',
    projectId: 'testProj',
    isLocal: true,
    environment: [
        {
            container: "orchestrator",
            name: "TEST_ENV",
            value: "test_value"
        }
    ]
}
const expectedDeploymentLocal = {
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
			"environment": [],
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
};
const expectedUpdatedDeploymentLocal = {
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

const expectedDeploymentCloud = {
	"apiVersion": "apps/v1",
	"kind": "Deployment",
	"metadata": {
		"name": "",
		"labels": {
			"app": ""
		}
	},
	"spec": {
		"replicas": 3,
		"selector": {
			"matchLabels": {
				"app": ""
			}
		},
		"template": {
			"metadata": {
				"labels": {
					"app": ""
				}
			},
			"spec": {
				"containers": [{
					"name": "containerA",
					"image": "eu.gcr.io/myProj/containerA",
					"ports": [{
						"containerPort": 5672
					}, {
						"containerPort": 15672
					}]
				}, {
					"name": "orchestrator",
					"image": "eu.gcr.io/myProj/orchestrator",
					"ports": [{
						"containerPort": 8080
					}],
					"env": [{
						"name": "SIM_MODE",
						"value": "kubernetes"
					}],
					"volumeMounts": {
						"name": "site-case",
						"mountPath": "/site/case"
					}
				}, {
					"name": "engine",
					"image": "eu.gcr.io/myProj/engine",
					"volumeMounts": {
						"name": "site-case",
						"mountPath": "/site/case"
					}
				}]
			}
		}
	}
}
const expectedUpdatedDeploymentCloud = {
	"apiVersion": "apps/v1",
	"kind": "Deployment",
	"metadata": {
		"name": "somestringid1234567u",
		"labels": {
			"app": "scenario"
		}
	},
	"spec": {
		"replicas": 3,
		"selector": {
			"matchLabels": {
				"app": "scenario"
			}
		},
		"template": {
			"metadata": {
				"labels": {
					"app": "scenario"
				}
			},
			"spec": {
				"containers": [{
					"name": "containerA",
					"image": "eu.gcr.io/myProj/containerA",
					"ports": [{
						"containerPort": 5672
					}, {
						"containerPort": 15672
					}]
				}, {
					"name": "orchestrator",
					"image": "eu.gcr.io/myProj/orchestrator",
					"ports": [{
						"containerPort": 8080
					}],
					"env": [{
						"name": "SIM_MODE",
						"value": "kubernetes"
					}, {
						"name": "TEST_ENV",
						"value": "test_value"
					}],
					"volumeMounts": {
						"name": "site-case",
						"mountPath": "/site/case"
					}
				}, {
					"name": "engine",
					"image": "eu.gcr.io/myProj/engine",
					"volumeMounts": {
						"name": "site-case",
						"mountPath": "/site/case"
					}
				}]
			}
		}
	}
}

jest.mock('docker-compose');

test('returns correct deployment file for local deployment', () => {
    const composeDeploymentLocal = getDeployment(true);
    expect(composeDeploymentLocal).toMatchObject(expectedDeploymentLocal);
});
test('returns correct deployment file for cloud deployment', () => {
    const k8sDeploymentCloud = getDeployment(false);
    expect(k8sDeploymentCloud).toMatchObject(expectedDeploymentCloud);
});

test('updates local deployment correctly', () => {
    const composeDeploymentLocal = getDeployment(true);
    const updatedDeployment = updateDeployment(payload, composeDeploymentLocal, true);
    expect(updatedDeployment).toMatchObject(expectedUpdatedDeploymentLocal);
})
test('updates cloud deployment correctly', () => {
    const k8sDeploymentLocal = getDeployment(false);
    const updatedDeployment = updateDeployment(payload, k8sDeploymentLocal, false);
    expect(updatedDeployment).toMatchObject(expectedUpdatedDeploymentCloud);
})

test('starting a deployment in local mode calls the correct function with the correct deployment file', async () => {
    const respUp = 'compose up all';
    compose.upAll.mockResolvedValue(respUp);
    const startDeploymentResponse = await startDeployment(payload, true);
    expect(startDeploymentResponse).toBe(respUp);
    expect(compose.upAll).toHaveBeenCalledWith({
        cwd: expectedUpdatedDeploymentLocal, 
        log: true
    });
})

test('stopping a deployment in local mode calls the correct function with the correct deployment file', async () => {
    const respDown = 'compose down';
    compose.down.mockResolvedValue(respDown);
    const stopDeploymentResponse = await stopDeployment(payload, true);
    expect(stopDeploymentResponse).toBe(respDown);
    expect(compose.down).toHaveBeenCalledWith({
        cwd: expectedUpdatedDeploymentLocal, 
        log: true
    });
})

test('starting a deployment in cloud mode calls the correct function with the correct deployment file', async () => {
    const respUp = 'k8s up';
    const startDeploymentResponse = await startDeployment(payload, false);
    expect(startDeploymentResponse).toBe(respUp);
})

test('stopping a deployment in cloud mode calls the correct function with the correct deployment file', async () => {
    const respDown = 'k8s down';
    const stopDeploymentResponse = await stopDeployment(payload, false);
    expect(stopDeploymentResponse).toBe(respDown);
})