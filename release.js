const { execSync } = require("child_process");
const { writeFileSync, copyFileSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

const { version } = require("./package.json");

function exec(command, cwd = __dirname) {
  console.log(`> ${command}`);

  let output;

  try {
    output = execSync(command, { cwd, encoding: "utf8" });
  } catch (ex) {
    console.error(ex.stdout ? ex.stdout : ex.stderr);

    process.exit(1);
  }

  output = output.trim();

  console.log(`${output}`);

  console.log();

  return output;
}

const eslintVersion = exec("npm view eslint@latest version");

if (!/^\d+\.\d+\.\d+$/.test(eslintVersion)) {
  console.error(`Invalid ESLint version: ${eslintVersion}`);

  process.exit(1);
}

console.log(`> Curent version: ${version}`);

console.log();

if (eslintVersion === version) {
  console.log("No update available on ESLint");
} else {
  const tempDir = tmpdir();

  const eslintCloneDir = join(tempDir, "eslint");

  exec(
    `git clone --depth 1 --branch v${eslintVersion} https://github.com/eslint/eslint.git ${eslintCloneDir}`,
    tempDir
  );

  exec("npm install", eslintCloneDir);

  exec("npm run build:webpack", eslintCloneDir);

  copyFileSync(
    join(eslintCloneDir, "build", "eslint.js"),
    join(__dirname, "eslint.js")
  );

  exec("npm install");

  exec(`npm install eslint@${eslintVersion} --save-dev --save-exact`);

  exec(`npm --no-git-tag-version version ${eslintVersion}`);

  exec('git config user.email "<>"');
  exec('git config user.name "Github Actions"');

  exec(`git commit -am "Update ESLint to v${eslintVersion}"`);

  exec(`git tag v${eslintVersion}`);

  const npmrc = [
    "//registry.npmjs.org/:_authToken=${NPM_TOKEN}",
    "@valuabletouch:registry=https://registry.npmjs.org/",
    "registry=https://registry.npmjs.org/",
    "always-auth=true",
  ].join("\n");

  writeFileSync(".npmrc", npmrc);

  exec("npm publish");

  exec(
    'git push "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" HEAD:master --follow-tags'
  );
}