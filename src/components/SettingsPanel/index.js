import { PanelContainer, LabelGroup, RangeInput, SettingTitle } from "./styles"; // Import SettingTitle

export default function SettingsPanel({
  setWordType,
  playbackSpeed,
  setPlaybackSpeed,
  playbackOptions,
  setPlaybackOptions,
  proficiencyFilter,
  setProficiencyFilter,
  autoProceed,
  setAutoProceed,
  startQuestionIndex,
  setStartQuestionIndex,
  wordRangeCount,
  setWordRangeCount,
  sortOrder,
  wordType,
  setSortOrder,
  learningSteps, // New Anki prop
  setLearningSteps, // New Anki prop
  graduatingInterval, // New Anki prop
  setGraduatingInterval, // New Anki prop
  lapseInterval, // New Anki prop
  setLapseInterval, // New Anki prop
  isQuizContext,
}) {
  const handleProficiencyChange = (level) => {
    setProficiencyFilter({
      ...proficiencyFilter,
      [level]: !proficiencyFilter[level],
    });
  };

  return (
    <PanelContainer>
      <LabelGroup>
        <SettingTitle>播放速度: {playbackSpeed}</SettingTitle>
        <RangeInput
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
        />
      </LabelGroup>

      <LabelGroup>
        <SettingTitle>播放內容：</SettingTitle>
        <div>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.jp}
              onChange={(e) =>
                setPlaybackOptions({
                  ...playbackOptions,
                  jp: e.target.checked,
                })
              }
            />
            日文
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.ch}
              onChange={(e) =>
                setPlaybackOptions({
                  ...playbackOptions,
                  ch: e.target.checked,
                })
              }
            />
            中文
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.jpEx}
              onChange={(e) =>
                setPlaybackOptions({
                  ...playbackOptions,
                  jpEx: e.target.checked,
                })
              }
            />
            日文例句
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.chEx}
              onChange={(e) =>
                setPlaybackOptions({
                  ...playbackOptions,
                  chEx: e.target.checked,
                })
              }
            />
            中文例句
          </label>
        </div>
      </LabelGroup>
      {autoProceed !== undefined && (
        <LabelGroup>
          <SettingTitle>自動下一題：</SettingTitle>
          <label>
            <input
              type="checkbox"
              checked={autoProceed}
              onChange={(e) => setAutoProceed(e.target.checked)}
            />
            開啟
          </label>
        </LabelGroup>
      )}

      {!isQuizContext && ( // Conditionally render
        <LabelGroup>
          <SettingTitle>熟練度篩選:</SettingTitle>
          <div>
            <label>
              <input
                type="checkbox"
                checked={proficiencyFilter[1]}
                onChange={() => handleProficiencyChange(1)}
              />
              低
            </label>
            <label>
              <input
                type="checkbox"
                checked={proficiencyFilter[2]}
                onChange={() => handleProficiencyChange(2)}
              />
              中
            </label>
            <label>
              <input
                type="checkbox"
                checked={proficiencyFilter[3]}
                onChange={() => handleProficiencyChange(3)}
              />
              高
            </label>
          </div>
        </LabelGroup>
      )}
      {!isQuizContext && (
        <LabelGroup>
          <SettingTitle>排序設定:</SettingTitle>
          <div>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="none"
                checked={sortOrder === "none"}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              預設
            </label>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="random"
                checked={sortOrder === "random"}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              隨機
            </label>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="aiueo"
                checked={sortOrder === "aiueo"}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              あいうえお
            </label>
          </div>
        </LabelGroup>
      )}
      {!isQuizContext && ( // Conditionally render startQuestionIndex
        <LabelGroup>
          <SettingTitle>起始題目索引:</SettingTitle>
          <input
            type="number"
            min="1"
            value={startQuestionIndex}
            onChange={(e) => setStartQuestionIndex(Number(e.target.value))}
          />
        </LabelGroup>
      )}

      {!isQuizContext && ( // Conditionally render wordRangeCount
        <LabelGroup>
          <SettingTitle>單字數量上限:</SettingTitle>
          <input
            type="number"
            min="1"
            value={wordRangeCount}
            onChange={(e) => setWordRangeCount(Number(e.target.value))}
          />
        </LabelGroup>
      )}
      {!isQuizContext && (
        <LabelGroup>
          <SettingTitle>主單字顯示:</SettingTitle>
          <div>
            <label>
              <input
                type="radio"
                name="wordType"
                value="jp_word"
                checked={wordType === "jp_word"}
                onChange={(e) => setWordType(e.target.value)}
              />
              純平/片假名
            </label>
            <label>
              <input
                type="radio"
                name="wordType"
                value="kanji_jp_word"
                checked={wordType === "kanji_jp_word"}
                onChange={(e) => setWordType(e.target.value)}
              />
              包含漢字
            </label>
            <label>
              <input
                type="radio"
                name="wordType"
                value="jp_context"
                checked={wordType === "jp_context"}
                onChange={(e) => setWordType(e.target.value)}
              />
              同時顯示
            </label>
          </div>
        </LabelGroup>
      )}

      {/* Anki Algorithm Settings */}
      {/* {learningSteps !== undefined && ( // Conditionally render Anki settings
        <>
          <SettingTitle>Anki 演算法設定</SettingTitle>
          <LabelGroup>
            <SettingTitle>學習步驟 (毫秒, 逗號分隔):</SettingTitle>
            <input
              type="text"
              value={learningSteps.join(", ")}
              onChange={(e) =>
                setLearningSteps(
                  e.target.value.split(",").map((s) => Number(s.trim()))
                )
              }
            />
          </LabelGroup>
          <LabelGroup>
            <SettingTitle>畢業間隔 (天):</SettingTitle>
            <input
              type="number"
              min="1"
              value={graduatingInterval}
              onChange={(e) => setGraduatingInterval(Number(e.target.value))}
            />
          </LabelGroup>
          <LabelGroup>
            <SettingTitle>重學間隔 (毫秒):</SettingTitle>
            <input
              type="number"
              min="1"
              value={lapseInterval}
              onChange={(e) => setLapseInterval(Number(e.target.value))}
            />
          </LabelGroup>
        </>
      )} */}
    </PanelContainer>
  );
}
