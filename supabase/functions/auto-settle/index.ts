// Auto-promotion job: flips overdue active markets to pending_resolution.
// Intended to be called periodically (e.g., hourly) by a scheduler.
// Does NOT auto-resolve — admin still inserts the observed value.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase.rpc('promote_overdue_markets')
    if (error) throw error

    const promoted = (data as number) ?? 0
    console.log(`auto-settle: promoted ${promoted} markets to pending_resolution`)

    return new Response(
      JSON.stringify({ success: true, promoted }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('auto-settle error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
