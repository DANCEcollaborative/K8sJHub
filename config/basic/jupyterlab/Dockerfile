# Base image
FROM ubuntu:22.04

LABEL maintainer="Jupyter Project <jupyter@googlegroups.com>"

# Environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    CONDA_DIR=/opt/conda \
    SHELL=/bin/bash \
    NB_USER=jovyan \
    NB_UID=1000 \
    NB_GID=1001 \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8 \
    HOME=/home/jovyan \
    JUPYTER_PORT=8888 \
    XDG_CACHE_HOME=/home/jovyan/.cache/ \
    JULIA_DEPOT_PATH=/opt/julia \
    JULIA_PKGDIR=/opt/julia \
    JULIA_VERSION=1.11.6 \
    PATH=/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin



RUN apt-get update --yes && \
    apt-get upgrade --yes && \
    apt-get install --yes --no-install-recommends \
    bzip2 \
    ca-certificates \
    locales \
    sudo \
    tini \
    wget && \
    echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN apt-get update --yes && \
    apt-get install --yes --no-install-recommends \
    fonts-dejavu \
    gfortran \
    gcc && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN set -x && \
    julia_version=1.11.6 && \
    julia_arch=$(uname -m) && \
    julia_short_arch="$julia_arch" && \
    if [ "$julia_short_arch" = "x86_64" ]; then \
        julia_short_arch="x64"; \
    fi && \
    julia_major_minor=$(echo "$julia_version" | cut -d. -f 1,2) && \
    # julia_installer="julia-${julia_version}-linux-${julia_short_arch}.tar.gz" && \
    julia_installer="julia-${julia_version}-mac64.tar.gz" && \
    mkdir -p "/opt/julia-${julia_version}" && \
    # wget -q "https://julialang-s3.julialang.org/bin/linux/$julia_short_arch/$julia_major_minor/$julia_installer" && \
    wget -q "https://julialang-s3.julialang.org/bin/mac/$julia_short_arch/$julia_major_minor/$julia_installer" && \
    tar xzf "$julia_installer" -C "/opt/julia-${julia_version}" --strip-components=1 && \
    rm "$julia_installer" && \
    ln -fs /opt/julia-*/bin/julia /usr/local/bin/julia

# Create necessary directories
RUN mkdir -p /etc/sudoers.d && \
    mkdir -p $CONDA_DIR

RUN groupadd -g $NB_GID $NB_USER && \
    useradd -m -s $SHELL -u $NB_UID -g $NB_USER -c "Jupyter User" $NB_USER && \
    echo "$NB_USER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$NB_USER && \
    chmod 0440 /etc/sudoers.d/$NB_USER && \
    mkdir -p $CONDA_DIR && \
    chown $NB_USER:$NB_USER $CONDA_DIR

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/$NB_USER

COPY ./jupyter_server_config.py /etc/jupyter/jupyter_server_config.py
COPY ./jupyter_notebook_config.py /etc/jupyter/jupyter_notebook_config.py

COPY ./start-notebook.sh /usr/local/bin/start-notebook.sh
COPY ./start-singleuser.sh /usr/local/bin/start-singleuser.sh
COPY ./start.sh /usr/local/bin/start.sh


# Copy and install Python wheel
COPY ./dist/jupyter_opechat-0.1.0-py3-none-any.whl /tmp/
RUN pip install /tmp/jupyter_opechat-0.1.0-py3-none-any.whl

# Install additional Python packages
# RUN pip install plotly ipywidgets grpcio-tools jupyter_collaboration jupyterlab
RUN pip install \
    plotly \
    ipywidgets \
    grpcio-tools \
    jupyter_collaboration \
    jupyterlab \
    "jupyterhub==4.1.*" \
    kubernetes_asyncio \
    jupyterhub-kubespawner

RUN apt-get update && \
    apt-get install -y libcurl4-openssl-dev libssl-dev && \
    pip install pycurl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN chmod +x /usr/local/bin/start-notebook.sh
RUN chmod +x /usr/local/bin/start-singleuser.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose the port Jupyter will run on
EXPOSE 8888

# Set the container's default command to run Jupyter
CMD ["start-notebook.sh"]

# Optional: add a command for hub variant
RUN echo '#!/bin/bash\nexec jupyterhub --config /usr/local/etc/jupyterhub/jupyterhub_config.py' > /usr/local/bin/start-hub.sh && chmod +x /usr/local/bin/start-hub.sh

# Set user to non-root
USER ${NB_USER}
