import React, { useMemo, useState, useEffect } from "react";
import {
  CardContainer,
  Prompt,
  BlanksRow,
  BlankBox,
  OptionsGrid,
  OptionButton,
  ControlsRow,
  ProficiencyControlContainer,
  ProficiencyButton,
} from "./styles";
import { useApp } from "../../../../store/contexts/AppContext";
import { updateFillInAdaptiveStats } from "../../../../components/SettingsPanel/reducer";
import { updatePendingProficiency } from "../../../../store/reducer/actions";

const HIRAGANA =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょっー";
const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポャュョッー";

// 形近/音似群（常見容易混淆）
const CONFUSABLE_GROUPS = [
  // 小字 vs 大字（拗音/促音）
  ["や", "ゃ"],
  ["ゆ", "ゅ"],
  ["よ", "ょ"],
  ["つ", "っ"],
  ["ヤ", "ャ"],
  ["ユ", "ュ"],
  ["ヨ", "ョ"],
  ["ツ", "ッ"],
  // 片假名經典混淆
  ["シ", "ツ"],
  ["ソ", "ン"],
  // 濁音/半濁音（音近）
  ["か", "が"],
  ["さ", "ざ"],
  ["た", "だ"],
  ["は", "ば", "ぱ"],
  ["カ", "ガ"],
  ["サ", "ザ"],
  ["タ", "ダ"],
  ["ハ", "バ", "パ"],
  // 其他常見視覺混淆（保守選）
  ["る", "ろ"],
  ["ぬ", "め"],
  ["れ", "ね"],
];

const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function toChars(str) {
  // split into unicode code points
  return Array.from(str || "");
}

function buildConfusableMap(groups) {
  const map = new Map();
  for (const group of groups) {
    for (const ch of group) {
      const others = group.filter((x) => x !== ch);
      map.set(ch, new Set([...(map.get(ch) || []), ...others]));
    }
  }
  return map;
}

const CONFUSABLE_MAP = buildConfusableMap(CONFUSABLE_GROUPS);

