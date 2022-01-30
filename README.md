## Usage
### Setup in Notion

- Auto RelationしたいParentとなるDB(以降ParentDB)とChildとなるDB(ChildDB)を作成しRelationを作成しておく
- 以下URLの設定用DBを複製する
  - https://litencatt.notion.site/3dd1ccec8f0740cc90600de413261fdc
- NotionのAPI Integrationを作成する
  - https://www.notion.so/my-integrations
- 作成したNotion API Integrationを複製した設定用DB、ParentDB、ChildDBにInviteする  
- 以下の様に設定用DBに値を設定する

![image](https://user-images.githubusercontent.com/17349045/151688567-69fd64a8-9c1f-4e71-89f6-1d72af422b6e.png)

### Before Auto Relation
![image](https://user-images.githubusercontent.com/17349045/151688613-9fba23e2-98fa-41ff-9227-a69c04c1a7a1.png)

### After Auto Relation
![image](https://user-images.githubusercontent.com/17349045/151688671-8180efa3-e791-422d-8913-a62f8fc6c1f4.png)


### Setup GitHub Actions example
以下のようにGitHub Actionsを任意のレポジトリに設定して定期的に実行するようにする

```yaml
on:
  schedule:
    - cron: '00 * * * *'

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
