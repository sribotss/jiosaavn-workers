JioSaavn API for Cloudflare Workers [Unofficial]
Show some :heart: and :star: the repo to support the project
GitHub stars GitHub followers
Cloudflare Workers
made-with-javascript

JioSaavn API adapted for Cloudflare Workers using JavaScript
NOTE: This is a Cloudflare Workers adaptation of the original JioSaavnAPI by cyberboysumanjay. You don't need to have JioSaavn link of the song in order to fetch the song details, you can directly search songs by their name. Fetching Songs/Albums/Playlists from URL is also supported in this API.
Features:
Currently the API can get the following details for a specific song in JSON format:
Song Name
Singer Name
Album Name
Album URL
Duration of Song
Song Thumbnail URL (Max Resolution)
Song Language
Download Link
Release Year
Album Art Link (Max Resolution)
Lyrics
.... and much more!
json

Line Wrapping

Collapse
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
⌄
{
    "album": "BIBA",
    "album_url": "https://www.jiosaavn.com/album/biba/98G3uzIs2qQ_",
    "autoplay": "false",
    "duration": "175",
    "e_songid": "ICERW0MFfQs",
    "has_rbt": "false",
    "image_url": "https://c.saavncdn.com/987/BIBA-English-2019-20190201201359-500x500.jpg",
    "label": "Joytime Collective",
    "label_url": "/label/joytime-collective-albums/",
    "language": "hindi",
    "liked": "false",
    "map": "Marshmello^~^/artist/marshmello-songs/Eevs5FiVgus_^~^Pritam Chakraborty^~^/artist/pritam-chakraborty-songs/OaFg9HPZgq8_^~^Shirley Setia^~^/artist/shirley-setia-songs/9qGdjoPJ1vM_^~^Pardeep Singh Sran^~^/artist/pardeep-singh-sran-songs/NIfiZRCrYQA_^~^Dev Negi^~^/artist/dev-negi-songs/NpCqdI4dD5U_",
    "music": "",
    "origin": "search",
    "origin_val": "biba",
    "page": 1,
    "pass_album_ctx": "true",
    "perma_url": "https://www.jiosaavn.com/song/biba/ICERW0MFfQs",
    "publish_to_fb": true,
    "singers": "Marshmello, Pritam Chakraborty, Shirley Setia, Pardeep Singh Sran, Dev Negi",
    "songid": "PIzj75J8",
    "starred": "false",
    "starring": "",
    "streaming_source": null,
    "tiny_url": "https://www.jiosaavn.com/song/biba/ICERW0MFfQs",
    "title": "BIBA",
    "twitter_url": "http://twitter.com/share?url=https%3A%2F%2Fwww.jiosaavn.com%2Fsong%2Fbiba%2FICERW0MFfQs&text=%23NowPlaying+%22BIBA%22+%40jiosaavn+%23OurSoundtrack&related=jiosaavn",
    "url": "http://h.saavncdn.com/987/cd902d048c13e5ce6ca84cc409746a5d.mp3",
    "year": "2019"
  }
Installation & Deployment:
Prerequisites:
Node.js (version 16 or higher)
Cloudflare account
Wrangler CLI
Setup:
Clone this repository:
sh

Line Wrapping

Collapse
Copy
1
2
$ git clone https://github.com/yourusername/jiosaavn-api-worker.git
$ cd jiosaavn-api-worker
Install dependencies:
sh

Line Wrapping

Collapse
Copy
1
$ npm install
Login to Cloudflare:
sh

Line Wrapping

Collapse
Copy
1
$ npx wrangler login
Configure your worker:
sh

Line Wrapping

Collapse
Copy
1
$ npx wrangler config
Deployment:
Deploy to Cloudflare Workers:
sh

Line Wrapping

Collapse
Copy
1
$ npm run deploy
For specific environments:
sh

Line Wrapping

Collapse
Copy
1
2
$ npm run deploy:staging    # Deploy to staging
$ npm run deploy:production # Deploy to production
Local Development:
sh

Line Wrapping

Collapse
Copy
1
$ npm run dev
Navigate to http://localhost:8787 to see the API in action locally.

Usage:
Fetching lyrics is optional and is triggered only when it is passed as an argument in the GET Request. (&lyrics=true)
If you enable lyrics search, it will take more time to fetch results

