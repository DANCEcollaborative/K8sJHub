# setup.py
import json
from pathlib import Path
import setuptools
from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
)

# The name of the project.
name = "jlab_chat_ext"

# Project root directory.
HERE = Path(__file__).parent.resolve()

# Frontend directory.
frontend_dir = HERE / "frontend"
labextension_dir = frontend_dir / "jlab_chat_ext" / "labextension"

# Ensure the labextension has been built.
ensure_targets([
    labextension_dir / "package.json",
    labextension_dir / "static/style.js"
])

# Get the package data.
pkg_data = json.loads((HERE / "frontend" / "package.json").read_bytes())

# Command classes for the build.
cmdclass = create_cmdclass(
    "jsdeps",
    package_data_spec=pkg_data,
    npm="jlpm",
)
js_command = combine_commands(
    install_npm(frontend_dir, build_cmd="build:prod", npm="jlpm"),
)

setuptools.setup(
    name=name,
    version=pkg_data["version"],
    # These two lines are the crucial change for the src-layout
    package_dir={"": "src"},
    packages=setuptools.find_packages(where="src"),
    cmdclass=cmdclass,
    author="Your Name",
    description="A JupyterLab extension for chat.",
    long_description=(HERE / "README.md").read_text(),
    long_description_content_type="text/markdown",
    include_package_data=True,
    zip_safe=False,
    python_requires=">=3.8",
)