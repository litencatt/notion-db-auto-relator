import { Client, LogLevel } from '@notionhq/client'
import {
  PropertyValueTitle,
  PropertyValueMultiSelect,
  PropertyValueRichText,
} from '@notion-stuff/v4-types'
import { ParentPage, PropetyTypeInfo } from './interface'
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
  relationKeys: string
): Promise<ParentPage[]> => {
  const pages: ParentPage[] = []
  const propertyNames = relationKeys.split(',')
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
          tmp.relation_keys.push({ property: name, value: val })
        } else if (property.type === 'title') {
          const tProp = property as PropertyValueTitle
          const val = tProp.title.map((t) => t.plain_text)[0]
          tmp.relation_keys.push({ property: name, value: val })
        }
      })
      pages.push(tmp)
    })
    // console.log(pages)
  })
  return pages
}

export const getDbProps = async (
  notion: Client,
  databaseId: string,
  relationKeys: string[]
): Promise<GetDatabaseResponse['properties'][]> => {
  const db = await getDbInfo(notion, databaseId)
  const props: any = []
  Object.entries(db.properties).forEach(([key, property]) => {
    if (relationKeys.includes(key)) {
      props.push(property)
    }
  })
  return props
}

export const getDbInfo = async (
  notion: Client,
  databaseId: string
): Promise<GetDatabaseResponse> => {
  return await notion.databases.retrieve({ database_id: databaseId })
}

export const buildFilterConditions = (
  info: PropetyTypeInfo[]
): Promise<any[]> => {
  const filterCondition: any = []
  info.map((i) => {
    if (i.value == undefined) {
      return
    }
    filterCondition.push(getTypeFilter(i))
  })
  return filterCondition
}

export const getTypeFilter = (i: PropetyTypeInfo): any => {
  if (i.type == 'select') {
    return {
      property: i.property,
      select: { equals: i.value },
    }
  } else if (i.type == 'multi_select') {
    return {
      property: i.property,
      multi_select: { contains: i.value },
    }
  }
  return null
}

export const searchDbPageIds = async (
  notion: Client,
  databaseId: string,
  filter: QueryDatabaseParameters['filter']
): Promise<string[]> => {
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
