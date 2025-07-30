import subprocess
import shlex
from pathlib import Path

def build_frontend(target_name, version):
    """A custom build function for hatch that handles the frontend build."""
    
    print("--- [build.py] Running Custom Frontend Build ---", flush=True)
    
    frontend_dir = Path.cwd() / "frontend"
    if not frontend_dir.is_dir():
        print(f"!!! [build.py] Frontend directory not found at {frontend_dir}", flush=True)
        return

    # Run `jlpm install`
    print("--- [build.py] Installing frontend dependencies... ---", flush=True)
    subprocess.run(
        shlex.split("jlpm install --inline-builds"),
        cwd=frontend_dir,
        check=True
    )

    # Run `jlpm build` (which you previously set to `tsc`)
    print("--- [build.py] Building frontend assets... ---", flush=True)
    subprocess.run(
        shlex.split("jlpm build"),
        cwd=frontend_dir,
        check=True
    )
    
    print("--- [build.py] Custom Frontend Build Complete ---", flush=True)