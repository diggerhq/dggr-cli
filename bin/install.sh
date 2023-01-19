#!/bin/bash

# Check the operating system
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)
        os="Linux"
        ;;
    Darwin*)
        os="Mac"
        ;;
    *)
        os="Other"
        ;;
esac

# Check the architecture
architectureOut="$(uname -m)"
case "${architectureOut}" in
    x86_64*)
        architecture="x86_64"
        ;;
    arm64*)
        architecture="arm64"
        ;;
    arm*)
        architecture="arm"
        ;;
    *)
        architecture="Other"
        ;;
esac

if [ "$os" == "Linux" ] && [ "$architecture" == "x86_64" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/dgctl-linux-x64.tar.gz"
elif [ "$os" == "Linux" ] && [ "$architecture" == "arm" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/dgctl-linux-arm.tar.gz"
elif [ "$os" == "Mac" ] && [ "$architecture" == "x86_64" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/dgctl-darwin-x64.tar.gz"
elif [ "$os" == "Mac" ] && [ "$architecture" == "arm64" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/dgctl-darwin-arm64.tar.gz"
elif [ "$os" == "Other" ] || [ "$architecture" == "Other" ] ; then
    echo "Error: Unsupported platform"
    exit 1
elif [ "$os" == "Linux" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/dgctl-linux-x64.tar.gz"
elif [ "$os" == "Mac" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/dgctl-darwin-x64.tar.gz"
else
    echo "Error: Unsupported platform"
    exit 1
fi

echo "Downloading dgctl.tar.gz from $url"
curl -sL $url -o dgctl.tar.gz

echo "Extracting dgctl.tar.gz into /usr/local. You may be asked for your password."
tar xzf dgctl.tar.gz
rm dgctl.tar.gz
sudo mv dgctl /usr/local/dgctl
sudo chmod a+x /usr/local/dgctl/bin/dgctl
sudo ln -sf /usr/local/dgctl/bin/dgctl /usr/local/bin/dgctl 
