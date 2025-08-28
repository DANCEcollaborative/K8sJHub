import os
import subprocess
import argparse
from datetime import datetime

def run_and_save(command, output_file, dry_run):
    print(f"Running: {command}")
    if dry_run:
        print(f"[Dry Run] Skipping: {command}")
        return
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        with open(output_file, 'wb') as f:
            f.write(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr.decode()}")

def is_github_actions():
    return os.getenv("GITHUB_ACTIONS") == "true"

def main():
    parser = argparse.ArgumentParser(description="Backup AKS JupyterHub resources")
    parser.add_argument('--dry-run', action='store_true', help='Perform a dry run without executing commands')
    args = parser.parse_args()

    resource_groups = ["k8sj-rg", "MC_k8sj-rg_k8sj-cluster_eastus", "K8s_JHub_Chat_Speech", "DefaultResourceGroup-EUS", "cloud-shell-storage-eastus"]
    aks_names = ["k8sj-cluster"]
    vnet_names = ["k8sj-vnet"]
    namespaces = ["k8s-ns", "default", "kube-system", "kube-public", "kube-node-lease"]
    release = "release-1"

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = f"aks_jupyterhub_backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)

    for rg, aks, vnet in zip(resource_groups, aks_names, vnet_names):
        rg_dir = os.path.join(backup_dir, rg)
        os.makedirs(rg_dir, exist_ok=True)
        run_and_save(f"az aks show --resource-group {rg} --name {aks}", f"{rg_dir}/aks-config.json", args.dry_run)
        run_and_save(f"az network vnet show --resource-group {rg} --name {vnet}", f"{rg_dir}/vnet-config.json", args.dry_run)
        run_and_save(f"az role assignment list --resource-group {rg}", f"{rg_dir}/role-assignments.json", args.dry_run)

    for ns in namespaces:
        ns_dir = os.path.join(backup_dir, ns)
        os.makedirs(ns_dir, exist_ok=True)
        run_and_save(f"helm get values {release} -n {ns}", f"{ns_dir}/jupyterhub-values.yaml", args.dry_run)
        run_and_save(f"helm get manifest {release} -n {ns}", f"{ns_dir}/jupyterhub-manifest.yaml", args.dry_run)
        run_and_save(f"kubectl get secrets -n {ns} -o yaml", f"{ns_dir}/all-secrets.yaml", args.dry_run)
        run_and_save(f"kubectl get configmaps -n {ns} -o yaml", f"{ns_dir}/all-configmaps.yaml", args.dry_run)

    print(f"Backup completed: {backup_dir}")

    if not args.dry_run and is_github_actions():
        subprocess.run(["git", "add", backup_dir])
        result = subprocess.run(["git", "status", "--porcelain", backup_dir], stdout=subprocess.PIPE)
        if result.stdout.strip():
            commit_msg = f"Automated backup on {timestamp}"
            subprocess.run(["git", "commit", "-m", commit_msg])
            subprocess.run(["git", "push"])
            print("Backup committed and pushed to Git.")
        else:
            print("No changes detected in backup files.")
    elif not args.dry_run:
        print("Running locally: Git commit skipped.")

if __name__ == "__main__":
    main()