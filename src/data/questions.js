// generateOptions 可以用你的現有邏輯產生中文選項
import { generateOptions } from "./optionGenerator";

export const questions = [
  {
    jp_word: "たべる",
    kanji_jp_word: "食べる",
    ch_word: "吃",
    jp_ex_statement: "ご飯を食べる。",
    ch_ex_statement: "吃飯。",
    type: "動詞",
    options: generateOptions("吃", "動詞"),
  },
  {
    jp_word: "はしる",
    kanji_jp_word: "走る",
    ch_word: "跑",
    jp_ex_statement: "公園を走る。",
    ch_ex_statement: "在公園跑步。",
    type: "動詞",
    options: generateOptions("跑", "動詞"),
  },
  {
    jp_word: "にほんご",
    kanji_jp_word: "日本語",
    ch_word: "日文",
    jp_ex_statement: "これは日本語の例文です。",
    ch_ex_statement: "這是一個日文例句。",
    type: "名詞",
    options: generateOptions("日文", "名詞"),
  },
];
