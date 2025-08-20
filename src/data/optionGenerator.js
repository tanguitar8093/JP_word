// 混淆選項生成器
export function generateOptions(correctAnswer, type) {
  const confusionBank = {
    名詞: ["英文", "韓文", "數學", "書本", "手機", "電腦"],
    動詞: ["喝", "看", "寫", "走路", "飛", "游泳", "聽"],
  };

  let pool = confusionBank[type] || [];
  let shuffled = pool.sort(() => Math.random() - 0.5);

  // 過濾掉正確答案，選 3 個混淆詞
  let wrongOptions = shuffled
    .filter((opt) => opt !== correctAnswer)
    .slice(0, 3);

  return [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
}
