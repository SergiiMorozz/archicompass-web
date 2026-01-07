export default async function Home() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  return (
    <div style={{ padding: 40 }}>
      <h1>Supabase connection test</h1>

      <pre style={{ marginTop: 20 }}>
        {JSON.stringify(
          {
            ok: !error,
            error: error?.message ?? null,
            sample: data ?? null,
          },
          null,
          2
        )}
      </pre>
    </div>
  )
}
