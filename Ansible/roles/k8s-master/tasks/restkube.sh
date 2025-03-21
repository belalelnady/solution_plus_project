#!/bin/bash

echo "Resetting Kubernetes..."
sudo kubeadm reset -f

echo "Removing Kubernetes directories..."
sudo rm -rf /etc/kubernetes /var/lib/etcd ~/.kube

echo "Removing CNI configuration..."
sudo rm -rf /etc/cni/net.d

echo "Flushing iptables..."
sudo iptables -F && sudo iptables -X

echo "Clearing IPVS tables..."
sudo ipvsadm --clear

echo "Removing kubeconfig files..."
rm -rf ~/.kube/config

echo "Restarting necessary services..."
sudo systemctl restart kubelet
sudo systemctl restart containerd
sudo systemctl restart docker

echo "Kubernetes reset is complete!"
