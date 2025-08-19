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
# Step 3: Copy extension source (frontend + server)
##############################
WORKDIR /home/jovyan
COPY frontend /home/jovyan/frontend
COPY serverextension /home/jovyan/serverextension

##############################
# Step 4: Install serverextension (Python)
##############################
WORKDIR /home/jovyan/serverextension
RUN pip install --no-cache-dir -e .
RUN jupyter server extension list && \
    jupyter server extension enable jlab_chat_ext

##############################
# Step 5: Build & install frontend extension
##############################
WORKDIR /home/jovyan/frontend

RUN rm -rf /opt/conda/share/jupyter/lab/staging && \
    rm -rf /opt/conda/share/jupyter/labextensions/jlab-chat-ext && \
    rm -rf node_modules yarn.lock && \
    jlpm install && \
    jlpm build && \
    jupyter labextension install . --no-build && \
    jupyter lab build

# Copy built labextension into serverextension
RUN mkdir -p /home/jovyan/serverextension/src/jlab_chat_ext/labextension && \
    cp -r /home/jovyan/frontend/jlab_chat_ext/labextension/* /home/jovyan/serverextension/src/jlab_chat_ext/labextension/

##############################
# Step 6: Dev startup scripts
##############################
WORKDIR /home/jovyan
COPY start-dev.sh .
RUN chmod +x ./start-dev.sh

RUN mkdir -p /home/jovyan/.jupyter
COPY jupyter_server_config.py /home/jovyan/.jupyter/

COPY start-notebook.d/cleanup.sh /usr/local/bin/start-notebook.d/cleanup.sh
RUN chmod +x /usr/local/bin/start-notebook.d/cleanup.sh

##############################
# Step 7: Expose Jupyter port
##############################
EXPOSE 8888
WORKDIR /home/jovyan

# Default command
CMD ["./start-dev.sh"]
