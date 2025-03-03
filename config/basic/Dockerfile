FROM jupyter/base-notebook

# Install JupyterLab and RTC dependencies
RUN pip install --no-cache-dir --upgrade \
    jupyterlab==4.1 \
    jupyter-collaboration \
    jupyterhub

RUN echo "c.LabApp.collaborative = True" >> /etc/jupyterhub/jupyter_config.py

RUN fix-permissions $HOME
