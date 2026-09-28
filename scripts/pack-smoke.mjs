import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const temp = await mkdtemp(join(tmpdir(), "songpyeon-pack-"));

try {
  await exec("npm", ["run", "build"], { cwd: root });
  const { stdout } = await exec("npm", ["pack", "--pack-destination", temp], { cwd: root });
  const tarball = stdout.trim().split("\n").at(-1);
  if (!tarball) {
    throw new Error("npm pack did not report a tarball.");
  }

  await writeFile(
    join(temp, "package.json"),
    JSON.stringify({
      type: "module",
      private: true,
      dependencies: {
        songpyeon: `file:${join(temp, tarball)}`
      },
      devDependencies: {
        typescript: "5.9.3"
      }
    })
  );
  await writeFile(
    join(temp, "smoke.ts"),
    `import { createSongpyeonAvatar, renderSongpyeonSvg } from "songpyeon";

const avatar = createSongpyeonAvatar("포장 테스트", { palette: "mugwort" });
const svg: string = renderSongpyeonSvg(avatar.seed, avatar.options);
if (!svg.includes("<svg") || avatar.traits.palette !== "mugwort") {
  throw new Error("Installed package API failed.");
}
`
  );
  await writeFile(
    join(temp, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        skipLibCheck: false
      },
      include: ["smoke.ts"]
    })
  );

  await writeFile(
    join(temp, "smoke.mjs"),
    `import { createSongpyeonAvatar } from "songpyeon";
const avatar = createSongpyeonAvatar("포장 테스트", { palette: "mugwort" });
if (!avatar.svg.includes("<svg")) throw new Error("Runtime import failed.");
`
  );

  await writeFile(
    join(temp, "smoke.cjs"),
    `const { createSongpyeonAvatar } = require("songpyeon");
const avatar = createSongpyeonAvatar("포장 테스트", { palette: "mugwort" });
if (!avatar.svg.includes("<svg") || avatar.traits.palette !== "mugwort") {
  throw new Error("CommonJS runtime import failed.");
}
`
  );

  await exec("npm", ["install", "--ignore-scripts"], { cwd: temp });
  await exec("npx", ["tsc", "--noEmit"], { cwd: temp });
  await exec("node", ["smoke.mjs"], { cwd: temp });
  await exec("node", ["smoke.cjs"], { cwd: temp });
  console.log(`Pack smoke passed with ${tarball}: ESM, CommonJS, strict declarations.`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