export default function FillInQuestionCard({
  question,
  allQuestions,
  onComplete,
  onAnswer,
  speak,
}) {
  const { state, dispatch } = useApp();
  const { fillInDifficulty, fillInAdaptive } = state.systemSettings;
  const target = useMemo(() => toChars(question?.jp_word || ""), [question]);

  // 目前熟練度（沿用 Quiz 的 pending 機制）
  const currentProficiency =
    state.shared.pendingProficiencyUpdates[question.id] || question.proficiency;

  const setProficiency = (level) => {
    dispatch(updatePendingProficiency(question.id, level));
  };

  // 根據設定難度決定干擾數
  const extraByDifficulty = useMemo(() => {
    if (fillInDifficulty === "easy") return 4;
    if (fillInDifficulty === "hard") return 8;
    if (fillInDifficulty === "adaptive") {
      const hist = fillInAdaptive?.history || [];
      if (hist.length < 4) return 6; // cold start
      const acc = hist.reduce((a, b) => a + (b ? 1 : 0), 0) / hist.length;
      // 高正確率 → 加大干擾，低正確率 → 減少干擾
      if (acc >= 0.85) return 8;
      if (acc <= 0.55) return 4;
      return 6;
    }
    return 6; // normal
  }, [fillInDifficulty, fillInAdaptive]);

  // 依設定：答案長度 + extra。優先放入形近/音似干擾，其餘再隨機補足。
  const pool = useMemo(() => {
    // 1) 統計答案必需字元
    const need = new Map();
    target.forEach((ch) => need.set(ch, (need.get(ch) || 0) + 1));

    const desiredTotal = target.length + extraByDifficulty;

    // 2) 先放入必需字元（確保可組出答案）
    const tiles = [];
    need.forEach((count, ch) => {
      for (let i = 0; i < count; i++) tiles.push({ ch, id: `${ch}-req-${i}` });
    });

    // 3) 優先加入形近/音似干擾（不包含答案中已需要的字元）
    const chosenNoise = new Set();
    const uniqueTarget = Array.from(new Set(target));
    for (const ch of uniqueTarget) {
      if (tiles.length >= desiredTotal) break;
      const conf = Array.from(CONFUSABLE_MAP.get(ch) || []).filter(
        (c) => !need.has(c) && !chosenNoise.has(c)
      );
      // 隨機從 confusable 裡面挑選 1~2 個
      while (conf.length && tiles.length < desiredTotal) {
        const pick = conf.splice(Math.floor(Math.random() * conf.length), 1)[0];
        chosenNoise.add(pick);
        tiles.push({ ch: pick, id: `${pick}-conf-${tiles.length}` });
      }
    }

    // 4) 不足則用隨機假名補足（排除答案字與已挑選干擾）
    const allKana = Array.from(new Set([...toChars(HIRAGANA + KATAKANA)]));
    const forbidden = new Set([...need.keys(), ...chosenNoise]);
    const filler = allKana.filter((k) => !forbidden.has(k));
    while (tiles.length < desiredTotal) {
      const ch = randPick(filler);
      tiles.push({ ch, id: `${ch}-noise-${tiles.length}` });
      forbidden.add(ch);
    }

    // 5) 洗牌
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  }, [target, extraByDifficulty]);

  const [answer, setAnswer] = useState([]); // array of {ch, id}
  const [usedIds, setUsedIds] = useState(new Set());
  const [isCompleteWrong, setIsCompleteWrong] = useState(false);

  // Reset when question changes
  useEffect(() => {
    setAnswer([]);
    setUsedIds(new Set());
    setIsCompleteWrong(false);
  }, [question?.id]);

  const handlePick = (opt) => {
    if (usedIds.has(opt.id)) return; // prevent reuse of exact tile
    if (answer.length >= target.length) return;
    const next = [...answer, opt];
    setAnswer(next);
    setUsedIds(new Set([...usedIds, opt.id]));
    if (next.length === target.length) {
      const guess = next.map((o) => o.ch).join("");
      const correct = guess === (question?.jp_word || "");
      setIsCompleteWrong(!correct);
      if (onComplete) onComplete({ correct, guess });
      else if (onAnswer) onAnswer(correct);
      // 更新自適應統計
      if (fillInDifficulty === "adaptive") {
        dispatch(updateFillInAdaptiveStats(correct));
      }
    } else {
      // live validation for immediate feedback coloring
      const correctSoFar = target
        .slice(0, next.length)
        .every((ch, i) => ch === next[i].ch);
      setIsCompleteWrong(!correctSoFar);
    }
  };

  const handleUndo = () => {
    if (answer.length === 0) return;
    const last = answer[answer.length - 1];
    const next = answer.slice(0, -1);
    setAnswer(next);
    const s = new Set(usedIds);
    s.delete(last.id);
    setUsedIds(s);
    // Recompute wrong state
    const correctSoFar = target
      .slice(0, next.length)
      .every((ch, i) => ch === next[i].ch);
    setIsCompleteWrong(!correctSoFar);
  };

  const handleClear = () => {
    setAnswer([]);
    setUsedIds(new Set());
    setIsCompleteWrong(false);
  };

  return (
    <CardContainer>
      {/* 熟練度控制（與 Quiz 一致） */}
      <ProficiencyControlContainer>
        <ProficiencyButton
          className={currentProficiency === 1 ? "active" : ""}
          onClick={() => setProficiency(1)}
        >
          低
        </ProficiencyButton>
        <ProficiencyButton
          className={currentProficiency === 2 ? "active" : ""}
          onClick={() => setProficiency(2)}
        >
          中
        </ProficiencyButton>
        <ProficiencyButton
          className={currentProficiency === 3 ? "active" : ""}
          onClick={() => setProficiency(3)}
        >
          高
        </ProficiencyButton>
      </ProficiencyControlContainer>

      {/* 原有內容 */}
      <Prompt>
        請拼出：<strong>{question?.ch_word}</strong>
        {speak && (
          <button
            className="speak"
            onClick={() => speak(question?.jp_word, "ja")}
          >
            🔊
          </button>
        )}
      </Prompt>
      <BlanksRow>
        {target.map((_, idx) => (
          <BlankBox
            key={idx}
            className={
              idx < answer.length
                ? answer[idx].ch === target[idx]
                  ? "ok"
                  : "bad"
                : ""
            }
          >
            {answer[idx]?.ch || ""}
          </BlankBox>
        ))}
      </BlanksRow>

      <ControlsRow>
        <button onClick={handleUndo} disabled={answer.length === 0}>
          退回
        </button>
        <button onClick={handleClear} disabled={answer.length === 0}>
          清除
        </button>
        {isCompleteWrong && <span className="hint"> 拼字有誤，請修正</span>}
      </ControlsRow>

      <OptionsGrid>
        {pool.map((opt) => (
          <OptionButton
            key={opt.id}
            disabled={usedIds.has(opt.id) || answer.length >= target.length}
            onClick={() => handlePick(opt)}
          >
            {opt.ch}
          </OptionButton>
        ))}
      </OptionsGrid>
    </CardContainer>
  );
}
