import { config } from "dotenv"
import { Client, LogLevel } from "@notionhq/client"
import { Setting } from "./interface"
import { getParentPages, searchDbPageIds, updateRelation, getPlainTextFirst, getDbPages } from "./notion"
import {
  PropertyValueTitle,
  PropertyValueRichText,
  ExtractedPropertyValue
} from "@notion-stuff/v4-types"

// Define type myself
import { GetDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
type PropertyValueCheckBox = ExtractedPropertyValue<'checkbox'>;
type MultiSelectProperty = Extract<GetDatabaseResponse["properties"][string], { type: "multi_select" }>;

config()
const settingsDbId = process.env.SETTINGS_DB_ID as string

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  // logLevel: LogLevel.DEBUG,
})

relateDb()

async function relateDb() {
  const settings = await init()
  for (const setting of settings) {
    if (!setting.enable) {
      console.log(`Name: ${setting.name} is skipped`)
      continue
    }

    console.log(`Name: ${setting.name} is start`)
    const parentPages = await getParentPages(notion, setting.pDbId, setting.relationKeys)
    console.log(parentPages)
    for (const parent of parentPages) {
      parent.relation_keys.map(e => e.value)
      const childPageIds = await searchDbPageIds(notion, setting.cDbId, parent)
      const relationPageIds = []
      for (const childPageId of childPageIds) {
        relationPageIds.push({ 'id': childPageId })
      }

      await updateRelation(notion, parent.page_id, relationPageIds, setting.updateProp)
    }
    console.log(`Name: ${setting.name} is end`)
  }
}

async function init(): Promise<Setting[]> {
  const settings: Setting[] = []
  const res = await getDbPages(notion, settingsDbId)
  // console.log(res)

  res.results.map(page => {
    // console.log(page.properties)

    const name            = page.properties['Name'] as PropertyValueTitle
    const enable          = page.properties['Enable'] as PropertyValueCheckBox
    const parentDbIdProp  = page.properties['Parent DB Id'] as PropertyValueRichText
    const childDbIdProp   = page.properties['Child DB Id'] as PropertyValueRichText
    const relationKeysProp = page.properties['Relation Keys'] as PropertyValueRichText
    const autoUpdateProp  = page.properties['Auto Update Property in Parent DB'] as PropertyValueRichText

    settings.push({
      name: name.title.map(t => t.plain_text)[0],
      enable: enable.checkbox,
      pDbId: getPlainTextFirst(parentDbIdProp),
      cDbId: getPlainTextFirst(childDbIdProp),
      relationKeys: getPlainTextFirst(relationKeysProp),
      updateProp: getPlainTextFirst(autoUpdateProp),
    })
  })

  // settings.map(e => console.log(e))
  return settings
}