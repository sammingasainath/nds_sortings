#!/bin/bash

# Exit on error
set -e

# Display commands
set -x

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git and try again."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install docker and try again."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Add all changes to git
git add .

# Commit changes
echo "Enter commit message:"
read commit_message
git commit -m "$commit_message"

# Push changes to GitHub
git push origin master

echo "Changes pushed to GitHub."
echo "Now you can deploy the application on Coolify."
echo "Follow these steps:"
echo "1. Log in to your Coolify dashboard"
echo "2. Go to your project"
echo "3. Click on 'Deploy'"
echo "4. Wait for the deployment to complete"
echo "5. Access your application at the provided URL" 