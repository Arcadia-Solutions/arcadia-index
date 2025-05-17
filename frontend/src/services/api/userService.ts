import type { components } from '@/api-schema/schema'
import api from './api.ts'

export type Peer = components['schemas']['Peer']

// TODO: update when we can deserialize the settings field to a rust struct and get the type for
// this field generated automatically
// https://github.com/launchbadge/sqlx/issues/3153#issuecomment-2798756953
type UserSettings = {
  settings: {
    site_appearance: {
      item_detail_layout: 'header' | 'sidebar_right' | 'sidebar_left'
    }
  }
}
export type User = components['schemas']['User'] & UserSettings

export type PublicUser = components['schemas']['PublicUser']

export type Profile = components['schemas']['Profile'] & { user: User }

export type PublicProfile = components['schemas']['PublicProfile']

export const getMe = async (): Promise<Profile> => {
  try {
    return (await api.get<Profile>('/me')).data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const getUser = async (userId: number): Promise<PublicProfile> => {
  try {
    return (await api.get<PublicProfile>(`/user?id=${userId}`)).data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
