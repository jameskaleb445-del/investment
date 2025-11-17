import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Build query
    let query = supabase
      .from('investments')
      .select(`
        *,
        projects:projects(
          id,
          name,
          category,
          status,
          funded_amount,
          goal_amount,
          estimated_roi,
          duration_days,
          levels:project_levels(
            id,
            level_name,
            price_xaf,
            hourly_return_xaf,
            tag,
            display_order
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by status
    if (status) {
      if (status === 'active') {
        // Active investments include both 'active' and 'pending' status
        query = query.in('status', ['active', 'pending'])
      } else {
        query = query.eq('status', status)
      }
    } else {
      // Default: show active and pending investments
      query = query.in('status', ['active', 'pending'])
    }

    const { data: investments, error } = await query

    if (error) {
      console.error('Error fetching investments:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch investments' },
        { status: 500 }
      )
    }

    // Format investments for the UI
    const formattedInvestments = (investments || []).map((inv: any) => {
      // Handle project data (can be array or single object or null)
      const project = Array.isArray(inv.projects) 
        ? inv.projects[0] 
        : inv.projects

      // Format levels if available
      let formattedLevels: any[] | undefined
      if (project && project.levels && Array.isArray(project.levels)) {
        formattedLevels = project.levels.map((level: any) => ({
          id: `${project.id}-${level.level_name.toLowerCase()}`,
          level: level.level_name,
          priceXaf: Number(level.price_xaf),
          hourlyReturnXaf: Number(level.hourly_return_xaf),
          tag: level.tag || undefined,
        })).sort((a: any, b: any) => {
          // Sort by level order (LV1, LV2, LV3)
          const orderA = parseInt(a.level.replace('LV', ''))
          const orderB = parseInt(b.level.replace('LV', ''))
          return orderA - orderB
        })
      }

      return {
        id: inv.id,
        project_id: inv.project_id,
        amount: Number(inv.amount),
        status: inv.status,
        invested_date: inv.invested_date,
        expected_return: Number(inv.expected_return),
        actual_return: inv.actual_return ? Number(inv.actual_return) : null,
        payout_date: inv.payout_date,
        projects: project ? {
          id: project.id,
          name: project.name,
          category: project.category,
          status: project.status,
          funded_amount: project.funded_amount || 0,
          goal_amount: project.goal_amount || 0,
          estimated_roi: project.estimated_roi || 0,
          duration_days: project.duration_days || 0,
          levels: formattedLevels,
        } : null,
      }
    })

    return NextResponse.json({ investments: formattedInvestments })
  } catch (error: any) {
    console.error('Error in GET /api/investments:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

