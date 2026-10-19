#!/bin/sh
# Build the static site for GitHub Pages and publish it to the gh-pages branch,
# which Pages serves at https://kaalabairava1234-ops.github.io/gauri-portfolio/
set -e

npm run build:pages
# No Jekyll processing: serve the files exactly as built.
touch .output/public/.nojekyll

WORKTREE=$(mktemp -d)
cleanup() { git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true; }
trap cleanup EXIT

if git fetch origin gh-pages >/dev/null 2>&1; then
  git worktree add -B gh-pages "$WORKTREE" origin/gh-pages
else
  # First deploy: start gh-pages as an empty branch with no shared history.
  git worktree add --orphan -b gh-pages "$WORKTREE"
fi

# Replace the branch contents with the fresh build.
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R .output/public/. "$WORKTREE"/

cd "$WORKTREE"
git add -A
if git diff --cached --quiet; then
  echo "Nothing changed since the last deploy."
  exit 0
fi
git commit -m "Deploy site from $(git -C "$OLDPWD" rev-parse --short HEAD)"
git push origin gh-pages
echo "Deployed. Live in a minute at https://kaalabairava1234-ops.github.io/gauri-portfolio/"
