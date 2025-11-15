# VCB-Web Deployment Guide

## Automated Deployment Workflow

This repository uses **fully automated deployments** via GitHub Actions. No manual merging or scripts required.

---

## How It Works

### 1️⃣ Make Changes
Work on any `claude/**` branch (e.g., `claude/update-web-013XrjPbjx6SnCyYDkEahfN2`)

### 2️⃣ Commit & Push
```bash
git add .
git commit -m "your commit message"
git push -u origin claude/your-branch-name
```

### 3️⃣ Automatic Deployment
- **Auto-merge workflow** (`.github/workflows/auto-merge.yml`) detects the push
- Automatically merges `claude/**` branch to `master`
- **Deploy workflow** (`.github/workflows/ci.yml`) triggers from `master`
- Deploys to GitHub Pages at: https://tommy0storm.github.io/VCB-Web/

**⏱️ Total time: ~2-3 minutes from push to live**

---

## Workflow Files

### `.github/workflows/auto-merge.yml`
- **Trigger:** Push to any `claude/**` branch
- **Action:** Automatically merges to `master` branch
- **Permissions:** `contents: write`

### `.github/workflows/ci.yml`
- **Trigger:** Push to `master` branch
- **Action:**
  1. Injects Cerebras API key
  2. Builds site
  3. Deploys to GitHub Pages
- **Permissions:** `pages: write`, `id-token: write`

---

## Environment Protection

GitHub Pages environment is protected and **only allows deployments from `master`** branch.

This is why we use the two-workflow approach:
1. ✅ Push to `claude/**` → auto-merge handles it
2. ✅ Auto-merge pushes to `master` → deploy workflow handles it

---

## Monitoring Deployments

### Check Workflow Status
https://github.com/Tommy0Storm/VCB-Web/actions

### Live Site
https://tommy0storm.github.io/VCB-Web/

---

## Troubleshooting

### Deployment Failed?
1. Check GitHub Actions: https://github.com/Tommy0Storm/VCB-Web/actions
2. Look for error messages in workflow logs
3. Common issues:
   - YAML syntax errors
   - Branch protection rules
   - Missing permissions

### Changes Not Showing?
1. Wait 2-3 minutes for deployment to complete
2. Hard refresh browser: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
3. Clear browser cache
4. Check GitHub Actions to confirm deployment succeeded

---

## Local Development

### Viewing Changes Locally (WSL)

```bash
cd /home/user/VCB-Web
python3 -m http.server 8080
```

Then access via WSL IP address:
```
http://21.0.0.104:8080/index.html
```

Or open file directly in Windows:
```
C:\Users\tommy\OneDrive\Dev-Projects\VCB-Web\index.html
```

---

## Branch Strategy

- `master` - Production branch (auto-deploys to GitHub Pages)
- `claude/**` - Feature branches (auto-merge to master on push)

**Never push directly to `master` from WSL** - the proxy gives 403 errors. Use the auto-merge workflow instead.

---

## Summary

✅ **Just push to `claude/**` branches** → Everything else is automatic
✅ **No manual merging required**
✅ **No deployment scripts needed**
✅ **No pull requests necessary** (unless you want code review)

Push and relax. GitHub Actions handles the rest! 🚀
