FROM jupyter/base-notebook:latest

##############################
# Step 1: Install Node.js 22, npm, & Git (as root)
##############################
# Switch to root for system-level package installations
USER root 
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends curl gnupg git && \
    # Add Node.js 22 repository and install nodejs, then yarn globally
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -yqq --no-install-recommends nodejs && \
    npm install -g yarn && \
    # Clean up apt cache to keep image size down
    apt-get clean && rm -rf /var/lib/apt/lists/*

##############################
# Step 2: Switch back to the default notebook user (jovyan)
##############################
# All subsequent actions should be done as the notebook user to ensure
# correct permissions for the home directory and conda environment.
# The base image sets NB_USER=jovyan
USER ${NB_USER}

# Ensure jlpm is in PATH (already handled by jupyter/base-notebook)
ENV PATH="/opt/conda/bin:${PATH}"

RUN pip install --no-cache-dir \
    jupyter-collaboration \
    jupyterlab-link-share \
    jupyter-server-ydoc \
    jupyter-ydoc

##############################
# Step 3: Install Python Project Build Dependencies Globally (in jovyan's env)
##############################
# It's crucial that hatchling and hatch-jupyter-builder are available and compatible
# before the main project's editable install.
# We're pinning to specific recent versions to ensure compatibility.
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir "hatch==1.11.1"

##############################
# Step 4: Set up Python project & Copy Files
##############################
# Set the main working directory for your Python project.
WORKDIR /home/jovyan/jlab-chat-ext

# Copy ALL project files into the container.
# This must happen before installing build dependencies if they rely on setup.py/pyproject.toml
# and before the build command for the frontend.
COPY --chown=jovyan:users . /home/jovyan/jlab-chat-ext/
# Note: jupyter/base-notebook uses group 'users' (GID 100), so --chown=jovyan:users is good practice.

##############################
# Step 5: Manually Build Frontend Assets using Hatch
##############################
# First, install frontend dependencies in the 'frontend' directory.
# This prepares the environment for the 'jlpm build' command that hatch will execute.
WORKDIR /home/jovyan/jlab-chat-ext/frontend
RUN jlpm install --inline-builds

# Now, go back to the Python project root and trigger the frontend build using hatch.
# The 'hatch build' command will recognize the 'jupyter-builder' hook from pyproject.toml
# and execute `jlpm build` in the `frontend` directory (which we just prepared).
# --hook-only ensures it only runs the hooks, not the full sdist/wheel build.
# The `PYTHONPATH` explicitly points to the installed hatch packages in case of weird isolation.
WORKDIR /home/jovyan/jlab-chat-ext
RUN echo "--- Running hatch build (frontend hook) ---" && \
    hatch build --hooks-only  && \
    echo "--- hatch build (frontend hook) finished ---"

##############################
# Step 6: Install Python package in editable mode
##############################
# Now that the frontend assets are pre-built by the hatch hook,
# the `pip install -e .` should simply install the Python package,
# without needing to trigger the build hook again (as the assets already exist).
# This might avoid the 'prepare_metadata_for_build_editable' issue if it was tied to the hook.
RUN echo "--- Running pip install -e . (Python package only) ---" && \
    pip install --no-cache-dir -e . && \
    echo "--- pip install -e . finished ---"

##############################
# Step 7: Build the JupyterLab application
##############################
# This step is necessary to integrate your extension with the JupyterLab application.
# It ensures JupyterLab recognizes and can load your newly built extension.
# --dev-build=False and --minimize=True are suitable for production images.
RUN echo "--- Running jupyter lab build ---" && \
    jupyter lab build --dev-build=False --minimize=True --debug && \
    echo "--- jupyter lab build finished ---" && \
    # Clean the build cache to reduce image size
    jupyter lab clean && \
    jlpm cache clean && \
    npm cache clean --force

# Set back to the default workdir before running the final CMD
WORKDIR /home/${NB_USER}

# Port and CMD are inherited from the base image, so they are not needed
# unless you want to override them. The base image already has a good CMD.