import os
import subprocess
import json
from datetime import datetime

# Path to your backup root directory
backup_root = "/Users/rcmurray/git/DANCEcollaborative/K8sJHub/backup"

def run_cmd(cmd):
    print(f"Executing: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def get_latest_backup_dir(root_dir):
    subdirs = [
        os.path.join(root_dir, d)
        for d in os.listdir(root_dir)
        if os.path.isdir(os.path.join(root_dir, d)) and d.startswith("aks_jupyterhub_backup_")
    ]
    if not subdirs:
        raise FileNotFoundError("No timestamped backup directories found.")
    latest_dir = max(subdirs, key=os.path.getmtime)
    return latest_dir

def restore_from_backup():
    backup_dir = get_latest_backup_dir(backup_root)
    print(f"Using latest backup directory: {backup_dir}")

    resource_groups = [
        "k8sj-rg", "MC_k8sj-rg_k8sj-cluster_eastus", "K8s_JHub_Chat_Speech",
        "DefaultResourceGroup-EUS", "cloud-shell-storage-eastus"
    ]
    namespaces = [
        "k8s-ns", "default", "kube-system", "kube-public", "kube-node-lease"
    ]

    for rg in resource_groups:
        rg_path = os.path.join(backup_dir, rg)
        if os.path.isdir(rg_path):
            role_file = os.path.join(rg_path, "role-assignments.json")
            if os.path.exists(role_file):
                with open(role_file) as f:
                    assignments = json.load(f)
                    for a in assignments:
                        principal_id = a.get("principalId")
                        role = a.get("roleDefinitionName")
                        scope = a.get("scope")
                        if principal_id and role and scope:
                            run_cmd(f"az role assignment create --assignee {principal_id} --role \"{role}\" --scope {scope}")

    for ns in namespaces:
        ns_path = os.path.join(backup_dir, ns)
        if os.path.isdir(ns_path):
            values_file = os.path.join(ns_path, "jupyterhub-values.yaml")
            if os.path.exists(values_file):
                run_cmd(f"helm upgrade --install jhub jupyterhub/jupyterhub -n {ns} --create-namespace -f {values_file}")

            secrets_file = os.path.join(ns_path, "all-secrets.yaml")
            if os.path.exists(secrets_file):
                run_cmd(f"kubectl apply -f {secrets_file} -n {ns}")

            configmaps_file = os.path.join(ns_path, "all-configmaps.yaml")
            if os.path.exists(configmaps_file):
                run_cmd(f"kubectl apply -f {configmaps_file} -n {ns}")

if __name__ == "__main__":
    restore_from_backup()