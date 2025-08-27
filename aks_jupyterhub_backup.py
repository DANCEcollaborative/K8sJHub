import os
import subprocess
from datetime import datetime

# Replace these with your actual values
resource_groups = ["k8sj-rg", "MC_k8sj-rg_k8sj-cluster_eastus", "K8s_JHub_Chat_Speech", "DefaultResourceGroup-EUS", "cloud-shell-storage-eastus"]
aks_names = ["k8sj-cluster"]
vnet_names = ["k8sj-vnet"]
namespaces = ["k8s-ns", "default", "kube-system", "kube-public", "kube-node-lease"]
release = "release-1"

# Create timestamped backup directory
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
backup_dir = f"aks_jupyterhub_backup_{timestamp}"
os.makedirs(backup_dir, exist_ok=True)

# Helper function to run shell commands and save output
def run_and_save(command, output_file):
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        with open(output_file, 'wb') as f:
            f.write(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e.stderr.decode())

# Iterate over each resource group and corresponding AKS and VNet
for rg, aks, vnet in zip(resource_groups, aks_names, vnet_names):
    rg_dir = os.path.join(backup_dir, rg)
    os.makedirs(rg_dir, exist_ok=True)

    run_and_save(f"az aks show --resource-group {rg} --name {aks}", f"{rg_dir}/aks-config.json")
    run_and_save(f"az network vnet show --resource-group {rg} --name {vnet}", f"{rg_dir}/vnet-config.json")
    run_and_save(f"az role assignment list --resource-group {rg}", f"{rg_dir}/role-assignments.json")

# Iterate over each namespace for Helm and Kubernetes resources
for ns in namespaces:
    ns_dir = os.path.join(backup_dir, ns)
    os.makedirs(ns_dir, exist_ok=True)

    run_and_save(f"helm get values {release} -n {ns}", f"{ns_dir}/jupyterhub-values.yaml")
    run_and_save(f"helm get manifest {release} -n {ns}", f"{ns_dir}/jupyterhub-manifest.yaml")
    run_and_save(f"kubectl get secrets -n {ns} -o yaml", f"{ns_dir}/all-secrets.yaml")
    run_and_save(f"kubectl get configmaps -n {ns} -o yaml", f"{ns_dir}/all-configmaps.yaml")

print(f"Backup completed successfully. Files saved in directory: {backup_dir}")