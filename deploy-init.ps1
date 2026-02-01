# Run from project root (jyl-universe folder)
# Usage: .\deploy-init.ps1

git init
git add .
git commit -m "Initial universe deploy"
gh repo create universe-project --public --source=. --remote=origin --push
