export interface Template {
  name: string;
  value: string;
  description: string;
  type: "git" | "vite" | "next";
  repo?: string;
}

export const templates: Template[] = [
  {
    name: "NestJS Starter",
    value: "nest",
    description: "NestJS 应用启动模板",
    type: "git",
    repo: "NeilYeTAT/nest-app-starter-for-yeyu",
  },
  {
    name: "EVM DApp Starter",
    value: "evm-dapp",
    description: "EVM DApp 启动模板",
    type: "git",
    repo: "NeilYeTAT/evm-dapp-starter-for-yeyu",
  },
  {
    name: "Vite",
    value: "vite",
    description: "使用 Vite 官方模板创建项目",
    type: "vite",
  },
  {
    name: "Next.js",
    value: "next",
    description: "使用 Create Next App 创建项目",
    type: "next",
  },
];

export function getTemplateByValue(value: string): Template | undefined {
  return templates.find((t) => t.value === value);
}
