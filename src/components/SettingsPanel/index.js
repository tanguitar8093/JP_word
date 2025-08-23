import { PanelContainer, LabelGroup, RangeInput } from "./styles";

export default function SettingsPanel({
  playbackSpeed,
  setPlaybackSpeed,
  playbackOptions,
  setPlaybackOptions,
  proficiencyFilter,
  setProficiencyFilter,
  autoProceed,
  setAutoProceed,
  quizScope,
  setQuizScope,
  isQuizContext, // New prop
}) {
  return (
    <PanelContainer>
      <LabelGroup>
        播放速度 (Rate): {playbackSpeed}
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
        播放內容：
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
        自動下一題：
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
          測驗範圍 (單選):
          <div>
            <label>
              <input
                type="radio"
                name="quizScope"
                value="all"
                checked={quizScope === "all"}
                onChange={(e) => setQuizScope(e.target.value)}
              />
              全部
            </label>
            <label>
              <input
                type="radio"
                name="quizScope"
                value="low"
                checked={quizScope === "low"}
                onChange={(e) => setQuizScope(e.target.value)}
              />
              低
            </label>
            <label>
              <input
                type="radio"
                name="quizScope"
                value="medium"
                checked={quizScope === "medium"}
                onChange={(e) => setQuizScope(e.target.value)}
              />
              中
            </label>
            <label>
              <input
                type="radio"
                name="quizScope"
                value="high"
                checked={quizScope === "high"}
                onChange={(e) => setQuizScope(e.target.value)}
              />
              高
            </label>
          </div>
        </LabelGroup>
      )}
    </PanelContainer>
  );
}
