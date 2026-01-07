import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  return (
    <pre>
      {JSON.stringify({ data, error }, null, 2)}
    </pre>
  )
}