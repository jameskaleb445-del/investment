import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get project updates
    const { data: updates } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    // Calculate funding percentage
    const funding_percentage =
      (Number(project.funded_amount) / Number(project.goal_amount)) * 100

    // Get investment count
    const { count: investmentCount } = await supabase
      .from('investments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)

    return NextResponse.json({
      ...project,
      funding_percentage,
      investment_count: investmentCount || 0,
      updates: updates || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

