import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestingUserId = claimsData.claims.sub as string

    // Check if the requesting user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUserId)
      .single()

    if (roleError || !['it_admin', 'company_owner'].includes(roleData?.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only IT Admins and Company Owners can create agent users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, password, name } = await req.json()

    // Validate inputs
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate password length (minimum 8 characters for security)
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already exists by listing users with email filter
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      return new Response(
        JSON.stringify({ error: 'Error checking user existence' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const existingUser = usersData?.users?.find(u => u.email === email)
    let userId: string

    if (existingUser) {
      // User already exists - ensure password matches the newly provided one
      // This prevents "Invalid Credentials" when re-creating an agent with a new password.
      userId = existingUser.id

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
        user_metadata: { full_name: name, is_agent: true },
      })

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update existing agent credentials. Please try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Create new user using service role (does NOT affect admin's session)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, is_agent: true }
      })

      if (authError) {
        console.error('Agent user creation failed:', authError.message)
        return new Response(
          JSON.stringify({ error: 'Failed to create agent user. Please check credentials and try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userId = authData.user.id
      console.log(`User ${email} created successfully with ID: ${userId}`)
    }

    // Ensure profile exists for the auth user (do NOT store roles in profiles)
    // We upsert so re-creating an existing agent also fixes missing profile rows.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          email,
          full_name: name,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (profileError) {
      // Keep response generic; only log details in development.
      if (Deno.env.get('DENO_ENV') === 'development') {
        console.error('Profile upsert failed:', profileError)
      }
    }

    // Ensure user has role=agent in user_roles (roles must stay in a separate table)
    const { data: existingRole, error: roleLookupError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'agent')
      .maybeSingle()

    if (!roleLookupError && !existingRole) {
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: 'agent' })

      if (roleInsertError) {
        if (Deno.env.get('DENO_ENV') === 'development') {
          console.error('Role insert failed:', roleInsertError)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        email,
        message: existingUser ? 'User existed; credentials/profile ensured' : 'User created successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
