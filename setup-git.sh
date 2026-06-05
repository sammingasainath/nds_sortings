#!/bin/bash

# Initialize Git repository
git init

# Add all files to Git
git add .

# Create initial commit
git commit -m "Initial commit"

# Add GitHub remote
git remote add origin https://github.com/sammingasainath/nds_sorting.git

# Push to GitHub
echo "Ready to push to GitHub. Run the following command when you're ready:"
echo "git push -u origin main"
echo ""
echo "If you encounter authentication issues, you may need to set up a personal access token."
echo "Visit: https://github.com/settings/tokens to create one." 