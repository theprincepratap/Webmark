# Deployment Guide for Webmark

This guide covers deploying Webmark to production using popular free hosting platforms.

## Quick Summary

| Component | Recommended Platform | Free Tier |
|-----------|---------------------|-----------|
| Backend | [Render](https://render.com) | 750 hours/month |
| Frontend | [Vercel](https://vercel.com) | Unlimited |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) | 512MB free |

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free account
3. Create a new **FREE** cluster (M0 Sandbox)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/webmark?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your credentials
7. **Important**: Add `0.0.0.0/0` to IP Access List (Network Access → Add IP Address)

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare Your Code

Make sure your `server/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2.2 Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `webmark-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Add Environment Variables

In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://...` (from Atlas) |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://your-app.vercel.app` (add after deploying frontend) |
| `USE_ETHEREAL` | `false` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password |

6. Click **"Create Web Service"**
7. Wait for deployment (2-5 minutes)
8. Copy your backend URL: `https://webmark-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Client

Create `client/.env.production`:
```env
VITE_API_URL=https://webmark-api.onrender.com/api
```

### 3.2 Deploy to Vercel

**Option A: Vercel CLI**
```bash
cd client
npm install -g vercel
vercel --prod
```

**Option B: Vercel Dashboard**

1. Go to [Vercel](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://webmark-api.onrender.com/api`
6. Click **"Deploy"**
7. Your app is live! Copy the URL (e.g., `https://webmark.vercel.app`)

### 3.3 Update Backend CORS

Go back to Render and update:
- `CLIENT_URL` = `https://webmark.vercel.app`

---

## Step 4: Configure Email for Production

### Option A: Gmail (Simple)

1. Enable 2-Step Verification on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Set in Render environment variables:
   - `EMAIL_USER` = `your-email@gmail.com`
   - `EMAIL_PASS` = `your-app-password`
   - `USE_ETHEREAL` = `false`

### Option B: SendGrid (Recommended for Production)

1. Create free account at [SendGrid](https://sendgrid.com)
2. Get API key from Settings → API Keys
3. Update email configuration (requires code change)

---

## Alternative Deployment Options

### Backend Alternatives

| Platform | Pros | Cons |
|----------|------|------|
| [Railway](https://railway.app) | Easy, $5 free credit | Limited free tier |
| [Fly.io](https://fly.io) | Global, low latency | Complex setup |
| [Cyclic](https://cyclic.sh) | Always on | Limited customization |

### Frontend Alternatives

| Platform | Pros | Cons |
|----------|------|------|
| [Netlify](https://netlify.com) | Forms, functions | Slightly slower |
| [Cloudflare Pages](https://pages.cloudflare.com) | Fast CDN | Less features |
| [GitHub Pages](https://pages.github.com) | Simple | No server-side |

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `CLIENT_URL` in backend matches your frontend URL exactly
- Check for trailing slashes

**2. MongoDB Connection Failed**
- Verify IP whitelist in MongoDB Atlas (use `0.0.0.0/0` for Render)
- Check connection string format

**3. Build Fails**
- Check Node.js version compatibility
- Clear cache: `npm cache clean --force`

**4. Email Not Sending**
- Verify Gmail App Password is correct
- Check `USE_ETHEREAL` is set to `false`

**5. Login/Auth Issues**
- Ensure `JWT_SECRET` is the same across restarts
- Check token expiration time

### Health Check

Test your API is running:
```bash
curl https://your-api.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Webmark API is running"
}
```

---

## Security Checklist

Before going live:

- [ ] Generate strong `JWT_SECRET` (64+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Restrict MongoDB IP access (or use VPC peering)
- [ ] Set up rate limiting (optional)
- [ ] Enable email service for password reset

---

## Estimated Costs

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| MongoDB Atlas | 512MB | $9/month (M2) |
| Render | 750 hrs/month | $7/month (Starter) |
| Vercel | Unlimited | $20/month (Pro) |
| **Total** | **$0** | ~$36/month |

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in Render/Vercel dashboards
3. Test API endpoints with Postman or curl

Happy deploying! 🚀
