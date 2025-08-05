FROM jupyter/base-notebook:latest

##############################
# Step 1: Install Node.js 22, npm, & Git
##############################
USER root
RUN apt-get update && apt-get install -y curl gnupg git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs tree && \
    npm install -g yarn
#     apt-get install -y nodejs tree 
#     apt-get install -y nodejs tree && \
#     npm install -g yarn

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
RUN rm -rf node_modules package-lock.json yarn.lock
RUN jlpm install && jlpm add typescript webpack webpack-cli ts-loader raw-loader && \
	jlpm build && pip install .

WORKDIR /home/jovyan

# Copy and make the startup script executable inside the image
COPY start-dev.sh .
RUN chmod +x ./start-dev.sh
RUN mkdir -p /home/jovyan/.jupyter
COPY jupyter_server_config.py /home/jovyan/.jupyter/

# Cleanup script
COPY start-notebook.d/cleanup.sh /usr/local/bin/start-notebook.d/cleanup.sh
RUN chmod +x /usr/local/bin/start-notebook.d/cleanup.sh

# Expose the default JupyterLab port
EXPOSE 8888
