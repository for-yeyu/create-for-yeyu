import degit from "degit";
import { execa } from "execa";
import path from "node:path";
import fsExtra from "fs-extra";
import { createNyanCatAnimation } from "../utils/nyan-cat.js";
import { logger } from "../utils/logger.js";

export interface CloneRepoOptions {
  initGit?: boolean;
}

async function updatePackageJsonName(
  targetPath: string,
  projectName: string
): Promise<void> {
  try {
    const packageJsonPath = path.join(targetPath, "package.json");
    const packageJsonContent = await fsExtra.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    const newPackageJson: Record<string, unknown> = {
      name: projectName,
    };

    for (const [key, value] of Object.entries(packageJson)) {
      if (key !== "name") {
        newPackageJson[key] = value;
      }
    }

    await fsExtra.writeFile(
      packageJsonPath,
      JSON.stringify(newPackageJson, null, 2) + "\n"
    );
  } catch (error) {
    logger.warning("Failed to update package.json name field");
  }
}

export async function cloneRepo(
  repo: string,
  projectName: string,
  options: CloneRepoOptions = {}
): Promise<void> {
  const { initGit = true } = options;
  const targetPath = path.resolve(process.cwd(), projectName);
  const animation = createNyanCatAnimation(`Cloning template ${repo}...`);

  animation.start();

  const timeoutId = setTimeout(() => {
    animation.updateMessage(
      `😿 Cloning template ${repo}... (It's taking a while, maybe check your proxy?) miao~`
    );
  }, 5000);

  try {
    const emitter = degit(repo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetPath);
    clearTimeout(timeoutId);
    animation.stop(true, "Template cloned successfully!");

    await updatePackageJsonName(targetPath, projectName);

    if (initGit) {
      await execa("git", ["init"], { cwd: targetPath });
      await execa("git", ["add", "."], { cwd: targetPath });
      await execa(
        "git",
        ["commit", "-m", "initial commit from create-for-yeyu", "--no-verify"],
        { cwd: targetPath }
      );
      logger.success("Git repository initialized with initial commit");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    animation.stop(false, "Failed to clone template");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}
