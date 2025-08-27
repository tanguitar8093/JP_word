import React, { useMemo, useState, useEffect } from "react";
import {
  CardContainer,
  Prompt,
  BlanksRow,
  BlankBox,
  OptionsGrid,
  OptionButton,
  ControlsRow,
} from "./styles";

const HIRAGANA =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょっー";
const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポャュョッー";

const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function toChars(str) {
  // split into unicode code points
  return Array.from(str || "");
}

export default function FillInQuestionCard({
  question,
  allQuestions,
  onComplete,
  onAnswer,
  speak,
}) {
  const target = useMemo(() => toChars(question?.jp_word || ""), [question]);

  // Build pool: characters from all jp_word plus noise kana
  const pool = useMemo(() => {
    const fromAll = new Map();
    (allQuestions || []).forEach((q) => {
      toChars(q.jp_word || "").forEach((ch) => {
        fromAll.set(ch, (fromAll.get(ch) || 0) + 1);
      });
    });
    // Ensure target counts are available
    target.forEach((ch) =>
      fromAll.set(
        ch,
        Math.max(fromAll.get(ch) || 0, target.filter((c) => c === ch).length)
      )
    );

    // Add noise kana
    const noise = [...toChars(HIRAGANA + KATAKANA)];
    const desiredTotal = Math.min(24, Math.max(12, target.length * 2));
    while (
      [...fromAll.entries()].reduce((s, [, c]) => s + c, 0) < desiredTotal
    ) {
      const ch = randPick(noise);
      fromAll.set(ch, (fromAll.get(ch) || 0) + 1);
    }

    // Expand into array with duplicates by count and shuffle
    const expanded = [];
    fromAll.forEach((count, ch) => {
      for (let i = 0; i < count; i++) expanded.push({ ch, id: `${ch}-${i}` });
    });
    for (let i = expanded.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [expanded[i], expanded[j]] = [expanded[j], expanded[i]];
    }
    return expanded;
  }, [allQuestions, target]);

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
        {isCompleteWrong && <span className="hint">目前拼字有錯，請修正</span>}
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
