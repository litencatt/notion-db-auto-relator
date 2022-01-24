import { Client, LogLevel } from "@notionhq/client"
import { config } from "dotenv"
import { GetDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { PropertyValueTitle, PropertyValueMultiSelect, PropertyValueRichText } from "@notion-stuff/v4-types"

// defile self types
type MultiSelectProperty = Extract<GetDatabaseResponse["properties"][string], { type: "multi_select" }>;

interface Setting {
  pDbId: string
  pJoinKeyColumnName: string
  cDbId: string
  cJoinKeyColumnName: string
  rColumnName: string
}

// Settings
config()
const settingsDbId = process.env.SETTINGS_DB_ID as string

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
})

relateDb()

async function relateDb() {
  const settings = await init()
  for (const setting of settings) {
    const parentDbId = setting.pDbId
    const childDbId = setting.cDbId
    const pJoinKey = setting.pJoinKeyColumnName
    const cJoinKey = setting.cJoinKeyColumnName
    const rColumnName = setting.rColumnName

    const parentPages = await getDbPages(parentDbId, pJoinKey)
    for (const parentPage of parentPages) {
      const childPages = await searchDbPagesWithTag(childDbId, cJoinKey, parentPage.tag)
      // @ts-ignore
      const childPageIds = []
      for (const childPageId of childPages.pageIds) {
        childPageIds.push({'id': childPageId})
      }
      //console.log(childPageIds)
      await updateRelation(parentPage.id, childPageIds, rColumnName)
    }
  }  
}


async function init() : Promise<Setting[]> {
  const settings: Setting[] = []
  const res = await notion.databases.query({
    database_id: settingsDbId,
  })
  console.log(res)

  res.results.map(page => {
    console.log(page.properties)

    const parentDbIdColumn = page.properties['Parent DB Id'] as PropertyValueRichText
    const parentJoinKeyColumn = page.properties['Parent JoinKey Column'] as PropertyValueRichText
    const childDb = page.properties['Child DB Id'] as PropertyValueRichText
    const childJoinKeyColumn = page.properties['Child JoinKey Column'] as PropertyValueRichText
    const relationColumn = page.properties['Relation Column'] as PropertyValueRichText

    settings.push({
      pDbId: getPlainTextFirst(parentDbIdColumn),
      pJoinKeyColumnName: getPlainTextFirst(parentJoinKeyColumn),
      cDbId: getPlainTextFirst(childDb),
      cJoinKeyColumnName: getPlainTextFirst(childJoinKeyColumn),
      rColumnName: getPlainTextFirst(relationColumn),
    })
  })

  settings.map(e => console.log(e))
  return settings
}

function getPlainTextFirst(prop: PropertyValueRichText) {
  return prop.rich_text.map(e => e.plain_text)[0]
}

async function getDbPages(databaseId: string, columnName: string) :Promise<any> {
  const res = await notion.databases.query({
    database_id: databaseId,
  })
  const pages: any = []
  res.results.map(page => {
    const ms = page.properties[columnName] as PropertyValueMultiSelect
    // multi-select but supports single select
    const tagName = ms.multi_select.map(e => e.name)[0]
    pages.push({
      tag: tagName,
      id: page.id
    })
  })
  console.log(pages)
  return pages
}

async function searchDbPagesWithTag(databaseId: string, columnName: string, tag: string) : Promise<any> {
  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        {
          property: columnName,
          multi_select: {
            contains: tag
          }
        }
      ]
    }
  })

  let pages:any = {
    tag: tag,
    pageIds: []
  }
  res.results.map(page => {
    const name = page.properties.Name as PropertyValueTitle
    //console.log(`tag:${tag}, name:${name.title.map(t => t.plain_text)}, pageId:${page.id}`)
    pages.pageIds.push(page.id)
  })
  console.log(pages)

  return pages
}

// @ts-ignore
async function updateRelation(parentId: string, childIds: any[], relateColumnName: string) {
  console.log(relateColumnName)
  await notion.pages.update({
    page_id: parentId,
    properties: {      
      [relateColumnName]: {
        type: 'relation',
        'relation': childIds
      }
    }
  })
}

async function getDbMultiSelect(databaseId:string, column:string) : Promise<string[]> {
  const res = await notion.databases.retrieve({
    database_id: databaseId,
  })
  // console.log(res.properties)
  const ms = res.properties[column] as MultiSelectProperty
  const multiSelectTags = ms.multi_select.options.map(o => o.name)
  console.log(multiSelectTags)

  return multiSelectTags
}