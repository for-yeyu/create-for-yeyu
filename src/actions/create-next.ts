import { execa } from "execa";
import { logger } from "../utils/logger.js";

export async function createNextProject(projectName: string): Promise<void> {
  logger.info("Creating project with Create Next App...");
  logger.log("");

  try {
    await execa("npx", ["create-next-app@latest", projectName], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to create Next.js project: ${error.message}`);
    }
    throw error;
  }
}
