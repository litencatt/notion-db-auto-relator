
export interface Setting {
    name: string
    enable: boolean
    pDbId: string
    cDbId: string
    relationKeys: string
    updateProp: string
  }

export  interface ParentPage {
    page_id: string
    relation_keys: RelationKey[]
  }

export  interface RelationKey {
    key: string
    value: string
  }