Universal Endpoint: (Supports Song Name, Song Link, Album Link, Playlist Link)
sh

Line Wrapping

Collapse
Copy
1
https://your-worker.your-subdomain.workers.dev/result/?query=<insert-jiosaavn-link-or-query-here>&lyrics=true
Example: Navigate to https://your-worker.your-subdomain.workers.dev/result/?query=alone to get a JSON response of songs data in return.

Song URL Endpoint:
sh

Line Wrapping

Collapse
Copy
1
https://your-worker.your-subdomain.workers.dev/song/?query=<insert-jiosaavn-song-link>&lyrics=true
Example: Navigate to https://your-worker.your-subdomain.workers.dev/song/?query=https://www.jiosaavn.com/song/khairiyat/PwAFSRNpAWw to get a JSON response of song data in return.

Playlist URL Endpoint:
sh

Line Wrapping

Collapse
Copy
1
https://your-worker.your-subdomain.workers.dev/playlist/?query=<insert-jiosaavn-playlist-link>&lyrics=true
Example: Navigate to https://your-worker.your-subdomain.workers.dev/playlist/?query=https://www.jiosaavn.com/featured/romantic-hits-2020---hindi/ABiMGqjovSFuOxiEGmm6lQ__ to get a JSON response of playlist data in return.

Album URL Endpoint:
sh

Line Wrapping

Collapse
Copy
1
https://your-worker.your-subdomain.workers.dev/album/?query=<insert-jiosaavn-album-link>&lyrics=true
Example: Navigate to https://your-worker.your-subdomain.workers.dev/album/?query=https://www.jiosaavn.com/album/chhichhore/V4F3M5,cNb4_ to get a JSON response of album data in return.

Lyrics Endpoint:
sh

Line Wrapping

Collapse
Copy
1
https://your-worker.your-subdomain.workers.dev/lyrics/?query=<insert-jiosaavn-song-link-or-song-id>&lyrics=true
Example: Navigate to https://your-worker.your-subdomain.workers.dev/lyrics/?query=https://www.jiosaavn.com/song/khairiyat/PwAFSRNpAWw to get a JSON response of lyrics data in return.

Configuration:
Environment Variables:
You can set environment variables in your wrangler.toml file or through the Cloudflare dashboard:

toml

Line Wrapping

Collapse
Copy
1
2
3
[env.production.vars]
API_VERSION = "1.0.0"
ENVIRONMENT = "production"
Custom Domain:
To use a custom domain, uncomment and configure the routes in wrangler.toml:

toml

Line Wrapping

Collapse
Copy
1
2
3
4
[env.production]
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
KV Storage (Optional):
For caching responses, you can enable KV storage:

toml

Line Wrapping

Collapse
Copy
1
2
3
[[kv_namespaces]]
binding = "JIO_SAAVN_CACHE"
id = "your-kv-namespace-id"
Benefits of Cloudflare Workers:
Global CDN: Your API will be served from Cloudflare's global network
Free Tier: Generous free tier with 100,000 requests/day
Auto-scaling: Automatically scales with traffic
Low Latency: Edge computing reduces response times
DDoS Protection: Built-in DDoS protection
SSL/TLS: Automatic SSL certificate management
Rate Limiting:
Consider implementing rate limiting to prevent abuse. You can use Cloudflare's built-in rate limiting or implement custom logic using Durable Objects.

Monitoring:
Cloudflare Workers provides built-in monitoring through the Cloudflare dashboard, including:

Request metrics
Error rates
Response times
CPU usage
Troubleshooting:
Common Issues:
CORS Errors: The API includes CORS headers, but ensure your client-side requests are properly configured
Decryption Failures: Some URLs may fail to decrypt due to changes in JioSaavn's encryption
Rate Limiting: JioSaavn may rate limit requests; consider adding delays between requests
Debugging:
Use wrangler dev for local development and debugging:

sh

Line Wrapping

Collapse
Copy
1
$ npm run dev
Contributing:
Fork the repository
Create a feature branch
Make your changes
Test thoroughly
Submit a pull request
License:
This project is licensed under the MIT License - see the LICENSE file for details.

Disclaimer:
This is an unofficial API and is not affiliated with JioSaavn. Use responsibly and respect JioSaavn's terms of service. The developers are not responsible for any misuse of this API.

Made using this API :heart: