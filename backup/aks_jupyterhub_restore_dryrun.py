import os

# Path to your backup root directory
backup_root = "/Users/rcmurray/git/DANCEcollaborative/K8sJHub/backup"

# Helper function to simulate command execution
def simulate_cmd(cmd):
    print(f"[Dry Run] Would execute: {cmd}")

# Find the most recently created timestamped backup directory
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

def main():
    # Get the latest backup directory
    backup_dir = get_latest_backup_dir(backup_root)
    print(f"Using latest backup directory: {backup_dir}")

    # Define known resource groups and namespaces
    resource_groups = [
        "k8sj-rg", "MC_k8sj-rg_k8sj-cluster_eastus", "K8s_JHub_Chat_Speech",
        "DefaultResourceGroup-EUS", "cloud-shell-storage-eastus"
    ]
    namespaces = [
        "k8s-ns", "default", "kube-system", "kube-public", "kube-node-lease"
    ]

    # Simulate restore for AKS, VNet, and role assignments
    for rg in resource_groups:
        rg_path = os.path.join(backup_dir, rg)
        if os.path.isdir(rg_path):
            if os.path.exists(os.path.join(rg_path, "aks-config.json")):
                simulate_cmd(f"az aks create --resource-group {rg} --name <aks-name> --config {rg_path}/aks-config.json")
            if os.path.exists(os.path.join(rg_path, "vnet-config.json")):
                simulate_cmd(f"az network vnet create --resource-group {rg} --name <vnet-name> --config {rg_path}/vnet-config.json")
            if os.path.exists(os.path.join(rg_path, "role-assignments.json")):
                simulate_cmd(f"az role assignment create --resource-group {rg} --config {rg_path}/role-assignments.json")

    # Simulate restore for Helm values, secrets, and configmaps
    for ns in namespaces:
        ns_path = os.path.join(backup_dir, ns)
        if os.path.isdir(ns_path):
            values_file = os.path.join(ns_path, "jupyterhub-values.yaml")
            if os.path.exists(values_file):
                simulate_cmd(f"helm upgrade --install jhub jupyterhub/jupyterhub -n {ns} --create-namespace -f {values_file}")
            secrets_file = os.path.join(ns_path, "all-secrets.yaml")
            if os.path.exists(secrets_file):
                simulate_cmd(f"kubectl apply -f {secrets_file} -n {ns}")
            configmaps_file = os.path.join(ns_path, "all-configmaps.yaml")
            if os.path.exists(configmaps_file):
                simulate_cmd(f"kubectl apply -f {configmaps_file} -n {ns}")

# Run the script
if __name__ == "__main__":
    main()