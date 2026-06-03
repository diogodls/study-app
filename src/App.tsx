import './index.css'

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>
        ⚔️ DevQuest — Design System Preview
      </h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>BUTTONS</h2>
        <div className="flex flex-col gap-3">
          <button className="btn btn-primary btn-full">Primary 3D Button</button>
          <button className="btn btn-secondary btn-full">Secondary Button</button>
          <button className="btn btn-success btn-full">✅ Success Button</button>
          <button className="btn btn-danger btn-full">❌ Danger Button</button>
          <button className="btn btn-ghost btn-full">Ghost Button</button>
          <button className="btn btn-primary btn-full" disabled>Disabled State</button>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>ANIMATIONS</h2>
        <div className="flex gap-3 flex-col">
          <button className="btn btn-secondary" onClick={(e) => {
            e.currentTarget.classList.remove('animate-shake')
            void e.currentTarget.offsetWidth
            e.currentTarget.classList.add('animate-shake')
          }}>Click to Shake ❌</button>
          <button className="btn btn-secondary" onClick={(e) => {
            e.currentTarget.classList.remove('animate-popIn')
            void e.currentTarget.offsetWidth
            e.currentTarget.classList.add('animate-popIn')
          }}>Click to Pop ✨</button>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>CARDS</h2>
        <div className="flex flex-col gap-3">
          <div className="card">Normal card with <code>var(--bg-card)</code></div>
          <div className="card card-accent">Accent card (active skill node)</div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>PROGRESS</h2>
        <div className="flex flex-col gap-3">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '65%' }} />
          </div>
          <div className="progress-track">
            <div className="progress-fill success" style={{ width: '40%' }} />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>BADGES</h2>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="badge badge-accent">XP +100</span>
          <span className="badge badge-success">Completed</span>
          <span className="badge badge-error">-1 Life</span>
          <span className="badge badge-warning">Streak 🔥</span>
          <span className="badge badge-info">Level Up</span>
          <span className="badge badge-common">Common</span>
          <span className="badge badge-rare">Rare</span>
          <span className="badge badge-legendary">Legendary</span>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>FORM</h2>
        <div className="flex flex-col gap-3">
          <div className="input-group">
            <label className="input-label">Gemini API Key</label>
            <input className="input" type="password" placeholder="AIza..." />
          </div>
          <div className="input-group">
            <label className="input-label">AI Model</label>
            <select className="select">
              <option>gemini-2.5-flash (Fast)</option>
              <option>gemini-2.5-pro (Smart)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Sound Effects</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>QUIZ OPTIONS</h2>
        <div className="flex flex-col gap-2">
          <button className="quiz-option">A) O(n) — Linear time</button>
          <button className="quiz-option selected">B) O(1) — Constant time</button>
          <button className="quiz-option correct">C) O(log n) — Logarithmic ✅</button>
          <button className="quiz-option wrong">D) O(n²) — Quadratic ❌</button>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>SKILL NODES</h2>
        <div className="flex gap-4 justify-center">
          <div className="skill-node completed">
            <div className="skill-node-circle">☑️</div>
            <span className="skill-node-label">Arrays</span>
          </div>
          <div className="skill-node available">
            <div className="skill-node-circle">🌲</div>
            <span className="skill-node-label">Trees</span>
          </div>
          <div className="skill-node locked">
            <div className="skill-node-circle">🔒</div>
            <span className="skill-node-label">Graphs</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
