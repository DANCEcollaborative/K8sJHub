from setuptools import setup, find_packages

setup(
    name="jlab-ws-chat-extension",
    version="0.1.0",
    description="A JupyterLab chat extension using Socket.IO",
#     packages=find_packages(),
    packages=["jlab_ws_chat_extension"],
    data_files=[
        ("share/jupyter/labextensions/jlab-ws-chat-extension", [
            "lib/index.js",
            "package.json"
        ]),
        ("etc/jupyter/jupyter_notebook_config.d", ["jlab-ws-chat-extension.json"]),
    ],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        "jupyterlab>=4.0.0"
    ],
    classifiers=[
        "Framework :: Jupyter",
        "Programming Language :: Python :: 3"
    ],
    entry_points={
        "jupyterlab.extension": [
            "jupyterlab-socketio-chat = jupyterlab_socketio_chat"
        ]
    }
)
