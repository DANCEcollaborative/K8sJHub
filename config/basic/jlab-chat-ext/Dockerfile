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
# Step 7: Install Frontend Dependencies and Install Python Package
##############################

# First, install the frontend dependencies
WORKDIR /home/jovyan/jlab-chat-ext/frontend
RUN rm -rf node_modules package-lock.json yarn.lock && \
    jlpm install
    
# Second, navigate back to the root and clean all JupyterLab caches
WORKDIR /home/jovyan/jlab-chat-ext
RUN jupyter lab clean --all

# Third, install the Python package in editable mode.
# The pyproject.toml ensures the freshly built frontend assets are linked correctly.
RUN pip install -e . && \
    pip install \
        jupyter-collaboration \
        jupyterlab-link-share \
        jupyter-server-ydoc \
        jupyter-ydoc \
        "httpx<0.26.0" && \
    # Enable server extension
    jupyter server extension enable jlab_chat_ext && \
    # Finally, rebuild the core JupyterLab assets with the extension included
    jupyter lab build --minimize=False
    
##############################
# Step 8: Prepopulate JupyterLab settings with default chatURL
##############################
RUN mkdir -p /home/jovyan/.jupyter/lab/user-settings/@my-org/jlab-chat-ext && \
    echo '{"chatURL": "https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm"}' \
        > /home/jovyan/.jupyter/lab/user-settings/@my-org/jlab-chat-ext/plugin.json && \
    chown -R jovyan:users /home/jovyan/.jupyter/lab/user-settings

##############################
# Step 9: Fix line endings & permissions
##############################
WORKDIR /home/jovyan/jlab-chat-ext
USER root
RUN dos2unix start-dev.sh /usr/local/bin/start-notebook.d/cleanup.sh && \
    chmod +x start-dev.sh /usr/local/bin/start-notebook.d/cleanup.sh
USER jovyan

##############################
# Step 10: Expose ports
##############################
EXPOSE 8888 3001

##############################
# Step 11: Default command
##############################
# CMD ["./start-dev.sh"]
