// Builds the static prototype into dist/: CSS with Ziki's stylesheets, one JS bundle, fonts and icons.
// Works on Windows, macOS and Linux: run `npm install`, then `npm run build`.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// Tailwind's CLI is run through Node itself, so no shell or .cmd shim is involved.
const tailwind = path.join(root, "node_modules", "@tailwindcss", "cli", "dist", "index.mjs");
execFileSync(process.execPath, [tailwind, "-i", "styles/input.css", "-o", "dist/app.css", "--minify"], { cwd: root, stdio: "inherit" });

await esbuild.build({
  entryPoints: [path.join(root, "src", "main.jsx")],
  outfile: path.join(dist, "app.js"),
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2019",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

fs.cpSync(path.join(root, "public"), dist, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
fs.copyFileSync(path.join(root, "ZIKI-LICENSE.txt"), path.join(dist, "ZIKI-LICENSE.txt"));
fs.writeFileSync(
  path.join(dist, "vercel.json"),
  JSON.stringify({ cleanUrls: true, headers: [{ source: "/fonts/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }] }, null, 2) + "\n",
);
for (const file of fs.readdirSync(dist)) {
  const stat = fs.statSync(path.join(dist, file));
  if (stat.isFile()) console.log(`${file.padEnd(22)} ${(stat.size / 1024).toFixed(1)} KB`);
}
