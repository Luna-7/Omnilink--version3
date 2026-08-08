import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type IndustryInsert = Database['public']['Tables']['industries']['Insert']

// GET /api/industries - Get all industries
export async function GET() {
  try {
    const { data: industries, error } = await supabase
      .from('industries')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ industries })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/industries - Create a new industry
export async function POST(request: NextRequest) {
  try {
    const body: IndustryInsert = await request.json()

    const { data: industry, error } = await supabase
      .from('industries')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ industry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
