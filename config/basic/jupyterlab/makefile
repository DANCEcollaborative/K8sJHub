# Paths
OPECHAT_DIR = /Users/rcmurray/git/DANCEcollaborative/jupyter-opechat
TARGET_DIST = ./dist

# Node and Python commands
JLPM = jlpm
PYTHON = python
HATCH = $(PYTHON) -m hatch

# Default target
.PHONY: all
all: clean frontend wheel copy

# Clean previous builds
.PHONY: clean
clean:
	@echo "Cleaning previous builds in jupyter-opechat..."
	cd $(OPECHAT_DIR) && $(JLPM) clean:all || true
	cd $(OPECHAT_DIR) && rm -rf dist build *.egg-info

# Build frontend
.PHONY: frontend
frontend:
	@echo "Building frontend in jupyter-opechat..."
	cd $(OPECHAT_DIR) && $(JLPM) build:prod

# Build Python wheel
.PHONY: wheel
wheel:
	@echo "Building Python wheel in jupyter-opechat..."
	cd $(OPECHAT_DIR) && $(HATCH) build

# Copy wheel to current project's dist directory
.PHONY: copy
copy:
	@echo "Copying wheel to $(TARGET_DIST)..."
	mkdir -p $(TARGET_DIST)
	cp $(OPECHAT_DIR)/dist/jupyter_opechat-*.whl $(TARGET_DIST)
	@echo "Wheel copied to $(TARGET_DIST)"

# Full rebuild
.PHONY: rebuild
rebuild: clean all
