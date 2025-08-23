- 筆記本(   a): beta 為離線版本 
    - storage: 方法都用 localstorage 管理資料, 將來正式版要支援把資料餵給資料庫, 架構要用乾淨,架構類似
    ```
    {"筆記本_1":{同 questions.js json},"筆記本_2":{同 questions.js json}}
    ```
    - 方法: 設定當前使用的筆記本, 這個將會套用到多個組件使用
    - 屬性: 
        - id: uuid 建立時自動產生
        - name: string(限20字),不可為空
        - context: Array[object(格式如 data/questions.js 的 json)], 預設為 [{}]
    - 初始化: 建立筆記本, name: Hello JP word
    - 方法: 新增筆記本, 只需輸入 name, context 為預設
    - 方法: 新增筆記本內容, require 為 id name 和 context, 建立完會跑 建立 context id 索引 方法
    - 方法: 匯入筆記本,和 新增筆記本內容一樣, 但會支援 json 檔案上傳方式導入, 評估這層結構是否只要有 新增筆記本內容, 匯入留到下一層結構處理
    - 方法: 修改筆記本名稱, require 為 id name
    - 方法: 刪除筆記本單字, require 為 Array[id]
    - 方法: 刪除筆記本,require: id
    - 方法: 讀取筆記本: require:id, 會把 context 匯入 reducer, 這邊的 reducer 會給很多 component 共用
    - 方法: 讀取筆記本列表: 列出所有筆記本
    - 私有方法: 建立 context id 索引, 會遍歷 context, 檢查沒有 id key 時,會加入 id: uuid
    - 私有方法: 型別轉換: 因為是 localstorage,會有字串轉 object 和 object 轉字串需求
    - 私有方法: 驗證資料型別: 匯入的資料必須符合這個規範, 沒有的話會有錯誤警告,所以 init 內容也要修正
    ```
        {
            jp_word: string,
            kanji_jp_word: string,
            ch_word: string,
            jp_ex_statement: string,
            ch_ex_statement: string,
            type: string,
            options: [string,string,...],
        },
    ```