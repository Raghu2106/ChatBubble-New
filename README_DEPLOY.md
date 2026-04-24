# Deploying ChatBubble to Render

This app is configured to be deployed effortlessly on [Render](https://render.com).

## Steps to Deploy

1. **Push to GitHub**: Upload this codebase to a new repository on GitHub.
2. **Connect to Render**:
   - Go to the [Render Dashboard](https://dashboard.render.com).
   - Click **New +** and select **Blueprint**.
   - Connect your GitHub repository.
   - Render will automatically detect the `render.yaml` file and configure the service for you.
3. **Manual Setup (Alternative)**:
   - If you don't want to use Blueprints, click **New +** -> **Web Service**.
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`

## Why Render?
- **Free Tier**: They offer a generous free tier for Web Services.
- **Auto-SSL**: Your site will automatically have HTTPS.
- **Easy Updates**: Every time you push to GitHub, Render will automatically redeploy the app.

## Notes
- The free tier might "spin down" after inactivity. The first request after a long break might take 30-60 seconds to respond as the server wakes up.
