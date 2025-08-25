import { PanelContainer, LabelGroup, RangeInput, SettingTitle } from "./styles"; // Import SettingTitle
import { useApp } from "../../store/contexts/AppContext"; // Import useApp
import {
  setPlaybackOptions,
  setPlaybackSpeed,
  setAutoProceed,
  setProficiencyFilter,
  setStartQuestionIndex,
  setWordRangeCount,
  setSortOrder,
  setWordType,
  setReadingStudyMode,
  setReadingRecordWord,
  setReadingRecordSentence,
  setReadingPlayBeep,
  setReadingWordRecordTime,
  setReadingSentenceRecordTime,
} from "./reducer";

export default function SettingsPanel({ context }) { // Changed from isQuizContext to context
  const { state, dispatch } = useApp();
  const { systemSettings } = state;
  const {
    playbackOptions,
    playbackSpeed,
    autoProceed,
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
    wordType,
    readingStudyMode,
    readingRecordWord,
    readingRecordSentence,
    readingPlayBeep,
    readingWordRecordTime,
    readingSentenceRecordTime,
  } = systemSettings;

  const handleProficiencyChange = (level) => {
    dispatch(
      setProficiencyFilter({
        ...proficiencyFilter,
        [level]: !proficiencyFilter[level],
      })
    );
  };

  const isQuizContext = context === 'quiz'; // Determine from context

  return (
    <PanelContainer>
      {context === 'reading' && (
        <>
          <SettingTitle>閱讀頁面設定</SettingTitle>
          <LabelGroup>
            <SettingTitle>學習模式:</SettingTitle>
            <div>
              <label>
                <input
                  type="radio"
                  name="readingStudyMode"
                  value="manual"
                  checked={readingStudyMode === "manual"}
                  onChange={(e) => dispatch(setReadingStudyMode(e.target.value))}
                />
                手動模式
              </label>
              <label>
                <input
                  type="radio"
                  name="readingStudyMode"
                  value="auto"
                  checked={readingStudyMode === "auto"}
                  onChange={(e) => dispatch(setReadingStudyMode(e.target.value))}
                />
                自動模式 (發音練習)
              </label>
            </div>
          </LabelGroup>

          {readingStudyMode === 'auto' && (
            <>
              <LabelGroup>
                <SettingTitle>自動模式選項:</SettingTitle>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={readingRecordWord}
                      onChange={(e) => dispatch(setReadingRecordWord(e.target.checked))}
                    />
                    錄製單字發音
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={readingRecordSentence}
                      onChange={(e) => dispatch(setReadingRecordSentence(e.target.checked))}
                    />
                    錄製例句發音
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={readingPlayBeep}
                      onChange={(e) => dispatch(setReadingPlayBeep(e.target.checked))}
                    />
                    錄音前播放提示音
                  </label>
                </div>
              </LabelGroup>
              <LabelGroup>
                <SettingTitle>單字錄音秒數: {readingWordRecordTime}s</SettingTitle>
                <RangeInput
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={readingWordRecordTime}
                  onChange={(e) => dispatch(setReadingWordRecordTime(Number(e.target.value)))}
                />
              </LabelGroup>
              <LabelGroup>
                <SettingTitle>句子錄音秒數: {readingSentenceRecordTime}s</SettingTitle>
                <RangeInput
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={readingSentenceRecordTime}
                  onChange={(e) => dispatch(setReadingSentenceRecordTime(Number(e.target.value)))}
                />
              </LabelGroup>
            </>
          )}
        </>
      )}

      <SettingTitle>通用設定</SettingTitle>
      <LabelGroup>
        <SettingTitle>播放速度: {playbackSpeed}</SettingTitle>
        <RangeInput
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) => dispatch(setPlaybackSpeed(Number(e.target.value)))}
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
                dispatch(
                  setPlaybackOptions({
                    ...playbackOptions,
                    jp: e.target.checked,
                  })
                )
              }
            />
            日文
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.ch}
              onChange={(e) =>
                dispatch(
                  setPlaybackOptions({
                    ...playbackOptions,
                    ch: e.target.checked,
                  })
                )
              }
            />
            中文
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.jpEx}
              onChange={(e) =>
                dispatch(
                  setPlaybackOptions({
                    ...playbackOptions,
                    jpEx: e.target.checked,
                  })
                )
              }
            />
            日文例句
          </label>
          <label>
            <input
              type="checkbox"
              checked={playbackOptions.chEx}
              onChange={(e) =>
                dispatch(
                  setPlaybackOptions({
                    ...playbackOptions,
                    chEx: e.target.checked,
                  })
                )
              }
            />
            中文例句
          </label>
        </div>
      </LabelGroup>
      {autoProceed !== undefined && !isQuizContext && context !== 'reading' && (
        <LabelGroup>
          <SettingTitle>自動下一題：</SettingTitle>
          <label>
            <input
              type="checkbox"
              checked={autoProceed}
              onChange={(e) => dispatch(setAutoProceed(e.target.checked))}
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
      {!isQuizContext && ( // Conditionally render
        <LabelGroup>
          <SettingTitle>排序設定:</SettingTitle>
          <div>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="none"
                checked={sortOrder === "none"}
                onChange={(e) => dispatch(setSortOrder(e.target.value))}
              />
              預設
            </label>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="random"
                checked={sortOrder === "random"}
                onChange={(e) => dispatch(setSortOrder(e.target.value))}
              />
              隨機
            </label>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="aiueo"
                checked={sortOrder === "aiueo"}
                onChange={(e) => dispatch(setSortOrder(e.target.value))}
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
            onChange={(e) =>
              dispatch(setStartQuestionIndex(Number(e.target.value)))
            }
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
            onChange={(e) => dispatch(setWordRangeCount(Number(e.target.value)))}
          />
        </LabelGroup>
      )}
      <LabelGroup>
        <SettingTitle>主單字顯示:</SettingTitle>
        <div>
          <label>
            <input
              type="radio"
              name="wordType"
              value="jp_word"
              checked={wordType === "jp_word"}
              onChange={(e) => dispatch(setWordType(e.target.value))}
            />
            純平/片假名
          </label>
          <label>
            <input
              type="radio"
              name="wordType"
              value="kanji_jp_word"
              checked={wordType === "kanji_jp_word"}
              onChange={(e) => dispatch(setWordType(e.target.value))}
            />
            包含漢字
          </label>
          <label>
            <input
              type="radio"
              name="wordType"
              value="jp_context"
              checked={wordType === "jp_context"}
              onChange={(e) => dispatch(setWordType(e.target.value))}
            />
            同時顯示
          </label>
        </div>
      </LabelGroup>
    </PanelContainer>
  );
}
