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
	
##############################
# Step 3: Copy frontend and build it
##############################
COPY frontend /home/jovyan/frontend
WORKDIR /home/jovyan/frontend
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
