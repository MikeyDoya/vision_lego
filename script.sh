cd ~/Git_Repos/vision_lego
sed -i 's#playwright install && svelte-kit sync#svelte-kit sync#' package.json
git add package.json
git commit -m "fix: drop playwright install from prepare script (hangs CI)"
git push origin main
