import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { promptProjectName, promptTemplate } from "./prompts.js";
import { getTemplateByValue, type Template } from "./templates.js";
import { cloneRepo } from "./actions/clone-repo.js";
import { createViteProject } from "./actions/create-vite.js";
import { createNextProject } from "./actions/create-next.js";
import { logger } from "./utils/logger.js";

const VERSION = "1.0.0";

interface CLIOptions {
  template?: string;
}

async function executeTemplate(
  template: Template,
  projectName: string
): Promise<void> {
  const targetPath = path.resolve(process.cwd(), projectName);

  if (template.type === "git") {
    if (fs.existsSync(targetPath)) {
      logger.error(`目录 ${projectName} 已存在`);
      process.exit(1);
    }

    if (!template.repo) {
      logger.error("模板仓库地址未配置");
      process.exit(1);
    }

    await cloneRepo(template.repo, projectName);
    printSuccessMessage(projectName);
  } else if (template.type === "vite") {
    await createViteProject(projectName);
  } else if (template.type === "next") {
    await createNextProject(projectName);
  }
}

function printSuccessMessage(projectName: string): void {
  console.log();
  logger.success(chalk.green.bold("🎉 项目创建成功！"));
  console.log();
  logger.log(chalk.cyan("  下一步:"));
  logger.log(`    cd ${chalk.yellow(projectName)}`);
  logger.log(`    ${chalk.yellow("pnpm install")}`);
  logger.log(`    ${chalk.yellow("pnpm dev")}`);
  console.log();
}

function printBanner(): void {
  console.log();
  console.log(chalk.cyan.bold("  ╔═══════════════════════════════════╗"));
  console.log(chalk.cyan.bold("  ║                                   ║"));
  console.log(chalk.cyan.bold("  ║           for-yeyu CLI            ║"));
  console.log(chalk.cyan.bold("  ║                                   ║"));
  console.log(chalk.cyan.bold("  ╚═══════════════════════════════════╝"));
  console.log();
}

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name("for-yeyu")
    .description("一个用于快速创建项目的脚手架工具")
    .version(VERSION)
    .argument("[project-name]", "项目名称")
    .option(
      "-t, --template <template>",
      "指定模板 (nest, evm-dapp, vite, next)"
    )
    .action(async (projectName: string | undefined, options: CLIOptions) => {
      printBanner();

      try {
        let finalProjectName = projectName;
        let template: Template;

        if (!finalProjectName) {
          finalProjectName = await promptProjectName();
        }

        if (options.template) {
          const foundTemplate = getTemplateByValue(options.template);
          if (!foundTemplate) {
            logger.error(`未找到模板: ${options.template}`);
            logger.info("可用模板: nest, evm-dapp, vite, next");
            process.exit(1);
          }
          template = foundTemplate;
        } else {
          template = await promptTemplate();
        }

        await executeTemplate(template, finalProjectName);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message);
        }
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}
