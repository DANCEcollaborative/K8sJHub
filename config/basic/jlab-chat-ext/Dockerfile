FROM jupyter/base-notebook:latest

##############################
# Step 1: Install system packages as root
##############################
USER root
RUN apt-get update && \
    apt-get install -y curl gnupg git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs tree dos2unix && \
    npm install -g webpack webpack-cli ts-loader raw-loader && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

##############################
# Step 2: Switch to jovyan user & set workdir
##############################
USER jovyan
WORKDIR /home/jovyan/jlab-chat-ext

##############################
# Step 3: Copy only Python dependency files for caching
##############################
COPY --chown=jovyan:jovyan pyproject.toml .
COPY --chown=jovyan:jovyan README.md .
COPY --chown=jovyan:jovyan LICENSE .

##############################
# Step 4: Install Python dependencies
##############################
RUN pip install --no-cache-dir --upgrade pip setuptools wheel build && \
    pip install --no-cache-dir \
        jupyterlab==4.2.5 \
        jupyter-collaboration \
        jupyterlab-link-share \
        jupyter-server-ydoc \
        jupyter-ydoc \
    		"httpx<0.26.0"
        
##############################
# Step 5: Copy remaining source files
##############################
COPY --chown=jovyan:jovyan ./frontend ./frontend
# COPY --chown=jovyan:jovyan ./jlab_chat_ext ./jlab_chat_ext
COPY --chown=jovyan:jovyan ./src ./src
COPY --chown=jovyan:jovyan start-dev.sh .
COPY --chown=jovyan:jovyan jupyter_server_config.py .jupyter/
COPY --chown=jovyan:jovyan start-notebook.d/cleanup.sh /usr/local/bin/start-notebook.d/cleanup.sh

##############################
# Step 6: Configure Jupyter root_dir
##############################
RUN mkdir -p /home/jovyan/jlab-chat-ext/shared && \
    chown -R jovyan:users /home/jovyan/jlab-chat-ext/shared && \
    echo "c.ServerApp.root_dir = '/home/jovyan/jlab-chat-ext/shared'" >> .jupyter/jupyter_server_config.py

##############################
# Step 7: Explicitly Build the Frontend
##############################
WORKDIR /home/jovyan/jlab-chat-ext/frontend

# First, install the frontend dependencies
WORKDIR /home/jovyan/jlab-chat-ext/frontend
RUN rm -rf node_modules package-lock.json yarn.lock 
RUN jlpm install && jlpm run build:prod
    
# Second, navigate back to the root and clean all JupyterLab caches
WORKDIR /home/jovyan/jlab-chat-ext

# Clean any old JupyterLab assets before installing
RUN jupyter lab clean --all

# Install your extension in editable mode. It will find the pre-built assets.
# Then, install all other Python dependencies.
RUN pip install -e . && \
    pip install \
        jupyter-collaboration \
        jupyterlab-link-share \
        jupyter-server-ydoc \
        jupyter-ydoc \
        "httpx<0.26.0"

##############################
# Step 9: Enable Server Extension and Build Final JupyterLab App
##############################
# This must be the final build step.
RUN jupyter server extension enable jlab_chat_ext --py --sys-prefix && \
    jupyter lab build --minimize=False

##############################
# Step 10: Fix line endings & permissions
##############################
WORKDIR /home/jovyan/jlab-chat-ext
USER root
RUN dos2unix start-dev.sh /usr/local/bin/start-notebook.d/cleanup.sh && \
    chmod +x start-dev.sh /usr/local/bin/start-notebook.d/cleanup.sh
USER jovyan

##############################
# Step 11: Expose ports
##############################
EXPOSE 8888 3001

##############################
# Step 12: Default command
##############################
# CMD ["./start-dev.sh"]
