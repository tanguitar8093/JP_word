import { PanelContainer, LabelGroup, RangeInput } from "./styles";

export default function SettingsPanel({
  rate,
  setRate,
  playbackOptions,
  setPlaybackOptions,
  proficiencyFilter,
  setProficiencyFilter,
}) {
  return (
    <PanelContainer>
      <LabelGroup>
        播放速度 (Rate): {rate}
        <RangeInput
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
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
                setPlaybackOptions((prev) => ({
                  ...prev,
                  jp: e.target.checked,
                }))
              }
            />
            日文
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.ch}
              onChange={(e) =>
                setPlaybackOptions((prev) => ({
                  ...prev,
                  ch: e.target.checked,
                }))
              }
            />
            中文
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.jpEx}
              onChange={(e) =>
                setPlaybackOptions((prev) => ({
                  ...prev,
                  jpEx: e.target.checked,
                }))
              }
            />
            日文例句
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.chEx}
              onChange={(e) =>
                setPlaybackOptions((prev) => ({
                  ...prev,
                  chEx: e.target.checked,
                }))
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
            checked={playbackOptions.autoNext}
            onChange={(e) =>
              setPlaybackOptions((prev) => ({
                ...prev,
                autoNext: e.target.checked,
              }))
            }
          />
          開啟
        </label>
      </LabelGroup>

      {proficiencyFilter && setProficiencyFilter && (
        <LabelGroup>
          測驗範圍：
          <div>
            <label>
              <input
                type="checkbox"
                checked={proficiencyFilter[1]}
                onChange={(e) =>
                  setProficiencyFilter((prev) => ({
                    ...prev,
                    1: e.target.checked,
                  }))
                }
              />
              低
            </label>
            <label>
              <input
                type="checkbox"
                checked={proficiencyFilter[2]}
                onChange={(e) =>
                  setProficiencyFilter((prev) => ({
                    ...prev,
                    2: e.target.checked,
                  }))
                }
              />
              中
            </label>
            <label>
              <input
                type="checkbox"
                checked={proficiencyFilter[3]}
                onChange={(e) =>
                  setProficiencyFilter((prev) => ({
                    ...prev,
                    3: e.target.checked,
                  }))
                }
              />
              高
            </label>
          </div>
        </LabelGroup>
      )}
    </PanelContainer>
  );
}
