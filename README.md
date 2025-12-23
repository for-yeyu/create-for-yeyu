# for-yeyu

一个用于快速创建项目的脚手架工具。

## 功能特性

- 🚀 快速克隆 Git 仓库模板
- 📦 支持 Vite 官方模板
- ⚡ 支持 Create Next App
- 🎯 交互式命令行界面

## 安装

```bash
npm install -g for-yeyu
```

或者直接使用 npx：

```bash
npx for-yeyu
```

## 使用方法

### 交互式创建

```bash
npx for-yeyu
```

### 指定项目名称

```bash
npx for-yeyu my-project
```

### 指定模板

```bash
# 使用 NestJS 模板
npx for-yeyu my-project --template nest

# 使用 EVM DApp 模板
npx for-yeyu my-project --template evm-dapp

# 使用 Vite 创建项目
npx for-yeyu my-project --template vite

# 使用 Create Next App 创建项目
npx for-yeyu my-project --template next
```

## 可用模板

| 模板名称         | 命令参数   | 说明                 |
| ---------------- | ---------- | -------------------- |
| NestJS Starter   | `nest`     | NestJS 应用启动模板  |
| EVM DApp Starter | `evm-dapp` | EVM DApp 启动模板    |
| Vite             | `vite`     | 使用 Vite 官方模板   |
| Next.js          | `next`     | 使用 Create Next App |

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 本地测试运行
pnpm start
```

## 添加新模板

在 `src/templates.ts` 文件中添加新的模板配置：

```typescript
{
  name: '模板名称',
  value: 'template-value',
  description: '模板描述',
  type: 'git',
  repo: 'username/repo-name',
}
```

## License

MIT
