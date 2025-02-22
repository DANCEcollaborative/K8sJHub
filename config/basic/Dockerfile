FROM jupyter/base-notebook

# Install JupyterLab and RTC dependencies
RUN pip install --no-cache-dir --upgrade \
    jupyterlab==4.0.0 \
    jupyter-collaboration \
    jupyterhub

RUN echo "c.LabApp.collaborative = True" >> /etc/jupyter/jupyter_server_config.py

RUN fix-permissions $HOME
