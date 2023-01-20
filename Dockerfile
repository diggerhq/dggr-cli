# Use an official Node.js image as the base image
FROM node:16

# Set environment variables for the version numbers
ARG TERRAFORM_VERSION=1.3.7
ARG DGCTL_VERSION=latest

ARG TARGETARCH

# Install Terraform
RUN if [ "$TARGETARCH" = "amd64" ]; then \
        wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
        && unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
        && mv terraform /usr/local/bin/ \
        && rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip; \
    elif [ "$TARGETARCH" = "arm" ]; then \
        wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_arm.zip \
        && unzip terraform_${TERRAFORM_VERSION}_linux_arm.zip \
        && mv terraform /usr/local/bin/ \
        && rm terraform_${TERRAFORM_VERSION}_linux_arm.zip; \
    elif ["$TARGETARCH" = "arm64"]; then \
        wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_arm64.zip \
        && unzip terraform_${TERRAFORM_VERSION}_linux_arm64.zip \
        && mv terraform /usr/local/bin/ \
        && rm terraform_${TERRAFORM_VERSION}_linux_arm64.zip; \
    fi;

RUN if [ "$TARGETARCH" = "amd64" ]; then \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
        && unzip awscliv2.zip \
        && ./aws/install; \
    elif [ "$TARGETARCH" = "arm" || "$TARGETARCH" = "arm64" ]; then \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" \
        && unzip awscliv2.zip \
        && ./aws/install; \
    fi;

RUN curl -fsSL https://get.docker.com | sh


RUN npm install -g dgctl@${DGCTL_VERSION}

WORKDIR /app

ENTRYPOINT ["dgctl"]