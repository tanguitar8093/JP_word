import { PanelContainer, LabelGroup, RangeInput, SettingTitle } from "./styles"; // Import SettingTitle

export default function SettingsPanel({
  playbackSpeed,
  setPlaybackSpeed,
  playbackOptions,
  setPlaybackOptions,
  proficiencyFilter,
  setProficiencyFilter,
  autoProceed,
  setAutoProceed,
  startQuestionIndex, // New prop
  setStartQuestionIndex, // New prop
  wordRangeCount, // New prop
  setWordRangeCount, // New prop
  sortOrder, // New prop
  setSortOrder, // New prop
  isQuizContext, // New prop
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
          min="0.5"
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
                value="random"
                checked={sortOrder === 'random'}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              隨機
            </label>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="aiueo"
                checked={sortOrder === 'aiueo'}
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
    </PanelContainer>
  );
}
