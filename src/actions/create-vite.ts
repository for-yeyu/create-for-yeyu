import { execa } from "execa";
import { logger } from "../utils/logger.js";

export async function createViteProject(projectName: string): Promise<void> {
  logger.info("正在调用 Vite 创建项目...");
  logger.log("");

  try {
    await execa("npm", ["create", "vite@latest", projectName], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Vite 项目创建失败: ${error.message}`);
    }
    throw error;
  }
}
