#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u

# Define branch names
MAIN_BRANCH="main"
DEV_BRANCH="dev"
BACKUP_BRANCH="backup"

echo "Starting branch synchronization process for EmailGenius ConvertKit..."

# --- Pre-flight Check ---
# Ensure the working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo "Error: Working directory is not clean. Please commit or stash your changes before proceeding."
    exit 1
fi
echo "Working directory is clean."

# --- Synchronization Steps ---

# 1. Fetch the latest updates from the remote repository
echo "Fetching latest updates from origin..."
git fetch origin

# 2. Update the main branch
echo "Checking out and updating '$MAIN_BRANCH' branch..."
git checkout "$MAIN_BRANCH"
git pull origin "$MAIN_BRANCH"
echo "'$MAIN_BRANCH' is now up-to-date."

# 3. Synchronize the dev branch
echo "Checking out '$DEV_BRANCH' branch..."
git checkout "$DEV_BRANCH"
echo "Merging '$MAIN_BRANCH' into '$DEV_BRANCH'..."
git merge "$MAIN_BRANCH"
echo "Pushing updated '$DEV_BRANCH' to origin..."
git push origin "$DEV_BRANCH"
echo "'$DEV_BRANCH' has been synchronized with '$MAIN_BRANCH'."

# 4. Synchronize the backup branch
echo "Checking out '$BACKUP_BRANCH' branch..."
git checkout "$BACKUP_BRANCH"
echo "Merging '$MAIN_BRANCH' into '$BACKUP_BRANCH'..."
git merge "$MAIN_BRANCH"
echo "Pushing updated '$BACKUP_BRANCH' to origin..."
git push origin "$BACKUP_BRANCH"
echo "'$BACKUP_BRANCH' has been synchronized with '$MAIN_BRANCH'."

# 5. Return to the dev branch for continued development
echo "Switching back to '$DEV_BRANCH'..."
git checkout "$DEV_BRANCH"

echo "EmailGenius ConvertKit branch synchronization complete. You are now on the '$DEV_BRANCH' branch."

exit 0
