# 🚀 PUBLISH VISUAL CODE MAP - STEP BY STEP

Follow these steps to publish your extension to the VS Code Marketplace RIGHT NOW!

## Prerequisites Check ✅
- [x] Extension built and tested
- [x] GitHub repository ready
- [x] Version tagged (v0.1.0)
- [ ] Publisher account needed
- [ ] Personal Access Token needed

---

## STEP 1: Create Your Publisher Account (5 minutes)

1. **Open your browser** and go to:
   ```
   https://marketplace.visualstudio.com/manage/createpublisher
   ```

2. **Sign in** with your Microsoft account

3. **Create a publisher** with these details:
   - **Publisher ID**: `prawal-sharma` (or your preferred ID)
   - **Display Name**: Prawal Sharma
   - **Description**: Developer tools and VS Code extensions
   
4. **Verify your email** (check inbox)

---

## STEP 2: Get Personal Access Token (3 minutes)

1. **Go to Azure DevOps**:
   ```
   https://dev.azure.com
   ```

2. **Click** on your profile icon (top right) → **Personal access tokens**

3. **Click** "+ New Token"

4. **Configure the token**:
   - **Name**: VSCode-Extension-Publishing
   - **Organization**: All accessible organizations
   - **Expiration**: 90 days (or custom)
   - **Scopes**: Click "Custom defined" then:
     - ✅ Marketplace → **Manage**

5. **Click** "Create"

6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
   Save it somewhere secure temporarily.

---

## STEP 3: Install Publishing Tool (1 minute)

Since you have Node 18, let's use npx with a compatible version:

```bash
# No installation needed, we'll use npx directly
```

---

## STEP 4: Package the Extension (2 minutes)

Open terminal in the project directory and run:

```bash
# First, ensure everything is built
npm run compile

# Try to package with an older compatible version
npx vsce@2.11.0 package --no-dependencies
```

If that doesn't work due to Node version, use the manual method:

```bash
# Our backup packaging script
node scripts/package.js
```

---

## STEP 5: Manual Publishing via Web (EASIEST METHOD!)

Since we have Node version constraints, let's use the **Web Upload Method**:

1. **Go to**:
   ```
   https://marketplace.visualstudio.com/manage/publishers/prawal-sharma
   ```
   (Replace `prawal-sharma` with your publisher ID)

2. **Click** "New Extension" or "+ New Extension"

3. **Click** "Upload Extension"

4. **Upload the VSIX file**:
   - The file should be: `visual-code-map-0.1.0.vsix`
   - Or create it manually from the built files

5. **Fill in the marketplace listing**:
   - **Categories**: Programming Languages, Other
   - **Tags**: dependency, graph, visualization, code-map, architecture
   - **Repository**: https://github.com/Prawal-Sharma/VisualCodeMap
   - **Q&A**: Enable

6. **Click** "Upload"

---

## STEP 6: Alternative - GitHub Actions Method

Add your token to GitHub for automated publishing:

1. **Go to your repository settings**:
   ```
   https://github.com/Prawal-Sharma/VisualCodeMap/settings/secrets/actions
   ```

2. **Click** "New repository secret"

3. **Add**:
   - **Name**: `VSCE_TOKEN`
   - **Value**: [Paste your Personal Access Token]

4. **Trigger the workflow**:
   ```bash
   # This will trigger the GitHub Action to publish
   git tag v0.1.1 -m "Trigger marketplace publish"
   git push origin v0.1.1
   ```

---

## STEP 7: If All Else Fails - Create VSIX Manually

Since we have the compiled extension, we can create a VSIX manually:

```bash
# 1. Create a temporary directory
mkdir vsix-package
cd vsix-package

# 2. Copy necessary files
cp -r ../dist .
cp -r ../resources .
cp -r ../src/webview/graph.js ./src/webview/
cp -r ../src/webview/styles ./src/webview/
cp ../package.json .
cp ../README.md .
cp ../CHANGELOG.md .
cp ../LICENSE .

# 3. Create the VSIX (it's just a ZIP file)
zip -r ../visual-code-map-0.1.0.vsix .

# 4. Go back
cd ..
```

Then upload this file via the web interface!

---

## 🎯 Quick Checklist

1. [ ] Publisher account created
2. [ ] Personal Access Token obtained
3. [ ] Token saved securely
4. [ ] VSIX file created
5. [ ] Extension uploaded via web interface

---

## 📝 What Happens Next?

After uploading:
- **Review time**: Usually instant to 5 minutes
- **URL**: Your extension will be at:
  ```
  https://marketplace.visualstudio.com/items?itemName=prawal-sharma.visual-code-map
  ```
- **In VS Code**: Searchable within 5-10 minutes

---

## 🆘 Troubleshooting

**Can't create VSIX due to Node version?**
→ Use the manual ZIP method above or web upload

**Token not working?**
→ Ensure it has "Marketplace → Manage" scope

**Publisher ID taken?**
→ Try variations like: prawal-sharma-dev, prawalsharma, etc.

**Upload fails?**
→ Check that package.json has all required fields

---

## 🎉 Success Indicators

You'll know it worked when:
1. ✅ Extension appears in your publisher dashboard
2. ✅ You get a confirmation email
3. ✅ Extension is searchable in VS Code
4. ✅ You can install it from the marketplace

---

## 📧 Share Your Success!

Once published, the extension URL will be:
```
https://marketplace.visualstudio.com/items?itemName=[your-publisher-id].visual-code-map
```

Share it on:
- Twitter/X
- LinkedIn  
- Reddit (r/vscode)
- Dev.to

---

**YOU'RE JUST 10 MINUTES AWAY FROM HAVING YOUR EXTENSION LIVE!** 🚀

The easiest path:
1. Create publisher account (2 min)
2. Get token (2 min)
3. Upload via web interface (2 min)
4. Done! 🎉