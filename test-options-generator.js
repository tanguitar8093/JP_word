// 測試智能選項生成器
import { generateSmartOptions } from "../src/utils/smartOptionsGenerator.js";

// 測試資料
const correctWord = {
  ch_word: "吃",
  type: "動詞",
};

const currentNotebookWords = [
  { ch_word: "喝", type: "動詞" },
  { ch_word: "看", type: "動詞" },
  { ch_word: "聽", type: "動詞" },
  { ch_word: "書本", type: "名詞" },
];

const allNotebookWords = [
  ...currentNotebookWords,
  { ch_word: "跑", type: "動詞" },
  { ch_word: "寫", type: "動詞" },
  { ch_word: "說", type: "動詞" },
  { ch_word: "學校", type: "名詞" },
];

console.log("=== 智能選項生成器測試 ===\n");

// 測試預設模式
console.log("1. 預設選項池模式:");
const defaultOptions = generateSmartOptions(
  correctWord,
  currentNotebookWords,
  allNotebookWords,
  {
    optionsStrategy: "default",
  }
);
console.log("選項:", defaultOptions);
console.log("包含正確答案:", defaultOptions.includes("吃"));
console.log();

// 測試本筆記本模式
console.log("2. 本筆記本模式:");
const localOptions = generateSmartOptions(
  correctWord,
  currentNotebookWords,
  allNotebookWords,
  {
    optionsStrategy: "local",
  }
);
console.log("選項:", localOptions);
console.log("包含正確答案:", localOptions.includes("吃"));
console.log();

// 測試全域模式
console.log("3. 全部筆記本模式:");
const globalOptions = generateSmartOptions(
  correctWord,
  currentNotebookWords,
  allNotebookWords,
  {
    optionsStrategy: "global",
  }
);
console.log("選項:", globalOptions);
console.log("包含正確答案:", globalOptions.includes("吃"));
console.log();

// 測試混合模式
console.log("4. 智能混合模式 (80% 本地):");
const mixedOptions = generateSmartOptions(
  correctWord,
  currentNotebookWords,
  allNotebookWords,
  {
    optionsStrategy: "mixed",
    mixedStrategyLocalRatio: 0.8,
  }
);
console.log("選項:", mixedOptions);
console.log("包含正確答案:", mixedOptions.includes("吃"));
console.log();

console.log("=== 測試完成 ===");
