## Usage
### Setup in Notion

- Auto RelationしたいParentとなるDB(以降ParentDB)とChildとなるDB(ChildDB)を作成しRelationを作成しておく
- 以下URLの設定用DBを複製する
  - https://litencatt.notion.site/3dd1ccec8f0740cc90600de413261fdc
- NotionのAPI Integrationを作成する
  - https://www.notion.so/my-integrations
- 作成したNotion API Integrationを複製した設定用DB、ParentDB、ChildDBにInviteする  
- 以下の様に設定用DBに値を設定する
  - ![image](https://user-images.githubusercontent.com/17349045/150769246-ffd10037-cdea-41ff-ab10-b32d0ad67d30.png)

#### Settings1
ParentのName と ChildのParent NameをRelation設定した場合

Before |  After
-- | --
![image](https://user-images.githubusercontent.com/17349045/150768433-28ea1a09-9698-4806-b9df-7f7dd944d043.png)|![image](https://user-images.githubusercontent.com/17349045/150768346-3f38c5a4-8163-4f13-b6e7-98da6225784d.png)

#### Settings2
ParentのTags と ChildのParent TagsをRelation設定した場合

Before | After
-- | --
![image](https://user-images.githubusercontent.com/17349045/150768768-2c5f7aa0-a55f-4065-9a3a-06bdbb52d9f7.png)|![image](https://user-images.githubusercontent.com/17349045/150768816-52a0717b-4e69-430b-b8a2-751f8fe14543.png)

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
