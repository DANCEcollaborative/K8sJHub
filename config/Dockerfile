FROM jupyter/minimal-notebook:latest

RUN pip install jupyter-collaboration 
RUN pip install jupyterlab-chat

RUN echo "c.LabApp.collaborative = True" >> /usr/local/etc/jupyterhub/jupyter_server_config.py

RUN fix-permissions $HOME
