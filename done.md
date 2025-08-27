合併筆記本功能：

- 筆記本名稱預設為先選取的那個。
- 勾選合併後，若筆記本名稱不一樣，則產生一個新的筆記本，並為新筆記本的每個資料自動初始化（如產生新的 uuid，已有此功能）。
- 若名稱一樣，則將內容合併至舊的筆記本，context 內容合併，其餘資料不變。
- 合併時若遇到重複單字或內容衝突，預設以現有筆記本內容為主，並記錄衝突項目供使用者檢查。
- 合併流程與條件請詳列於開發文件，方便後續維護。
- ui 部分可參考現有的刪除筆記本功能，並新增合併按鈕及相關提示。

筆記本匯入單字功能:

- 邏輯和合併筆記本邏輯一樣,匯入的 input 格式和已存在的匯入功能格式 是一樣的,
- 要記得幫新的檔案產生自動該產生的項目,
- 目前已有的 CRUD function 包含：createNote, readNote, updateNote, deleteNote，預計匯入單字時優先使用這些現有的 CRUD function；僅在遇到現有 function 無法支援的新需求（如特殊格式處理或批次初始化）時，才需新增 function。匯入後 context 內容合併。
- ui 部分可參考現有的刪除筆記本功能，並新增匯入按鈕及相關提示。

- 統計功能: 答題結束有不同畫面和功能
  - 分數列: 滿分 100, 動態計算每題分數, 答對答錯會累計
  - 題目明系列:
    - 每題答對答錯的狀態(用 emoji 表示對錯)
    - 狀態右邊是日文單字 kanji_jp_word | jp_word
    - 日文單字右邊是 收藏 emoji (先不用做功能)
- 記憶選項功能 localstorage, 要試手機支援
- bug github page react router
- 紀錄發音功能

- 筆記本(beta): beta 為離線版本 - storage: 方法都用 localstorage 管理資料, 將來正式版要支援把資料餵給資料庫, 架構要用乾淨,架構類似
  `          {"筆記本_1":{同 questions.js json},"筆記本_2":{同 questions.js json}}
         ` - 屬性: - id: uuid 建立時自動產生 - name: string(限 20 字),不可為空 - context: Array[object(格式如 data/questions.js 的 json)], 預設為 [{}] - 初始化: 建立筆記本, name: Hello JP word - 方法: 新增筆記本, 只需輸入 name, context 為預設 - 方法: 新增筆記本內容, require 為 id name 和 context, 建立完會跑 建立 context id 索引 方法 - 方法: 匯入筆記本,和 新增筆記本內容一樣, 但會支援 json 檔案上傳方式導入, 評估這層結構是否只要有 新增筆記本內容, 匯入留到下一層結構處理 - 方法: 修改筆記本名稱, require 為 id name - 方法: 刪除筆記本單字, require 為 Array[id] - 方法: 刪除筆記本,require: id - 方法: 讀取筆記本: require:id, 會把 context 匯入 reducer, 這邊的 reducer 會給很多 component 共用 - 方法: 讀取筆記本列表: 列出所有筆記本 - 私有方法: 建立 context id 索引, 會遍歷 context, 檢查沒有 id key 時,會加入 id: uuid - 私有方法: 型別轉換: 因為是 localstorage,會有字串轉 object 和 object 轉字串需求 - 私有方法: 驗證資料型別: 匯入的資料必須符合這個規範, 沒有的話會有錯誤警告,所以 init 內容也要修正
  `              {
                  jp_word: string,
                  kanji_jp_word: string,
                  ch_word: string,
                  jp_ex_statement: string,
                  ch_ex_statement: string,
                  type: string,
                  options: [string,string,...],
              },
         `
  筆記本 - bug 結束遊戲和選擇題遊戲有關的狀態要復原 [high] --> ing - bug 自動下一題,按鈕要隱藏 [normal]
