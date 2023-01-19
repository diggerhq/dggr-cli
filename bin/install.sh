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
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/linux-x64.tar.gz"
elif [ "$os" == "Linux" ] && [ "$architecture" == "arm" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/linux-arm.tar.gz"
elif [ "$os" == "Mac" ] && [ "$architecture" == "x86_64" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/darwin-x64.tar.gz"
elif [ "$os" == "Mac" ] && [ "$architecture" == "arm64" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/darwin-arm.tar.gz"
elif [ "$os" == "Other" ] || [ "$architecture" == "Other" ] ; then
    echo "Error: Unsupported platform"
    exit 1
elif [ "$os" == "Linux" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/linux-x64.tar.gz"
elif [ "$os" == "Mac" ]; then
    url="https://github.com/diggerhq/dggr-cli/releases/latest/download/darwin-x64.tar.gz"
else
    echo "Error: Unsupported platform"
    exit 1
fi

curl -sL $url -o dgctl.tar.gz | tar -xz -C /usr/local

sudo chmod +x /usr/local/dgctl/dgctl

sudo ln -s /usr/local/bin/dgctl /usr/local/dgctl/dgctl
