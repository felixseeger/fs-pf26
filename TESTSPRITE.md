# Testing this project with TestSprite

[TestSprite](https://www.testsprite.com/) is an AI-powered testing tool that runs via **MCP (Model Context Protocol)** inside Cursor. Use this guide to install it and run your first test on **fs-pf26** (Next.js + headless WordPress).

---

## 1. Prerequisites

- **Node.js >= 22**  
  Check: `node --version`. [Download](https://nodejs.org/) if needed.
- **TestSprite account**  
  [Sign up for free](https://www.testsprite.com/auth/cognito/sign-up).
- **API key**  
  In [TestSprite Dashboard](https://www.testsprite.com/dashboard) → **Settings** → **API Keys** → **New API Key** → copy the key.

---

## 2. Install TestSprite MCP in Cursor

### Option A – One-click (quick)

1. Get your [API key](https://www.testsprite.com/dashboard) (see above).
2. Open this link in Cursor:  
   [TestSprite one-click install for Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=TestSprite&config=eyJjb21tYW5kIjoibnB4IEB0ZXN0c3ByaXRlL3Rlc3RzcHJpdGUtbWNwQGxhdGVzdCIsImVudiI6eyJBUElfS0VZIjoiIn19)
3. When prompted, paste your **API key**.
4. Confirm. The TestSprite MCP server should appear with a green dot when connected.

### Option B – Manual config

1. Open **Cursor Settings** (e.g. `Ctrl+Shift+J` / `Cmd+Shift+J`).
2. Go to **Tools & Integration** → **Add custom MCP** (or open your MCP config file).
3. Add the TestSprite server (replace `your-api-key` with your real key):

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

4. Save. Restart Cursor if needed. Check that the TestSprite server shows as connected (green dot).

---

## 3. Cursor sandbox / Auto-Run (important)

For TestSprite to run tests fully, Cursor must not restrict MCP to the sandbox:

1. **Cursor** → **Settings** → **Cursor Settings**.
2. **Chat** → **Auto-Run** → **Auto-Run Mode**.
3. Set to **"Ask Every time"** or **"Run Everything"** (not a mode that blocks MCP).

See [TestSprite docs – Cursor Sandbox](https://docs.testsprite.com/mcp/getting-started/installation#cursor-sandbox-mode-configuration).

---

## 4. Prepare the project for testing

- **Start the app** so TestSprite can reach it:
  ```bash
  pnpm dev
  ```
  Default URL: **http://localhost:3000**.

- **Optional:** Have a short PRD or feature list ready. When you run your first test, TestSprite will open a config page in the browser and ask for:
  - **Testing type:** Frontend (UI/flows), Backend (APIs), or Codebase.
  - **Application URL:** e.g. `http://localhost:3000` for the Next.js app.
  - **Product Requirements Document (PRD):** You can upload a draft; TestSprite will normalize it. You can use a short doc describing: homepage, portfolio, blog, about/contact, menus, dark mode, cookie consent, etc.

---

## 5. Run your first test

1. Ensure **TestSprite MCP** is connected (green dot in Cursor).
2. Ensure the dev server is running: `pnpm dev`.
3. In **Cursor Chat**, type:
   ```text
   Can you test this project with TestSprite?
   ```
4. Send the message. The AI will use TestSprite tools and guide you.
5. When the **Testing Configuration** page opens in the browser, fill in:
   - **Testing type:** e.g. **Frontend** (for UI/navigation) or **Codebase** (full sweep).
   - **Application URL:** `http://localhost:3000`.
   - **PRD:** Upload `testsprite_prd.md` from this repo (or paste a short doc – see above).
   - **Test account:** Leave empty unless your app has login.
6. Complete the config and let the run finish. Results will appear in the chat and in your project under `testsprite_tests/` (reports, test cases, etc.).

### Quick checklist before running

- [ ] Node.js >= 22 (`node --version`)
- [ ] TestSprite MCP installed and connected (green dot in Cursor)
- [ ] Cursor Auto-Run set to "Ask every time" or "Run everything"
- [ ] Dev server running: `pnpm dev` → app at http://localhost:3000
- [ ] PRD ready: use `testsprite_prd.md` when the config page asks for it

---

## 6. After the first run

- **Reports:** Check `testsprite_tests/` for:
  - `TestSprite_MCP_Test_Report.md` / `.html`
  - `test_results.json`, `standard_prd.json`, generated test cases (e.g. `TC001_*.py`).
- **Fix failures:** In chat you can say:
  ```text
  Please fix the codebase based on TestSprite testing results.
  ```

---

## 7. Project-specific notes (fs-pf26)

| Item        | Note |
|------------|------|
| **App URL** | `http://localhost:3000` when using `pnpm dev`. |
| **Backend** | WordPress at `WORDPRESS_API_URL` (from `.env.local`). TestSprite typically tests the **frontend**; backend is separate. |
| **Auth**    | No login in the app; leave test credentials empty unless you add auth later. |
| **Static export** | Production uses `output: 'export'`. For TestSprite, running the **dev server** is enough so the app is reachable at a URL. |

---

## Links

- [TestSprite – Installation (MCP)](https://docs.testsprite.com/mcp/getting-started/installation)
- [TestSprite – First MCP Test](https://docs.testsprite.com/mcp/getting-started/first-test)
- [TestSprite Dashboard & API keys](https://www.testsprite.com/dashboard)
