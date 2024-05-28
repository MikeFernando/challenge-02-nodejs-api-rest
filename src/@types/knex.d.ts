// eslint-disable-next-line
import { Knex } from "knex"

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      image_url: string
      created_at: string
      updated_at: string
      session_id?: string
    }
    meals: {
      id: string
      name: string
      description: string
      within_the_diet: number
      updated_at: string
      created_at: string
    }
  }
}
