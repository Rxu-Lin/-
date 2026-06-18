import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const pages = [
  "index.html",
  "path-converter.html",
  "AI周报.html",
  "legacy-kol-portal.html"
];

const minifier = process.platform === "win32" ? "npx.cmd" : "npx";
const tmpRoot = mkdtempSync(join(tmpdir(), "buycoor-release-"));

const guardScript = `<script>
(()=>{if(window.__buycoorGuard)return;window.__buycoorGuard=true;const block=e=>{e.preventDefault();e.stopPropagation()};document.addEventListener("contextmenu",block,{capture:true});document.addEventListener("keydown",e=>{const k=(e.key||"").toLowerCase();if(k==="f12"||((e.ctrlKey||e.metaKey)&&["u","s","p"].includes(k))||((e.ctrlKey||e.metaKey)&&e.shiftKey&&["i","j","c"].includes(k)))block(e)},{capture:true})})();
</script>`;

function ensureRobotsMeta(html) {
  if (/name=["']robots["']/i.test(html)) return html;
  const meta = '<meta name="robots" content="noindex,nofollow,noarchive,noimageindex">';
  if (/<meta[^>]+name=["']description["'][^>]*>/i.test(html)) {
    return html.replace(/(<meta[^>]+name=["']description["'][^>]*>)/i, `$1\n    ${meta}`);
  }
  if (/<meta[^>]+name=["']viewport["'][^>]*>/i.test(html)) {
    return html.replace(/(<meta[^>]+name=["']viewport["'][^>]*>)/i, `$1\n    ${meta}`);
  }
  return html.replace(/<head>/i, `<head>\n    ${meta}`);
}

function ensureGuard(html) {
  if (html.includes("window.__buycoorGuard")) return html;
  return html.replace(/<\/body>/i, `${guardScript}\n</body>`);
}

function prepare(html) {
  return ensureGuard(ensureRobotsMeta(html)).replace(/\/\/# sourceMappingURL=.*$/gm, "");
}

function quoteArg(arg) {
  if (/^[a-zA-Z0-9_@%+=:,./\\-]+$/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '\\"')}"`;
}

function runMinifier(args) {
  if (process.platform === "win32") {
    const command = [minifier, ...args].map(quoteArg).join(" ");
    return spawnSync("cmd.exe", ["/d", "/s", "/c", command], { stdio: "inherit" });
  }
  return spawnSync(minifier, args, { stdio: "inherit" });
}

try {
  pages.forEach((page, index) => {
    if (!existsSync(page)) {
      throw new Error(`Missing expected page: ${page}`);
    }

    const tempInput = join(tmpRoot, `${index}.input.html`);
    const tempOutput = join(tmpRoot, `${index}.output.html`);
    writeFileSync(tempInput, prepare(readFileSync(page, "utf8")), "utf8");

    const args = [
      "--yes",
      "html-minifier-terser@7.2.0",
      "--collapse-whitespace",
      "--conservative-collapse",
      "--remove-comments",
      "--remove-redundant-attributes",
      "--remove-script-type-attributes",
      "--remove-style-link-type-attributes",
      "--minify-css",
      "true",
      "--minify-js",
      "true",
      "--quote-character",
      '"',
      "-o",
      tempOutput,
      tempInput
    ];

    const result = runMinifier(args);
    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(`Failed to harden ${page}`);
    }

    writeFileSync(page, `${readFileSync(tempOutput, "utf8").trim()}\n`, "utf8");
  });
} finally {
  rmSync(tmpRoot, { recursive: true, force: true });
}

console.log(`Hardened ${pages.length} pages for static release.`);
