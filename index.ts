import { config } from 'dotenv'
import { Client, LogLevel } from '@notionhq/client'
import { Setting, PropetyTypeInfo } from './interface'
import {
  getParentPages,
  searchDbPageIds,
  updateRelation,
  getPlainTextFirst,
  databaseQuery,
  getDbProps,
  buildFilterConditions,
  createRelationProperty,
} from './notion'
import {
  PropertyValueTitle,
  PropertyValueRichText,
  ExtractedPropertyValue,
} from '@notion-stuff/v4-types'

// Define type myself
type PropertyValueCheckBox = ExtractedPropertyValue<'checkbox'>

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

    await createRelationProperty(
      notion,
      setting.pDbId,
      setting.cDbId,
      setting.updateProp
    )

    console.log(`Name: ${setting.name} is start`)
    const parentPages = await getParentPages(
      notion,
      setting.pDbId,
      setting.relationKeys
    )

    const relationKeys = setting.relationKeys.split(',')
    const cDbProps = await getDbProps(notion, setting.cDbId, relationKeys)
    console.log(cDbProps)

    const cRelationPropInfo = cDbProps.map((p) => {
      return {
        property: p.name,
        type: p.type,
      } as unknown as PropetyTypeInfo
    })
    console.log(cRelationPropInfo)

    for (const parent of parentPages) {
      cRelationPropInfo.map((crp) => {
        parent.relation_keys.map((prk) => {
          if (crp.property == prk.property) {
            crp.value = prk.value
          }
        })
      })
      console.log(cRelationPropInfo)

      const filterConditions = await buildFilterConditions(cRelationPropInfo)
      const andFilter = { and: filterConditions }
      console.log(JSON.stringify(andFilter))

      const childPageIds = await searchDbPageIds(
        notion,
        setting.cDbId,
        andFilter
      )
      const relationPageIds = []
      for (const childPageId of childPageIds) {
        relationPageIds.push({ id: childPageId })
      }

      await updateRelation(
        notion,
        parent.page_id,
        relationPageIds,
        setting.updateProp
      )
    }
    console.log(`Name: ${setting.name} is end`)
  }
}

async function init(): Promise<Setting[]> {
  const settings: Setting[] = []
  const results = await databaseQuery(notion, settingsDbId, null)
  // console.log(res)

  results.map((result) => {
    result.map((page) => {
      // console.log(page.properties)
      const name = page.properties['Name'] as PropertyValueTitle
      const enable = page.properties['Enable'] as PropertyValueCheckBox
      const parentDbIdProp = page.properties[
        'Parent DB Id'
      ] as PropertyValueRichText
      const childDbIdProp = page.properties[
        'Child DB Id'
      ] as PropertyValueRichText
      const relationKeysProp = page.properties[
        'Relation Keys'
      ] as PropertyValueRichText
      const autoUpdateProp = page.properties[
        'Auto Update Property in Parent DB'
      ] as PropertyValueRichText

      settings.push({
        name: name.title.map((t) => t.plain_text)[0],
        enable: enable.checkbox,
        pDbId: getPlainTextFirst(parentDbIdProp),
        cDbId: getPlainTextFirst(childDbIdProp),
        relationKeys: getPlainTextFirst(relationKeysProp),
        updateProp: getPlainTextFirst(autoUpdateProp),
      })
    })
  })

  // settings.map(e => console.log(e))
  return settings
}
