// 智能選項生成器 - 支援多種策略
import { shuffleArray } from "../utils/questionUtils";

/**
 * 智能選項生成器
 * @param {Object} correctWord - 正確答案單字物件
 * @param {Array} currentNotebookWords - 當前筆記本的所有單字
 * @param {Array} allNotebookWords - 所有筆記本的單字
 * @param {Object} strategy - 選項生成策略設定
 * @returns {Array} 包含正確答案的四個選項陣列
 */
export function generateSmartOptions(
  correctWord,
  currentNotebookWords = [],
  allNotebookWords = [],
  strategy = {}
) {
  const {
    optionsStrategy = "mixed",
    mixedStrategyLocalRatio = 0.8,
  } = strategy;

  const correctAnswer = correctWord.ch_word;
  const correctType = correctWord.type;

  // 建立候選池
  let localCandidates = [];
  let globalCandidates = [];

  // 從當前筆記本建立候選池
  if (currentNotebookWords.length > 0) {
    localCandidates = currentNotebookWords
      .filter(word => 
        word.ch_word !== correctAnswer && // 排除正確答案
        word.type === correctType && // 同類型
        word.ch_word && word.ch_word.trim() // 有效答案
      )
      .map(word => word.ch_word);
  }

  // 從所有筆記本建立候選池
  if (allNotebookWords.length > 0) {
    globalCandidates = allNotebookWords
      .filter(word => 
        word.ch_word !== correctAnswer && // 排除正確答案
        word.type === correctType && // 同類型
        word.ch_word && word.ch_word.trim() && // 有效答案
        !localCandidates.includes(word.ch_word) // 避免與本地重複
      )
      .map(word => word.ch_word);
  }

  // 根據策略選擇錯誤選項
  let wrongOptions = [];

  switch (optionsStrategy) {
    case "local":
      wrongOptions = selectFromPool(localCandidates, 3);
      break;
    
    case "global":
      wrongOptions = selectFromPool([...localCandidates, ...globalCandidates], 3);
      break;
    
    case "mixed":
    default:
      wrongOptions = selectMixedOptions(
        localCandidates,
        globalCandidates,
        mixedStrategyLocalRatio
      );
      break;
  }

  // 如果沒有足夠的選項，使用後備策略
  if (wrongOptions.length < 3) {
    wrongOptions = fillWithFallbackOptions(wrongOptions, correctAnswer, correctType);
  }

  // 組合並洗牌
  const allOptions = [correctAnswer, ...wrongOptions.slice(0, 3)];
  return shuffleArray(allOptions);
}

/**
 * 從候選池中隨機選擇指定數量的選項
 */
function selectFromPool(candidates, count) {
  if (candidates.length === 0) return [];
  
  const shuffled = shuffleArray([...candidates]);
  return shuffled.slice(0, count);
}

/**
 * 混合策略：按比例從本地和全域池選擇
 */
function selectMixedOptions(localCandidates, globalCandidates, localRatio) {
  const totalNeeded = 3;
  const localCount = Math.floor(totalNeeded * localRatio);
  const globalCount = totalNeeded - localCount;

  const localOptions = selectFromPool(localCandidates, localCount);
  const globalOptions = selectFromPool(globalCandidates, globalCount);

  // 如果某一池不足，從另一池補充
  const combined = [...localOptions, ...globalOptions];
  if (combined.length < totalNeeded) {
    const remaining = totalNeeded - combined.length;
    const allRemaining = [...localCandidates, ...globalCandidates]
      .filter(option => !combined.includes(option));
    const additional = selectFromPool(allRemaining, remaining);
    combined.push(...additional);
  }

  return combined;
}

/**
 * 後備選項生成器 - 當沒有足夠候選時使用
 */
function fillWithFallbackOptions(existingOptions, correctAnswer, type) {
  const fallbackBanks = {
    "名詞": ["書本", "手機", "電腦", "學校", "公園", "醫院", "車站", "商店"],
    "動詞": ["學習", "工作", "休息", "運動", "旅遊", "購物", "聊天", "思考"],
    "形容詞": ["美麗", "困難", "簡單", "有趣", "重要", "特別", "普通", "新的"],
    "副詞": ["很", "非常", "完全", "幾乎", "總是", "從來", "經常", "偶爾"],
    "其他": ["的", "是", "在", "有", "了", "和", "也", "但是"]
  };

  const bank = fallbackBanks[type] || fallbackBanks["其他"];
  const needed = 3 - existingOptions.length;
  
  const fallbackOptions = bank
    .filter(option => 
      option !== correctAnswer && 
      !existingOptions.includes(option)
    )
    .slice(0, needed);

  return [...existingOptions, ...fallbackOptions];
}

/**
 * 為單字動態生成選項 - 主要入口函數
 * @param {Object} word - 要生成選項的單字
 * @param {Array} currentNotebookWords - 當前筆記本單字
 * @param {Array} allNotebookWords - 所有筆記本單字 
 * @param {Object} strategy - 策略設定
 * @returns {Object} 返回帶有 options 的單字物件
 */
export function addDynamicOptions(word, currentNotebookWords, allNotebookWords, strategy) {
  if (!word || !word.ch_word) return word;

  const options = generateSmartOptions(
    word,
    currentNotebookWords,
    allNotebookWords,
    strategy
  );

  return {
    ...word,
    options
  };
}

/**
 * 批量為單字陣列生成選項
 */
export function addDynamicOptionsToQuestions(
  questions,
  currentNotebookWords,
  allNotebookWords,
  strategy
) {
  return questions.map(question => 
    addDynamicOptions(question, currentNotebookWords, allNotebookWords, strategy)
  );
}
