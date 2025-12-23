import degit from "degit";
import { execa } from "execa";
import path from "node:path";
import { createTrainAnimation } from "../utils/train-animation.js";
import { logger } from "../utils/logger.js";

export async function cloneRepo(
  repo: string,
  projectName: string
): Promise<void> {
  const targetPath = path.resolve(process.cwd(), projectName);
  const train = createTrainAnimation(`Cloning template ${repo}...`);

  train.start();

  try {
    const emitter = degit(repo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetPath);
    train.stop(true, "Template cloned successfully!");

    await execa("git", ["init"], { cwd: targetPath });
    logger.success("Git repository initialized");
  } catch (error) {
    train.stop(false, "Failed to clone template");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}
