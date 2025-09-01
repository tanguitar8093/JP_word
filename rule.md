📋 程式設計計劃規格
🏗️ 系統架構

1. Config (使用者參數)
   slice_length: 切片測試數量 (預設: 5)
   max_word_study: 新卡學習上限 (預設: 20)
   max_word_review: 複習卡上限 (預設: 20)
   sort_type: 排序方式 ("asc" 或 "normal")
2. Storage (資料持久化)
   單字資料: LocalStorage jpword:learning:words
   遊戲狀態: LocalStorage jpword:learning:game
   設定: LocalStorage jpword:learning:config
3. Core (業務邏輯)
   initializeGame(): 初始化新卡/複習卡
   processAnswer(): 處理回答邏輯
   checkSlicePass(): 檢查切片通過條件
   checkStagePass(): 檢查階段通過條件
4. Runner (流程控制)
   start(): 開始遊戲
   nextSlice(): 下一個切片
   answer(): 處理回答 (階段 1-6)
   answerVerification(): 驗收階段回答
   answerReview(): 錯題重練回答
5. Index (UI)
   React 組件處理使用者互動
   顯示階段、題目、記憶狀態
   處理按鈕點擊事件
   🔄 學習流程
   初始化階段
   載入單字資料
   決定新卡: studied == 0 的單字 (最多 max_word_study 個)
   決定複習卡: studied > 0 的單字，按 studied 升序 (最多 max_word_review 個)
   排序題目 (asc 或 normal)
   階段 1-6: 學習階段
   階段 1 (探索新卡): 累計 memory_meet 長度 ≥ slice_length
   階段 2 (認識新卡): 累計 memory_study 長度 ≥ slice_length
   階段 3 (適應新卡): 累計 memory_know 長度 ≥ slice_length
   階段 4 (開始回想): 累計 memory_meet 長度 ≥ slice_length
   階段 5 (找回記憶): 累計 memory_study 長度 ≥ slice_length
   階段 6 (強化記憶): 累計 memory_know 長度 ≥ slice_length
   階段 7: 驗收成果
   測試所有單字
   記住: 不動作
   沒記住: 加入 memory_forget
   階段 8: 錯題重練
   重練 memory_forget 中的單字
   循環直到 memory_forget 清空
   階段 9: 通過訓練
   更新所有單字的 studied += 1
   📊 記憶陣列邏輯
   階段 1-3 (新卡學習)
   記住:
   階段 1: 加入 memory_meet
   階段 2: memory_meet 沒此卡 → 加入 memory_meet; 有 → 加入 memory_study
   階段 3: 依序檢查 memory_meet → memory_study → memory_know
   沒記住: 不動作
   階段 4-6 (複習)
   邏輯同階段 1-3
   🎯 通過條件
   切片通過
   階段 1/4: memory_meet.length >= slice_length
   階段 2/5: memory_study.length >= slice_length
   階段 3/6: memory_know.length >= slice_length
   階段通過
   所有範圍單字都被測試過 (在記憶陣列中)
   📖 使用者規則說明
   🎮 遊戲規則
   基本操作
   開始學習: 點擊"開始學習"按鈕
   顯示答案: 點擊"顯示答案"查看中文翻譯
   回答: 選擇"記住"或"還沒記住"
   階段說明
   階段 1-3: 新卡學習階段
   階段 4-6: 複習階段
   階段 7: 驗收所有學習內容
   階段 8: 重練錯題
   階段 9: 完成訓練
   記憶評估
   記住: 將單字加入對應記憶陣列
   還沒記住: 單字會在後續切片中重複出現
   ⚙️ 設定參數
   可調整參數
   切片測試數量: 每次小測試的題目數量
   新卡學習上限: 每次學習的新單字數量上限
   複習單字上限: 每次複習的單字數量上限
   排序方式:
   asc: 按字數長度分組排序
   normal: 隨機排序
   預設值
   切片測試數量: 5 題
   新卡上限: 20 個
   複習上限: 20 個
   排序: 隨機
   📈 學習進度
   學習度 (studied)
   每次完成訓練 +1
   用於決定複習優先順序
   值越小越優先複習
   記憶狀態顯示
   meet: 初步認識的單字數量
   study: 熟悉的單字數量
   know: 掌握的單字數量
   forget: 忘記的單字數量
   🎯 學習目標
   階段目標
   階段 1-6: 通過所有切片測試
   階段 7: 正確回答所有題目
   階段 8: 完全掌握錯題
   階段 9: 完成訓練，學習度+1
   通過條件
   每個切片需累計足夠的"記住"次數
   所有單字都必須被測試過
   驗收階段不能有錯題，或錯題重練通過
   💡 使用技巧
   新卡階段: 多使用"記住"來加速學習
   複習階段: 仔細回想，避免錯過
   驗收階段: 確認所有內容都記住了
   錯題重練: 專注於之前錯的題目
   🔄 遊戲流程
   系統自動選擇新卡和複習卡
   按階段逐步學習
   每個階段有多次切片測試
   通過所有階段後學習度+1
   重複練習直到掌握
   這個系統設計讓學習更有系統性，通過分階段的記憶強化來提升學習效果！
