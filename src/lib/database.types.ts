export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          whatsapp: string | null
          created_at: string
          updated_at: string | null
          is_admin: boolean | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          whatsapp?: string | null
          created_at?: string
          updated_at?: string | null
          is_admin?: boolean | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          whatsapp?: string | null
          created_at?: string
          updated_at?: string | null
          is_admin?: boolean | null
        }
      }
      products: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          condition: 'new' | 'used'
          category: string
          images: string[]
          seller_id: string
          location: string
          status: 'available' | 'sold' | 'reserved'
          brand_id?: string
          model?: string
          year?: number
          views: number
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          condition: 'new' | 'used'
          category: string
          images: string[]
          seller_id: string
          location: string
          status?: 'available' | 'sold' | 'reserved'
          brand_id?: string
          model?: string
          year?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          condition?: 'new' | 'used'
          category?: string
          images?: string[]
          seller_id?: string
          location?: string
          status?: 'available' | 'sold' | 'reserved'
          brand_id?: string
          model?: string
          year?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      // ... rest of the tables remain unchanged
    }
  }
}