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
  setReadingPlaybackRepeatCount,
  setFillInDifficulty,
} from "./reducer";

export default function SettingsPanel({
  context,
  wordTestConfig,
  onWordTestConfigChange,
}) {
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
    readingPlaybackRepeatCount,
    fillInDifficulty,
  } = systemSettings;

  const handleProficiencyChange = (level) => {
    dispatch(
      setProficiencyFilter({
        ...proficiencyFilter,
        [level]: !proficiencyFilter[level],
      })
    );
  };

  const isQuizContext = context === "quiz";
  const isReadingContext = context === "reading";
  const isFillInContext = context === "fillin";
  const isWordTestContext = context === "wordtest";

  return (
    <PanelContainer>
      {isReadingContext && (
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
                  onChange={(e) =>
                    dispatch(setReadingStudyMode(e.target.value))
                  }
                />
                手動模式
              </label>
              <label>
                <input
                  type="radio"
                  name="readingStudyMode"
                  value="auto"
                  checked={readingStudyMode === "auto"}
                  onChange={(e) =>
                    dispatch(setReadingStudyMode(e.target.value))
                  }
                />
                自動模式 (發音練習)
              </label>
            </div>
          </LabelGroup>

          {readingStudyMode === "auto" && (
            <>
              <LabelGroup>
                <SettingTitle>自動模式選項:</SettingTitle>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={readingRecordWord}
                      onChange={(e) =>
                        dispatch(setReadingRecordWord(e.target.checked))
                      }
                    />
                    錄製單字發音
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={readingRecordSentence}
                      onChange={(e) =>
                        dispatch(setReadingRecordSentence(e.target.checked))
                      }
                    />
                    錄製例句發音
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={readingPlayBeep}
                      onChange={(e) =>
                        dispatch(setReadingPlayBeep(e.target.checked))
                      }
                    />
                    錄音前播放提示音
                  </label>
                </div>
              </LabelGroup>
              <LabelGroup>
                <SettingTitle>
                  單字錄音秒數: {readingWordRecordTime}s
                </SettingTitle>
                <RangeInput
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={readingWordRecordTime}
                  onChange={(e) =>
                    dispatch(setReadingWordRecordTime(Number(e.target.value)))
                  }
                />
              </LabelGroup>
              <LabelGroup>
                <SettingTitle>
                  句子錄音秒數: {readingSentenceRecordTime}s
                </SettingTitle>
                <RangeInput
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={readingSentenceRecordTime}
                  onChange={(e) =>
                    dispatch(
                      setReadingSentenceRecordTime(Number(e.target.value))
                    )
                  }
                />
              </LabelGroup>
              <LabelGroup>
                <SettingTitle>重複播放次數:</SettingTitle>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="readingPlaybackRepeatCount"
                      value={1}
                      checked={readingPlaybackRepeatCount === 1}
                      onChange={(e) =>
                        dispatch(
                          setReadingPlaybackRepeatCount(Number(e.target.value))
                        )
                      }
                    />
                    1次
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="readingPlaybackRepeatCount"
                      value={2}
                      checked={readingPlaybackRepeatCount === 2}
                      onChange={(e) =>
                        dispatch(
                          setReadingPlaybackRepeatCount(Number(e.target.value))
                        )
                      }
                    />
                    2次
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="readingPlaybackRepeatCount"
                      value={3}
                      checked={readingPlaybackRepeatCount === 3}
                      onChange={(e) =>
                        dispatch(
                          setReadingPlaybackRepeatCount(Number(e.target.value))
                        )
                      }
                    />
                    3次
                  </label>
                </div>
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
      {autoProceed !== undefined && !isReadingContext && !isWordTestContext && (
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

      {!context && ( // Conditionally render
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
      {!context && ( // Conditionally render
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
      {!context && ( // Conditionally render startQuestionIndex
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

      {!context && ( // Conditionally render wordRangeCount
        <LabelGroup>
          <SettingTitle>單字數量上限:</SettingTitle>
          <input
            type="number"
            min="1"
            value={wordRangeCount}
            onChange={(e) =>
              dispatch(setWordRangeCount(Number(e.target.value)))
            }
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

      {/* Fill-in spelling difficulty settings - only visible on fill-in page */}
      {isFillInContext && (
        <LabelGroup>
          <SettingTitle>拼字難度：</SettingTitle>
          <div>
            <label>
              <input
                type="radio"
                name="fillInDifficulty"
                value="easy"
                checked={fillInDifficulty === "easy"}
                onChange={(e) => dispatch(setFillInDifficulty(e.target.value))}
              />
              容易 (+4)
            </label>
            <label>
              <input
                type="radio"
                name="fillInDifficulty"
                value="normal"
                checked={fillInDifficulty === "normal"}
                onChange={(e) => dispatch(setFillInDifficulty(e.target.value))}
              />
              一般 (+6)
            </label>
            <label>
              <input
                type="radio"
                name="fillInDifficulty"
                value="hard"
                checked={fillInDifficulty === "hard"}
                onChange={(e) => dispatch(setFillInDifficulty(e.target.value))}
              />
              困難 (+8)
            </label>
            <label>
              <input
                type="radio"
                name="fillInDifficulty"
                value="adaptive"
                checked={fillInDifficulty === "adaptive"}
                onChange={(e) => dispatch(setFillInDifficulty(e.target.value))}
              />
              自適應
            </label>
          </div>
        </LabelGroup>
      )}

      {isWordTestContext && (
        <>
          <SettingTitle>單字挑戰設定</SettingTitle>
          <LabelGroup>
            <SettingTitle>切片測試數量（slice_length）</SettingTitle>
            <input
              type="number"
              min="1"
              value={wordTestConfig?.slice_length ?? 5}
              onChange={(e) =>
                onWordTestConfigChange?.({
                  ...wordTestConfig,
                  slice_length: Math.max(
                    1,
                    parseInt(e.target.value || "1", 10)
                  ),
                })
              }
            />
          </LabelGroup>
          <LabelGroup>
            <SettingTitle>要學習的單字上限（max_word_study）</SettingTitle>
            <input
              type="number"
              min="1"
              value={wordTestConfig?.max_word_study ?? 20}
              onChange={(e) =>
                onWordTestConfigChange?.({
                  ...wordTestConfig,
                  max_word_study: Math.max(
                    1,
                    parseInt(e.target.value || "1", 10)
                  ),
                })
              }
            />
          </LabelGroup>
          <LabelGroup>
            <SettingTitle>題目排序方式（sort_type）</SettingTitle>
            <div>
              <label>
                <input
                  type="radio"
                  name="wordtest_sort"
                  value="normal"
                  checked={(wordTestConfig?.sort_type ?? "normal") === "normal"}
                  onChange={(e) =>
                    onWordTestConfigChange?.({
                      ...wordTestConfig,
                      sort_type: e.target.value,
                    })
                  }
                />
                normal（隨機）
              </label>
              <label>
                <input
                  type="radio"
                  name="wordtest_sort"
                  value="asc"
                  checked={(wordTestConfig?.sort_type ?? "normal") === "asc"}
                  onChange={(e) =>
                    onWordTestConfigChange?.({
                      ...wordTestConfig,
                      sort_type: e.target.value,
                    })
                  }
                />
                asc（依字數分組，由短到長）
              </label>
            </div>
          </LabelGroup>
          <LabelGroup>
            <SettingTitle>
              每個單字累計答對的次數才過關（round_count）
            </SettingTitle>
            <input
              type="number"
              min="1"
              value={wordTestConfig?.round_count ?? 1}
              onChange={(e) =>
                onWordTestConfigChange?.({
                  ...wordTestConfig,
                  round_count: Math.max(1, parseInt(e.target.value || "1", 10)),
                })
              }
            />
          </LabelGroup>
        </>
      )}
    </PanelContainer>
  );
}
