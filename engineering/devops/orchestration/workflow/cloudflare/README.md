

# Create workflow
npm create cloudflare@latest workflows-starter -- --template "cloudflare/workflows-starter"

# deploy
npx wrangler deploy

npx wrangler workflows list

npx wrangler workflows trigger workflows-starter '{"hello":"world"}'