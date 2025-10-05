export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the basic Next.js app is working!</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  )
}
