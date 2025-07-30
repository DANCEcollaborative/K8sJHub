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
RUN mkdir /home/jovyan/jlab-chat-ext
WORKDIR /home/jovyan/jlab-chat-ext

# Copy ALL project files into the container.
# This must happen before installing build dependencies if they rely on setup.py/pyproject.toml
# and before the build command for the frontend.
COPY --chown=jovyan:users . /home/jovyan/jlab-chat-ext
# Note: jupyter/base-notebook uses group 'users' (GID 100), so --chown=jovyan:users is good practice.

##############################
# Step 5: Build the Python Wheel
##############################
# This command runs the full build process defined in pyproject.toml.
# It compiles the frontend assets and packages everything into a self-contained
# .whl file in the `dist/` directory. We use --no-deps for a cleaner build.
RUN pip wheel . --no-deps -w dist

##############################
# Step 6: Install the Python Wheel
##############################
# Now, we install the extension from that self-contained .whl file.
# This is a standard, non-editable installation.
RUN pip install --no-cache-dir --no-deps dist/*.whl

##############################
# Step 7: Build the JupyterLab application
##############################
# This step is necessary to integrate your extension with the JupyterLab application.
# It ensures JupyterLab recognizes and can load your newly built extension.
# --dev-build=False and --minimize=True are suitable for production images.
RUN echo "--- Running jupyter lab build ---" && \
    jupyter lab build --dev-build=False --minimize=True --debug && \
    echo "--- jupyter lab build finished ---"
#     echo "--- jupyter lab build finished ---" && \       ### >>> TEMP NOT CLEANING FOR DEBUGGING
#     # Clean the build cache to reduce image size
#     jupyter lab clean

# Set back to the default workdir before running the final CMD
WORKDIR /home/${NB_USER}

# Port and CMD are inherited from the base image, so they are not needed
# unless you want to override them. The base image already has a good CMD.