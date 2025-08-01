FROM jupyter/base-notebook:latest

##############################
# Step 1: Install Node.js 22, npm, & Git
##############################
USER root
RUN apt-get update && apt-get install -y curl gnupg git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs tree && \
    npm install -g yarn

##############################
# Step 2: Install JupyterLab & core extensions
##############################
RUN pip install --no-cache-dir --upgrade \
	jupyter-collaboration
#     jupyterlab==4.4.3 \
#     jupyterhub==5.2.1 \
#     jupyter-collaboration \
#     jupyterlab-link-share \
#     jupyter-server-ydoc \
#     jupyter-ydoc
    
# Set a working directory inside the container
# WORKDIR /home/jovyan/frontend

# Install copier, which is used to generate the extension from a template
# RUN pip install copier

# Generate the JupyterLab extension using the official template
# We'll name our extension 'my-simple-extension'
# The --trust-template flag is used to bypass the security prompt for the template
# The --defaults flag uses default answers for copier prompts, creating a very basic extension
# The --data name=my-simple-extension flag sets the project name
# RUN copier copy --trust-template --data name=jlab-chat-ext https://github.com/jupyterlab/extension-template.git jlab-chat-ext


##############################
# Step 3: Copy frontend and build it
##############################
COPY frontend /home/jovyan/frontend
WORKDIR /home/jovyan/frontend

# Install the extension's dependencies and then install the extension itself
# The 'jlpm' command is JupyterLab's wrapper around yarn/npm for managing frontend packages
# 'jlpm install' installs Node.js dependencies
# 'jlpm build' compiles the TypeScript/JavaScript code for the extension
# 'pip install .' installs the Python part of the extension (if any) and links the frontend part
# RUN jlpm add @jupyterlab/launcher socket.io-client
RUN rm -rf node_modules yarn.lock
RUN jlpm install && jlpm add typescript webpack webpack-cli && \
	jlpm build && pip install .

WORKDIR /home/jovyan

# Expose the default JupyterLab port
EXPOSE 8888

# Command to run JupyterLab when the container starts
# We use --allow-root because we're running as root inside the container (common for Docker)
# --no-browser prevents it from trying to open a browser window inside the container
# --ip=0.0.0.0 makes it accessible from outside the container
# CMD ["jupyter", "lab", "--allow-root", "--no-browser", "--ip=0.0.0.0"]
