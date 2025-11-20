import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PROJECT_STATUS } from '@/app/constants/projects'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('projects')
      .select(`
        *,
        levels:project_levels(
          id,
          level_name,
          price_xaf,
          hourly_return_xaf,
          daily_roi,
          max_earnings_multiplier,
          tag,
          display_order
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    } else {
      // Only show active projects by default
      query = query.in('status', [
        PROJECT_STATUS.FUNDING,
        PROJECT_STATUS.ACTIVE,
        PROJECT_STATUS.COMPLETED,
      ])
    }

    const { data: projects, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Calculate funding percentage and format levels for each project
    const projectsWithPercentage = projects?.map((project: any) => {
      // Format levels to match client structure (camelCase)
      const levels = project.levels?.map((level: any) => ({
        id: `${project.id}-${level.level_name.toLowerCase()}`,
        level: level.level_name,
        priceXaf: Number(level.price_xaf),
        hourlyReturnXaf: Number(level.hourly_return_xaf),
        dailyRoi: Number(level.daily_roi) || 0,
        maxEarningsMultiplier: Number(level.max_earnings_multiplier) || 2.0,
        tag: level.tag || undefined,
        displayOrder: level.display_order || 1,
      })).sort((a: any, b: any) => {
        // Sort by display_order or level number
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder
        }
        // Fallback to parsing level name
        const orderA = parseInt(a.level.replace('LV', ''))
        const orderB = parseInt(b.level.replace('LV', ''))
        return orderA - orderB
      }) || []

      return {
        ...project,
        levels, // Add formatted levels
        funding_percentage:
          (Number(project.funded_amount) / Number(project.goal_amount)) * 100,
      }
    })

    return NextResponse.json({
      projects: projectsWithPercentage,
      total: projects?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...body,
        admin_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Project created successfully',
      project,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

