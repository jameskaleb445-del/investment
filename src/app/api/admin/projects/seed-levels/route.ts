import { createClient, createAdminClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { INVESTMENT_LEVELS } from '@/app/constants/projects'

/**
 * Admin endpoint to seed project_levels for all projects
 * This creates the 10-level structure (LV1-LV10) for each project
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

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
    const { data: userData } = await adminClient
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

    // Get all projects
    const { data: projects, error: projectsError } = await adminClient
      .from('projects')
      .select('id, category')

    if (projectsError) {
      return NextResponse.json(
        { error: projectsError.message },
        { status: 500 }
      )
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        message: 'No projects found',
        seeded: 0,
      })
    }

    let seededCount = 0

    // Seed levels for each project
    for (const project of projects) {
      // Delete existing levels to ensure clean slate (all 10 levels will be created)
      const { error: deleteError } = await adminClient
        .from('project_levels')
        .delete()
        .eq('project_id', project.id)

      if (deleteError) {
        console.error(`Error deleting existing levels for project ${project.id}:`, deleteError)
      }

      // Insert all 10 levels for this project
      const levelsToInsert = INVESTMENT_LEVELS.map((level, index) => ({
        project_id: project.id,
        level_name: level.levelName,
        price_xaf: level.stakeXaf,
        hourly_return_xaf: level.hourlyProfitXaf,
        daily_roi: level.dailyRoi,
        max_earnings_multiplier: level.maxEarningsMultiplier,
        display_order: level.level,
        tag: index === 0 ? 'New' : index === 1 ? 'Popular' : null, // Tag first two levels
      }))

      const { error: insertError } = await adminClient
        .from('project_levels')
        .insert(levelsToInsert)

      if (insertError) {
        console.error(`Error seeding levels for project ${project.id}:`, insertError)
        continue
      }

      seededCount++
    }

    return NextResponse.json({
      message: 'Project levels seeded successfully',
      seeded: seededCount,
      total_projects: projects.length,
    })
  } catch (error: any) {
    console.error('Error seeding project levels:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

