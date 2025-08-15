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
RUN pip install --no-cache-dir --upgrade pip setuptools wheel build jupyterlab==4.4.6

##############################
# Step 5: Copy remaining source files
##############################
COPY --chown=jovyan:jovyan ./frontend ./frontend
COPY --chown=jovyan:jovyan ./jlab_chat_ext ./jlab_chat_ext
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
# Step 7: Build frontend (dev mode) with aligned versions
##############################
WORKDIR /home/jovyan/jlab-chat-ext/frontend
RUN rm -rf node_modules package-lock.json yarn.lock && \
    jlpm install && \
    jlpm add raw-loader@^4.0.2 --dev && \
    jlpm build

# Copy the built labextension into the Python package
RUN mkdir -p /home/jovyan/jlab-chat-ext/jlab_chat_ext/labextension && \
    cp -r /home/jovyan/jlab-chat-ext/frontend/lib/* \
          /home/jovyan/jlab-chat-ext/jlab_chat_ext/labextension/ && \
    mkdir -p /home/jovyan/jlab-chat-ext/jlab_chat_ext/labextension/schemas && \
    cp -r /home/jovyan/jlab-chat-ext/frontend/schema/* \
          /home/jovyan/jlab-chat-ext/jlab_chat_ext/labextension/schemas/
          
##############################
# Step 8: Install Python package & enable server extension
##############################
WORKDIR /home/jovyan/jlab-chat-ext
RUN pip install --no-cache-dir -e . && \
    pip install --no-cache-dir \
        jupyter-collaboration \
        jupyterlab-link-share \
        jupyter-server-ydoc \
        jupyter-ydoc && \
    jupyter server extension enable jlab_chat_ext

##############################
# Step 9: Prepopulate JupyterLab settings with default chatURL
##############################
RUN mkdir -p /home/jovyan/.jupyter/lab/user-settings/@my-org/jlab-chat-ext && \
    echo '{"chatURL": "https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm"}' \
        > /home/jovyan/.jupyter/lab/user-settings/@my-org/jlab-chat-ext/plugin.json && \
    chown -R jovyan:users /home/jovyan/.jupyter/lab/user-settings

##############################
# Step 10: Fix line endings & permissions
##############################
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
CMD ["./start-dev.sh"]
