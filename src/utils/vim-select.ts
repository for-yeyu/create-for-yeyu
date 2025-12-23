import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  useMemo,
  makeTheme,
  isUpKey,
  isDownKey,
  isEnterKey,
  type Theme,
  type Status,
} from "@inquirer/core";
import type { PartialDeep } from "@inquirer/type";
import chalk from "chalk";

type SelectTheme = {
  icon: { cursor: string };
  style: {
    disabled: (text: string) => string;
    description: (text: string) => string;
    helpTip: (text: string) => string;
  };
  helpMode: "always" | "never" | "auto";
};

const selectTheme: SelectTheme = {
  icon: { cursor: "❯" },
  style: {
    disabled: (text: string) => chalk.dim(`- ${text}`),
    description: (text: string) => chalk.cyan(text),
    helpTip: (text: string) => chalk.dim(text),
  },
  helpMode: "auto",
};

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  disabled?: boolean | string;
};

type NormalizedChoice<Value> = {
  value: Value;
  name: string;
  description?: string;
  disabled: boolean | string;
};

type SeparatorItem = {
  type: "separator";
  separator: string;
};

type Item<Value> = NormalizedChoice<Value> | SeparatorItem;

function isSeparator<Value>(item: Item<Value>): item is SeparatorItem {
  return "type" in item && item.type === "separator";
}

function isSelectableChoice<Value>(
  item: Item<Value>
): item is NormalizedChoice<Value> {
  return !isSeparator(item) && !item.disabled;
}

function isSeparatorInput(choice: unknown): boolean {
  if (typeof choice !== "object" || choice === null) return false;
  const obj = choice as Record<string, unknown>;
  return obj.type === "separator" || "separator" in obj;
}

function getSeparatorText(choice: unknown): string {
  if (typeof choice !== "object" || choice === null) return "─".repeat(50);
  const obj = choice as Record<string, unknown>;
  return typeof obj.separator === "string" ? obj.separator : "─".repeat(50);
}

function normalizeChoices<Value>(
  choices: ReadonlyArray<unknown>
): Item<Value>[] {
  return choices.map((choice) => {
    if (isSeparatorInput(choice)) {
      const separatorText = getSeparatorText(choice);
      return {
        type: "separator" as const,
        separator: chalk.dim(separatorText),
      };
    }
    const typedChoice = choice as Choice<Value>;
    const name = typedChoice.name ?? String(typedChoice.value);
    return {
      value: typedChoice.value,
      name,
      description: typedChoice.description,
      disabled: typedChoice.disabled ?? false,
    };
  });
}

type VimSelectConfig<Value> = {
  message: string;
  choices: ReadonlyArray<unknown>;
  default?: Value;
  pageSize?: number;
  loop?: boolean;
  theme?: PartialDeep<Theme<SelectTheme>>;
};

function isCtrlN(key: { name?: string; ctrl?: boolean }): boolean {
  return key.name === "n" && key.ctrl === true;
}

function isCtrlP(key: { name?: string; ctrl?: boolean }): boolean {
  return key.name === "p" && key.ctrl === true;
}

function isJKey(key: { name?: string }): boolean {
  return key.name === "j";
}

function isKKey(key: { name?: string }): boolean {
  return key.name === "k";
}

export const vimSelect = createPrompt(
  <Value>(config: VimSelectConfig<Value>, done: (value: Value) => void) => {
    const { loop = true } = config;
    const theme = makeTheme<SelectTheme>(selectTheme, config.theme);
    const prefix = usePrefix({ status: "idle" as Status, theme });

    const items = useMemo(
      () => normalizeChoices<Value>(config.choices),
      [config.choices]
    );

    const selectableItems = useMemo(
      () => items.filter(isSelectableChoice),
      [items]
    );

    const defaultIndex = useMemo(() => {
      if (config.default === undefined) return 0;
      const foundIndex = selectableItems.findIndex(
        (item) => item.value === config.default
      );
      return foundIndex === -1 ? 0 : foundIndex;
    }, [config.default, selectableItems]);

    const [active, setActive] = useState(defaultIndex);
    const [status, setStatus] = useState<Status>("idle");

    useKeypress((key) => {
      if (isEnterKey(key)) {
        const selectedChoice = selectableItems[active];
        if (selectedChoice) {
          setStatus("done");
          done(selectedChoice.value);
        }
      } else if (isUpKey(key) || isCtrlP(key) || isKKey(key)) {
        if (loop) {
          setActive(active === 0 ? selectableItems.length - 1 : active - 1);
        } else {
          setActive(Math.max(0, active - 1));
        }
      } else if (isDownKey(key) || isCtrlN(key) || isJKey(key)) {
        if (loop) {
          setActive(active === selectableItems.length - 1 ? 0 : active + 1);
        } else {
          setActive(Math.min(selectableItems.length - 1, active + 1));
        }
      }
    });

    const selectedChoice = selectableItems[active];
    const message = theme.style.message(config.message, status);

    if (status === "done") {
      return `${prefix} ${message} ${theme.style.answer(
        selectedChoice?.name ?? ""
      )}`;
    }

    let selectableIndex = 0;
    const choiceLines = items.map((item) => {
      if (isSeparator(item)) {
        return ` ${item.separator}`;
      }

      if (item.disabled) {
        const disabledLabel =
          typeof item.disabled === "string" ? item.disabled : "(disabled)";
        return theme.style.disabled(`${item.name} ${disabledLabel}`);
      }

      const isActive = selectableIndex === active;
      selectableIndex++;

      const cursor = isActive ? theme.icon.cursor : " ";
      const color = isActive ? theme.style.highlight : (x: string) => x;

      return color(`${cursor} ${item.name}`);
    });

    const helpTip =
      theme.helpMode === "always" ||
      (theme.helpMode === "auto" && selectableItems.length > 6)
        ? theme.style.helpTip(
            "(Use arrow keys, j/k, or ctrl+n/ctrl+p to navigate)"
          )
        : "";

    const description = selectedChoice?.description
      ? `\n${theme.style.description(selectedChoice.description)}`
      : "";

    return `${prefix} ${message}${helpTip}\n${choiceLines.join(
      "\n"
    )}${description}`;
  }
);
