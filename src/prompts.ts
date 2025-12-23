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
      message: "Enter project name:",
      default: "my-project",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Project name cannot be empty";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return "Project name can only contain letters, numbers, hyphens and underscores";
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
      message: "Select a project template:",
      choices,
    },
  ]);

  const selectedTemplate = templates.find((t) => t.value === templateValue);
  if (!selectedTemplate) {
    throw new Error(`Template not found: ${templateValue}`);
  }

  return selectedTemplate;
}
