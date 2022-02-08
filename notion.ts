import { Client, LogLevel } from '@notionhq/client'
import {
  PropertyValueTitle,
  PropertyValueMultiSelect,
  PropertyValueRichText,
} from '@notion-stuff/v4-types'
import { ParentPage } from './interface'
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'

// Define type myself
import { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'
type MultiSelectProperty = Extract<
  GetDatabaseResponse['properties'][string],
  { type: 'multi_select' }
>

export const getPlainTextFirst = (prop: PropertyValueRichText) => {
  return prop.rich_text.map((e) => e.plain_text)[0]
}

export const getDbPages = async (
  notion: Client,
  databaseId: string
): Promise<QueryDatabaseResponse> => {
  const res = await notion.databases.query({
    database_id: databaseId,
  })
  return res
}

export const getParentPages = async (
  notion: Client,
  databaseId: string,
  columnName: string
): Promise<ParentPage[]> => {
  const res = await notion.databases.query({
    database_id: databaseId,
  })

  const pages: ParentPage[] = []
  const propertyNames = columnName.split(',')
  res.results.map((page) => {
    const tmp: ParentPage = {
      page_id: page.id,
      relation_keys: [],
    }
    Object.entries(page.properties).forEach(([name, property]) => {
      if (!propertyNames.includes(name)) {
        return
      }
      if (property.type === 'multi_select') {
        const msProp = property as PropertyValueMultiSelect
        // multi-select but supports single select
        const val = msProp.multi_select.map((e) => e.name)[0]
        tmp.relation_keys.push({ key: name, value: val })
      } else if (property.type === 'title') {
        const tProp = property as PropertyValueTitle
        const val = tProp.title.map((t) => t.plain_text)[0]
        tmp.relation_keys.push({ key: name, value: val })
      }
    })
    pages.push(tmp)
  })
  // console.log(pages)

  return pages
}

export const searchDbPageIds = async (
  notion: Client,
  databaseId: string,
  parentPage: ParentPage
): Promise<string[]> => {
  const filterCondition: any = []
  parentPage.relation_keys.map((rkey) =>
    filterCondition.push({
      property: rkey.key,
      multi_select: {
        contains: rkey.value,
      },
    })
  )
  console.log(filterCondition)

  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: filterCondition,
    },
  })

  if (res.results == null) {
    return []
  }

  const pageIds: string[] = []
  res.results.map((page) => {
    const name = page.properties.Name as PropertyValueTitle
    //console.log(`tag:${tag}, name:${name.title.map(t => t.plain_text)}, pageId:${page.id}`)
    pageIds.push(page.id)
  })
  // console.log(pages)

  return pageIds
}

// @ts-ignore
export const updateRelation = async (
  notion: Client,
  parentId: string,
  childIds: any[],
  relateColumnName: string
) => {
  // console.log(relateColumnName)
  await notion.pages.update({
    page_id: parentId,
    properties: {
      [relateColumnName]: {
        type: 'relation',
        relation: childIds,
      },
    },
  })
}

export const getDbMultiSelect = async (
  notion: Client,
  databaseId: string,
  propName: string
): Promise<string[]> => {
  const res = await notion.databases.retrieve({
    database_id: databaseId,
  })
  // console.log(res.properties)
  const ms = res.properties[propName] as MultiSelectProperty
  const multiSelectTags = ms.multi_select.options.map((o) => o.name)
  console.log(multiSelectTags)

  return multiSelectTags
}
