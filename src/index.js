import { getIpAddress, makeHosts } from "./util.js";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

getIpAddress().then(async (res) => {
  const keys = Object.keys(res).sort();
  let ipAddress = ``;
  for (const key of keys) {
    res[key].forEach((record) => {
      ipAddress = `${ipAddress}
${record}`;
    });
  }
  const hosts = makeHosts(new Date().toLocaleString(), ipAddress);

  try {
    // write hosts
    const hostsFile = resolve(__dirname, "../HOSTS");
    await fs.writeFile(hostsFile, hosts, "utf8");
    console.log("\nwrite hosts success\n");

    // write readme
    const readmeFile = resolve(__dirname, "../README.md");
    const data = await fs.readFile(readmeFile, "utf8");
    const regex =
      /<!-- github hosts start -->([\s\S]*?)<!-- github hosts end -->/;
    const newData = data.replace(
      regex,
      (match, capturedContent) =>
        `<!-- github hosts start -->\n\`\`\`bash\n${hosts}\n\`\`\`\n<!-- github hosts end -->`
    );

    await fs.writeFile(readmeFile, newData, "utf8");
    console.log("\nwrite README.md success\n");
  } catch (error) {
    console.error("error writing file:", error);
  }
});
