# setup.py
import setuptools

setuptools.setup(
    name="jlab_chat_ext",
    version="0.1.0", # Hardcode version to avoid file reading issues
    author="Your Name",
    description="A JupyterLab extension for chat.",
    package_dir={"": "src"},
    packages=setuptools.find_packages(where="src"),
    include_package_data=True,
    zip_safe=False,
    python_requires=">=3.8",
)