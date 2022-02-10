import { Client, LogLevel } from '@notionhq/client'
import {
  PropertyValueTitle,
  PropertyValueMultiSelect,
  PropertyValueRichText,
} from '@notion-stuff/v4-types'
import { ParentPage } from './interface'
import {
  queryDatabase,
  QueryDatabaseParameters,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'

// Define type myself
import { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'
type MultiSelectProperty = Extract<
  GetDatabaseResponse['properties'][string],
  { type: 'multi_select' }
>

export const getPlainTextFirst = (prop: PropertyValueRichText) => {
  return prop.rich_text.map((e) => e.plain_text)[0]
}

export const databaseQuery = async (
  notion: Client,
  databaseId: string,
  filter: QueryDatabaseParameters['filter'] | null
): Promise<QueryDatabaseResponse['results'][]> => {
  const resArr = []
  if (filter == null) {
    filter = {
      or: [],
      and: [],
    } as QueryDatabaseParameters['filter']
  }
  const res = await notion.databases.query({
    database_id: databaseId,
    filter: filter,
  })
  resArr.push(res.results)

  // fetch all pages
  let hasMore = res.has_more
  let nextCursor = res.next_cursor
  while (true) {
    if (!hasMore || nextCursor == null) {
      break
    }
    const tmp = await notion.databases.query({
      database_id: databaseId,
      filter: filter,
      start_cursor: nextCursor,
    })
    hasMore = tmp.has_more
    nextCursor = tmp.next_cursor
    resArr.push(tmp.results)
  }
  return resArr
}

export const getParentPages = async (
  notion: Client,
  databaseId: string,
  columnName: string
): Promise<ParentPage[]> => {
  const pages: ParentPage[] = []
  const propertyNames = columnName.split(',')
  const results = await databaseQuery(notion, databaseId, null)
  results.map((result) => {
    result.map((page) => {
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
  })
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

  const filter = { and: filterCondition }
  const results = await databaseQuery(notion, databaseId, filter)
  const pageIds: string[] = []
  results.map((result) => {
    result.map((page) => {
      pageIds.push(page.id)
    })
  })

  return pageIds
}

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
