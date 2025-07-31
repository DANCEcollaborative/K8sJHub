# Step 1: Base Image and System Dependencies (as root)
FROM jupyter/base-notebook:latest
USER root
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends curl gnupg git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -yqq --no-install-recommends nodejs && \
    npm install -g yarn && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Step 2: Switch to jovyan and Install Core Python Dependencies
USER ${NB_USER}
ENV PATH="/opt/conda/bin:${PATH}"
RUN pip install --no-cache-dir \
    jupyterlab \
    jupyter-packaging \
    jupyter-collaboration \
    jupyterlab-link-share \
    jupyter-server-ydoc \
    jupyter-ydoc

# Step 3: Copy Project Files
WORKDIR /home/jovyan/jlab-chat-ext
# Ensure the labextension directory exists before we copy
COPY --chown=jovyan:users . .

# Step 4: Manually Build the Frontend
WORKDIR /home/jovyan/jlab-chat-ext/frontend
# Install JS dependencies
RUN jlpm install --inline-builds
# Run the bundler command from package.json
RUN jlpm build

# Step 5: Verify Frontend Build and Install Python Package
WORKDIR /home/jovyan/jlab-chat-ext
# CRUCIAL DIAGNOSTIC STEP: This will fail the build if the assets were not created.
RUN ls -l jlab_chat_ext/labextension/
# Now, build and install the Python package, which will pick up the pre-built assets.
RUN pip install .

# Step 6: Final JupyterLab Build to Integrate the Extension
# RUN jupyter lab build --dev-build=False --minimize=True --clean
RUN jupyter lab build --dev-build=False --minimize=True

# Set back to the default workdir before running the final CMD
WORKDIR /home/${NB_USER}