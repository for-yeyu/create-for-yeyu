import degit from "degit";
import path from "node:path";
import { createSpinner } from "../utils/spinner.js";
import { logger } from "../utils/logger.js";

export async function cloneRepo(
  repo: string,
  projectName: string
): Promise<void> {
  const targetPath = path.resolve(process.cwd(), projectName);
  const spinner = createSpinner(`Cloning template ${repo}...`);

  spinner.start();

  try {
    const emitter = degit(repo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetPath);
    spinner.succeed("Template cloned successfully!");
  } catch (error) {
    spinner.fail("Failed to clone template");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}
