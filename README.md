# notion-db-auto-relator
Create and update relation for Parent and Child DB in Notion automatically.

## Usage
### Setup in Notion

1. Create a parent DB and a child DB that you want to relate automatically.
1. Duplicate this settings DB.
    - https://litencatt.notion.site/3dd1ccec8f0740cc90600de413261fdc
1. Create Notion API Integration.
    - https://www.notion.so/my-integrations
1. Invite the API Integration to settings DB, Parent DB and Child DB.



### Run `notion-db-auto-relator `locally
```
$ git clone git@github.com:litencatt/notion-db-auto-relator.git
$ cd notion-db-auto-relator
$ yarn
$ NOTION_TOKEN=*** SETTINGS_DB_ID=*** yarn start
```

### Run `notion-db-auto-relator` as GitHub Actions
settings example

```yaml
on:
  workflow_dispatch:
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
### Settings DB examples and relation results
#### Settings DB set values like this,

<img width="1093" alt="image" src="https://user-images.githubusercontent.com/17349045/153743697-7c43f21a-cefb-45fd-8e2e-06cbfa960b83.png">

#### Parent DB and Child DB example
<img width="1113" alt="image" src="https://user-images.githubusercontent.com/17349045/153743595-33e0eaad-5a3b-4f28-bf06-b3f269d6b1a2.png">

#### Settings1 relation execute result
Settings1 ✅  and `Run actions` or `NOTION_TOKEN=*** SETTINGS_DB_ID=*** yarn start`

- Relation property `Relation-with-Name` is created to ParentDB.
- Related like `ParentDB JOIN ChildDB ON ParentDB.Name = ChildDB.Name`.

Before | After
-- | --
<img width="1113" alt="image" src="https://user-images.githubusercontent.com/17349045/153743595-33e0eaad-5a3b-4f28-bf06-b3f269d6b1a2.png">|<img width="1097" alt="image" src="https://user-images.githubusercontent.com/17349045/153743670-791aaf08-a4b0-4967-96da-bf689c7d4193.png">

#### Settings2 relation execute result
Settings2 ✅  and `Run actions` or `NOTION_TOKEN=*** SETTINGS_DB_ID=*** yarn start`

- Relation property `Relation with Tags` is created to ParentDB.
- Related like `ParentDB JOIN ChildDB ON ParentDB.Tags = ChildDB.Tags`.

Before | After
-- | --
<img width="1113" alt="image" src="https://user-images.githubusercontent.com/17349045/153743595-33e0eaad-5a3b-4f28-bf06-b3f269d6b1a2.png">|<img width="1106" alt="image" src="https://user-images.githubusercontent.com/17349045/153743740-5c3fdfd5-6b63-4fcf-9c2d-03197b8f666c.png">


#### Settings3 relation execute result
Settings3 ✅  and `Run actions` or `NOTION_TOKEN=*** SETTINGS_DB_ID=*** yarn start`

- Relation property `Relation with Name,Tags` is created to ParentDB.
- Related like `ParentDB JOIN ChildDB ON ParentDB.Name = ChildDB.Name AND ParentDB.Tags = ChildDB.Tags`.

Before | After
-- | --
<img width="1113" alt="image" src="https://user-images.githubusercontent.com/17349045/153743595-33e0eaad-5a3b-4f28-bf06-b3f269d6b1a2.png">|<img width="1100" alt="image" src="https://user-images.githubusercontent.com/17349045/153743756-0ee469e5-eaea-4488-a0dc-b6a46d8f8c3a.png">
