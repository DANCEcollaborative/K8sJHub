FROM jupyter/minimal-notebook:latest

RUN pip install jupyter-collaboration jupyterlab-chat

RUN jupyter labextension install jupyterlab-chat && \
    jupyter lab build

RUN fix-permissions $HOME
