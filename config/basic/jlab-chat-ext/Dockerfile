FROM jupyter/base-notebook:latest

##############################
# Step 1: Install Node.js 22, npm, & Git
##############################
USER root
RUN apt-get update && apt-get install -y curl gnupg git tree && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    rm -rf /var/lib/apt/lists/*

##############################
# Step 2: Install JupyterLab & core extensions
##############################
RUN pip install --no-cache-dir --upgrade jupyterlab jupyter-collaboration

##############################
# Step 3: Copy frontend + serverextension
##############################
WORKDIR /home/jovyan
COPY frontend /home/jovyan/frontend
COPY serverextension /home/jovyan/serverextension

##############################
# Step 4: Build frontend first
##############################
WORKDIR /home/jovyan/frontend
RUN rm -rf node_modules yarn.lock && \
    jlpm install && \
    jlpm build

##############################
# Step 5: Copy built labextension into serverextension
##############################
RUN mkdir -p /home/jovyan/serverextension/src/jlab_chat_ext/labextension && \
    cp -r jlab_chat_ext/labextension/* /home/jovyan/serverextension/src/jlab_chat_ext/labextension/

##############################
# Step 6: Install serverextension
##############################
WORKDIR /home/jovyan/serverextension
# Install editable package; entry point in pyproject.toml registers server extension
RUN pip install --no-cache-dir -e . && \
    jupyter server extension enable jlab_chat_ext && \
    jupyter server extension list

##############################
# Step 7: Install frontend extension in JupyterLab
##############################
WORKDIR /home/jovyan/frontend
# Install without rebuilding (already built), then build Lab once
RUN jupyter labextension install . --no-build && \
    jupyter lab build

##############################
# Step 8: Dev startup scripts
##############################
WORKDIR /home/jovyan
COPY start-dev.sh .
RUN chmod +x ./start-dev.sh

RUN mkdir -p /home/jovyan/.jupyter
COPY jupyter_server_config.py /home/jovyan/.jupyter/

COPY start-notebook.d/cleanup.sh /usr/local/bin/start-notebook.d/cleanup.sh
RUN chmod +x /usr/local/bin/start-notebook.d/cleanup.sh

##############################
# Step 9: Expose Jupyter port
##############################
EXPOSE 8888
WORKDIR /home/jovyan
