#!/usr/bin/env sh

# abort on errors
set -e

# build
echo "Building application..."
npm run build

# navigate into the build output directory
cd docs

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

echo "Preparing for git commit..."
git init
git add -A
git commit -m 'deploy: update GitHub Pages'

# if you are deploying to https://<GreenTilden>.github.io
# git push -f git@github.com:<GreenTilden>/<GreenTilden>.github.io.git main

# if you are deploying to https://<GreenTilden>.github.io/<REPO>
echo "Pushing to GitHub Pages..."
git push -f git@github.com:<USERNAME>/lab-automation-portfolio.git main:gh-pages


echo "Deployment complete!"
chmod +x deploy.sh