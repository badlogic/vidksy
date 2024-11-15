# Vidsky
Simple client-side only web-app that lets you enter a Bluesky post URL and downloads any GIF or video contained in it. Bluesky uses [Http Live Streaming](https://en.wikipedia.org/wiki/HTTP_Live_Streaming), so the web app includes a [WASM build of FFMPEG](https://github.com/ffmpegwasm/ffmpeg.wasm) to convert the video to a plain old MP4.

[Use Vidsky](https://vidsky.mariozechner.at)

# Development
```bash
npm install
# Downloads FFMPEG to html/assets. Only needed once or when you change the FFMPEG version
node download-ffmpeg.js
# spawns a live server on http://localhost:3000
npm run dev
# transpiles TypeScript sources via esbuild and puts them in html/build
npm run build
```

If you want to deploy Vidsky yourself, just use trigger a build via `npm run build`, then rsync the `html/` folder to a web server, like it's 2003. You can probably cut down on the files in `assets/` significantly, but I couldn't be bothered to fix that up in `download-ffmpeg.js`. PRs welcome.

Use the `dev` launch configuration in VS Code to start a new Chrome session with debugging support for fancy pants developments.

Ignore all the stuff in `docker/` and the bash scripts in the root directory. Those are for my own infrastructure.