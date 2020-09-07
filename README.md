**Deployment Starter**
Very simple script to start either a docker-compose or a kubernetes deployment.

Two templates need to be provided, one for docker-compose and one for kubernetes. These will be populated based on a payload, the specifics of the customization can be configured in the updateDeploymentByPayloadLocal / updateDeploymentByPayloadCloud functions in the utils.js file.

A tool like [Kompose](https://github.com/kubernetes/kompose) could be used for the same purpose (specifically converting a docker-compose yaml file to a kubernetes deployment and even running it), but the additional tooling is not always a benefit... at least its probably worth a test.

in composeDeployment.js either startDeployment or stopDeployment is called with the deployment payload/config, the function should result in either docker-compose up being called or a (not yet implemented) kubernetes API call to start/stop the generated deployment.

[docker-compose](https://www.npmjs.com/package/docker-compose) npm library is used to start docker-compose .yml deployments, but there are some modifications needed, such as modifying the library to accept a deployment file string instead of a file path (see [this issue](https://github.com/PDMLab/docker-compose/issues/109#issuecomment-678043296)).

There are also some technicalities when trying to call docker-compose up from within a docker container, such as making sure that docker-compose is accessible from the running docker container:

in Dockerfile
```
# Docker-Compose
# https://docs.docker.com/compose/install/
RUN curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose
RUN ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
RUN curl -L https://raw.githubusercontent.com/docker/compose/1.26.0/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose
RUN docker-compose --version
# END Docker-Compose
```