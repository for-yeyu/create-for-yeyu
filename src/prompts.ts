import inquirer from "inquirer";
import { templates, type Template } from "./templates.js";

export interface UserAnswers {
  projectName: string;
  template: string;
}

export async function promptProjectName(): Promise<string> {
  const { projectName } = await inquirer.prompt<{ projectName: string }>([
    {
      type: "input",
      name: "projectName",
      message: "请输入项目名称:",
      default: "my-project",
      validate: (input: string) => {
        if (!input.trim()) {
          return "项目名称不能为空";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return "项目名称只能包含字母、数字、横线和下划线";
        }
        return true;
      },
    },
  ]);

  return projectName;
}

export async function promptTemplate(): Promise<Template> {
  const gitTemplates = templates.filter((t) => t.type === "git");
  const officialTemplates = templates.filter((t) => t.type !== "git");

  const choices = [
    ...gitTemplates.map((t) => ({
      name: `${t.name.padEnd(20)} - ${t.description}`,
      value: t.value,
    })),
    new inquirer.Separator("─".repeat(50)),
    ...officialTemplates.map((t) => ({
      name: `${t.name.padEnd(20)} - ${t.description}`,
      value: t.value,
    })),
  ];

  const { templateValue } = await inquirer.prompt<{ templateValue: string }>([
    {
      type: "list",
      name: "templateValue",
      message: "请选择项目模板:",
      choices,
    },
  ]);

  const selectedTemplate = templates.find((t) => t.value === templateValue);
  if (!selectedTemplate) {
    throw new Error(`未找到模板: ${templateValue}`);
  }

  return selectedTemplate;
}
