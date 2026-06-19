# Internal "Build a Lesson" form , setup

A small password-gated web form for your team. A teammate fills in the lesson and
drops in the SRT + MP3; the files upload straight to storage; the form writes a
`request.json` to the repo, which auto-starts the Build Lesson Action. No Slack.

Flow: browser -> presigned upload to R2 storage -> `submit` function commits
`request.json` (with download links) -> GitHub Action builds -> project committed
back to the repo -> you pull and render locally.

## One-time setup (about 20 minutes)

### 1. Storage bucket (Cloudflare R2, free tier)
1. Create a Cloudflare account, go to **R2**, create a bucket (e.g. `lesson-uploads`).
2. Note your **Account ID** (shown in the R2 dashboard).
3. Create an **R2 API token** (R2 -> Manage API Tokens -> Create) with **Object
   Read & Write** on that bucket. Save the **Access Key ID** and **Secret Access Key**.
4. Add **CORS** to the bucket so the browser is allowed to upload to it. In the
   bucket's Settings -> CORS policy, paste (replace the origin with your Netlify URL
   once you have it; `*` is fine while testing):
   ```json
   [
     { "AllowedOrigins": ["*"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 3600 }
   ]
   ```

### 2. GitHub token (lets the form commit request.json)
Create a **fine-grained personal access token** (GitHub -> Settings -> Developer
settings -> Fine-grained tokens) scoped to ONLY the `Kubicle_Timed_Templates`
repo, with **Contents: Read and write**. Copy it.

### 3. Deploy to Netlify
1. New site from Git, pick this repo, and set **Base directory = `submit-app`**.
   (Netlify reads `submit-app/netlify.toml` for the rest.)
2. In **Site settings -> Environment variables**, add:
   | Variable | Value |
   |---|---|
   | `ACCESS_CODE` | a shared password your team will type into the form |
   | `GITHUB_TOKEN` | the fine-grained token from step 2 |
   | `GITHUB_REPO` | `mhendersonkubicle/Kubicle_Timed_Templates` |
   | `R2_ACCOUNT_ID` | your Cloudflare account id |
   | `R2_ACCESS_KEY_ID` | from step 1 |
   | `R2_SECRET_ACCESS_KEY` | from step 1 |
   | `R2_BUCKET` | the bucket name (e.g. `lesson-uploads`) |
3. Deploy. Open the site URL, that's the form.
4. (Recommended) Once you have the Netlify URL, tighten the R2 CORS `AllowedOrigins`
   from `*` to just that URL.

## Using it
Open the URL, enter the access code, fill the lesson fields, attach the SRT + MP3,
and submit. The build starts on its own; the finished project appears under
`projects/<courseId>-l<n>/` in the repo. Pull and render locally.

## Notes
- Secrets live only in Netlify (server-side) and never reach the browser.
- The build downloads the files from the presigned links (valid 24h), so builds
  must start within a day of submission (they start within seconds).
- This is internal: the `ACCESS_CODE` gate + your Anthropic spend cap are the
  guardrails. Don't share the URL + code outside the team.
