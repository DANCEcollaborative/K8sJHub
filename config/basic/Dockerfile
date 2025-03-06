FROM jupyter/base-notebook:latest
RUN pip3 install jupyterlab==4.3.5 jupyterhub==5.2.1

# Install any additional packages or customizations here
# RUN pip install --no-cache-dir jupyter-collaboration

# Uninstall unneeded extensions.
# RUN jupyter labextension uninstall @jupyter/docprovider-extension

# Set permissions
# RUN fix-permissions $HOME



# Install JupyterLab and collaborative extensions
# RUN pip install jupyterlab jupyterlab-link-share
# RUN pip install --no-cache-dir jupyterlab jupyter-collaboration jupyterlab-link-share
RUN pip install --no-cache-dir jupyter-collaboration jupyterlab-link-share

# Enable JupyterLab extensions
# RUN jupyter labextension install @jupyterlab/extension-manager

# Set permissions for the jovyan user
RUN mkdir -p /home/jovyan/shared && \
    chown -R jovyan:users /home/jovyan/shared

# Set the working directory
WORKDIR /home/jovyan

# Set the default command
# CMD ["jupyterhub-singleuser"]