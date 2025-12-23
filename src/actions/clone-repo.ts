import degit from "degit";
import path from "node:path";
import { createSpinner } from "../utils/spinner.js";
import { logger } from "../utils/logger.js";

export async function cloneRepo(
  repo: string,
  projectName: string
): Promise<void> {
  const targetPath = path.resolve(process.cwd(), projectName);
  const spinner = createSpinner(`正在克隆模板 ${repo}...`);

  spinner.start();

  try {
    const emitter = degit(repo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetPath);
    spinner.succeed("模板克隆成功！");
  } catch (error) {
    spinner.fail("模板克隆失败");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}
