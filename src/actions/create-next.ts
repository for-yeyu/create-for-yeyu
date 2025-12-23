import { execa } from "execa";
import { logger } from "../utils/logger.js";

export async function createNextProject(projectName: string): Promise<void> {
  logger.info("正在调用 Create Next App 创建项目...");
  logger.log("");

  try {
    await execa("npx", ["create-next-app@latest", projectName], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Next.js 项目创建失败: ${error.message}`);
    }
    throw error;
  }
}
