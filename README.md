### Setup IN Notion

- NotionのAPI Integrationを作成する
  - https://www.notion.so/my-integrations
- 設定用DBを複製する
  - https://www.notion.so/3dd1ccec8f0740cc90600de413261fdc
- Parent DB, Child DBを作成する
- 作成したAPI Integrationを設定用DB、Parent DB、Child DBにInviteする  
- 以下情報を取得し設定用DBに設定する
  - Parent DB ID
  - Child DB ID
- Parent DBとChild DBのRelationしたい情報を設定する

### Setup GitHub Actions
- 設定用DBに設定
- GitHbu Actions yml settings
    
    ```yaml
    on:
      workflow_dispatch:
    
    jobs:
      run-job:
        name: run relation
        runs-on: ubuntu-latest
        env:
          TZ: Asia/Tokyo
          LANG: ja_JP.UTF-8
        steps:
          - uses: actions/checkout@v2
          - name: Relation
            uses: litencatt/notion-db-auto-relator@main
            env:
              NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
              SETTINGS_DB_ID: ${{ secrets.SETTINGS_DB_ID }}
    ```
