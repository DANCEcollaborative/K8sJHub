FROM jupyter/base-notebook:latest

##############################
# Step 1: Install system packages as root
##############################
USER root
RUN apt-get update && \
    apt-get install -y curl gnupg git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs tree && \
    npm install -g yarn webpack webpack-cli ts-loader raw-loader

##############################
# Step 2: Switch to jovyan user
##############################
USER jovyan
WORKDIR /home/jovyan/jlab-chat-ext

##############################
# Step 3: Copy project files
##############################
COPY --chown=jovyan:jovyan ./frontend ./frontend
COPY --chown=jovyan:jovyan ./jlab_chat_ext ./jlab_chat_ext
COPY --chown=jovyan:jovyan start-dev.sh .
COPY --chown=jovyan:jovyan pyproject.toml .
COPY --chown=jovyan:jovyan jupyter_server_config.py .jupyter/

##############################
# Step 4: Build frontend
##############################
WORKDIR /home/jovyan/jlab-chat-ext/frontend
RUN rm -rf node_modules package-lock.json yarn.lock
RUN jlpm install && jlpm build

##############################
# Step 5: Install Python package & enable server extension
##############################
WORKDIR /home/jovyan/jlab-chat-ext
RUN pip install --user -e .

# Add JupyterLab real-time collaboration support
RUN pip install --no-cache-dir \
    jupyter-collaboration \
    jupyterlab-link-share \
    jupyter-server-ydoc \
    jupyter-ydoc

RUN jupyter server extension enable --user jlab_chat_ext

##############################
# Step 6: Setup scripts
##############################
RUN chmod +x start-dev.sh
COPY --chown=jovyan:jovyan start-notebook.d/cleanup.sh /usr/local/bin/start-notebook.d/cleanup.sh
RUN chmod +x /usr/local/bin/start-notebook.d/cleanup.sh

##############################
# Step 7: Expose ports
##############################
EXPOSE 8888 3001

##############################
# Step 8: Default command
##############################
CMD ["./start-dev.sh"]
