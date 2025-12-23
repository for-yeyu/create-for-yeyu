import { execa } from "execa";
import { logger } from "../utils/logger.js";

export async function createViteProject(projectName: string): Promise<void> {
  logger.info("Creating project with Vite...");
  logger.log("");

  try {
    await execa("npm", ["create", "vite@latest", projectName], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to create Vite project: ${error.message}`);
    }
    throw error;
  }
}
