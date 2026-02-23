# MPS Dental Chatbot – Setup (do this once)

## 1. Open terminal in the project folder

You must be **inside** the `dental-chatbot` folder (where this file is).

```powershell
cd C:\Users\myree\OneDrive\Desktop\mps\dental-chatbot
```

## 2. Install dependencies

```powershell
npm install
```

Wait until it finishes. You should see something like "added X packages".

## 3. Add your Groq API key

1. Open **https://console.groq.com**
2. Sign up / log in
3. Go to **API Keys** → **Create API Key** → copy the key
4. Open the file **`.env.local`** in this folder (`dental-chatbot`)
5. Set (replace with your real key):

```
GROQ_API_KEY=paste_your_key_here
```

Save the file. No quotes, no spaces.

## 4. Start the app

```powershell
npm run dev
```

When you see **"Ready"**, open **http://localhost:3000** in your browser.

## 5. Test

Click a suggested question or type one. You should get an answer.

---

**If it still doesn’t work:**  
Check the **terminal** where `npm run dev` is running for red error text, and the **red error box** on the page. Copy that message so someone can help.
