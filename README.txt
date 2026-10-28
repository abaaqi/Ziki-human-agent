Owner Mandates for Ziki - clickable prototype
=============================================

A copy of Ziki's screens, UI only, with the Owner Mandates interaction built in.
Everything in it is sample data, and nothing connects to the real Ziki.

DEPLOY ON WINDOWS
Double-click deploy.bat. If you are not logged in to Vercel, it walks you through
logging in first, then deploys the prototype to production and prints the link.
Share the link on the "Aliased" line, usually https://ziki-owner-mandates.vercel.app
(Vercel adds a suffix if that name is taken). The longer "Production" link may ask
visitors to log in to Vercel.

The Vercel project is named after the folder, ziki-owner-mandates. If you deployed
the earlier proposal website, this replaces it at the same link.

DEPLOY BY HAND (any computer with Node.js)
  cd ziki-owner-mandates
  npx vercel@latest deploy --prod

DEPLOY ON RENDER INSTEAD
Put the contents of the ziki-owner-mandates folder in a GitHub repository. On
https://dashboard.render.com choose New, then Static Site, and pick that repository.
Leave the build command empty and set the publish directory to . (a single dot).

TRY IT
Open the link and press "Start here: 2-minute walkthrough" at the bottom right.
"Why this exists" in the top bar explains the reasoning, and Reset starts over.

WHAT IS IN HERE
  deploy.bat              deploys the ziki-owner-mandates folder to Vercel
  ziki-owner-mandates\    the built site: index.html, app.js, app.css, fonts, icons
  source\                 the code it is built from: React, compiled against
                          Ziki's own stylesheets (source\styles\ziki)

CHANGE AND REBUILD (needs Node.js 20 or newer)
  cd source
  npm install
  npm run build
Then copy everything inside source\dist into ziki-owner-mandates\ and run deploy.bat.

The stylesheets in source\styles\ziki come from the Ziki repository; its licence is
in ZIKI-LICENSE.txt. Inter, Manrope and Geist Mono are under the SIL Open Font
License, and the icons come from Lucide. Their licences are included.
