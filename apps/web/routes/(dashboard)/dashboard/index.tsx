export default function Dashboard() {
	return (
		<div className='dashboard-container'>
			{
				/* Internal Styles for Layout
         (Using your CSS variables for all colors)
      */
			}
			<style>
				{`
        /* RESET */
        body, html { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        *, *:before, *:after { box-sizing: inherit; }

        /* LAYOUT */
        .dashboard-container {
            min-height: 100vh;
            background-color: var(--bg);
            color: var(--text);
            transition: background-color 0.3s ease, color 0.3s ease;
            padding-bottom: 4rem;
        }

        .demo-header {
            background-color: var(--header);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .card {
            background-color: var(--card);
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        h3 { margin-top: 0; color: var(--text-main); }
        p { color: var(--text-muted); line-height: 1.5; }

        /* BUTTONS */
        .btn-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        
        .btn {
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
            color: white; /* Most solid buttons need white text */
        }
        
        .btn:focus-visible { outline: var(--focus-ring); }

        .btn-primary { background: var(--primary); }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-primary:active { background: var(--primary-active); }

        .btn-danger { background: var(--danger); }
        .btn-danger:hover { background: var(--danger-hover); }
        
        .btn-ghost {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-muted);
        }
        .btn-ghost:hover {
            border-color: var(--primary);
            color: var(--primary);
            background: var(--primary-surface);
        }

        /* ALERTS (SURFACES) */
        .alert-grid { display: grid; gap: 1rem; }
        .alert {
            padding: 1rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        /* FORMS */
        .form-group { margin-bottom: 1rem; }
        .label { display: block; margin-bottom: 0.4rem; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        
        .input {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: var(--input-bg);
            color: var(--text);
            font-size: 1rem;
            transition: box-shadow 0.2s;
        }
        .input:focus { outline: none; box-shadow: var(--focus-ring); border-color: var(--primary); }
        .input:disabled { background: var(--disabled-bg); cursor: not-allowed; color: var(--text-disabled); }

        /* SWATCHES */
        .swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; }
        .swatch {
            height: 60px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: bold;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
        }
      `}
			</style>

			{/* --- HEADER --- */}
			<header className='demo-header'>
				<div>
					<h2 style={{ margin: 0 }}>Design System</h2>
					<small style={{ color: 'var(--text-muted)' }}>Testing variable logic & hierarchy</small>
				</div>

				<button
					className='btn'
					style={{
						background: 'var(--text)',
						color: 'var(--bg)',
						border: '1px solid var(--border-color)',
					}}
				>
				</button>
			</header>

			<main className='grid'>
				{/* 1. BUTTONS & INTERACTION */}
				<div className='card'>
					<h3>Interactive Elements</h3>
					<p>
						Testing <code>--hover</code>, <code>--active</code> logic, and focus rings.
					</p>

					<div className='btn-row'>
						<button className='btn btn-primary'>Primary Action</button>
						<button className='btn btn-danger'>Danger Action</button>
						<button className='btn btn-ghost'>Ghost Button</button>
					</div>

					<div style={{ marginTop: '1.5rem' }}>
						<span className='label'>Workflow States (Badges)</span>
						<div style={{ display: 'flex', gap: '0.5rem' }}>
							<span
								style={{
									padding: '4px 8px',
									borderRadius: '4px',
									fontSize: '0.8rem',
									background: 'var(--incomplete)',
									color: 'white',
								}}
							>
								Incomplete
							</span>
							<span
								style={{
									padding: '4px 8px',
									borderRadius: '4px',
									fontSize: '0.8rem',
									background: 'var(--in-progress)',
									color: 'white',
								}}
							>
								In Progress
							</span>
							<span
								style={{
									padding: '4px 8px',
									borderRadius: '4px',
									fontSize: '0.8rem',
									background: 'var(--complete)',
									color: 'white',
								}}
							>
								Complete
							</span>
						</div>
					</div>
				</div>

				{/* 2. FORMS & HIERARCHY */}
				<div className='card'>
					<h3>Forms & Typography</h3>
					<p>
						Testing <code>--input-bg</code>, <code>--border-color</code>, and text opacity.
					</p>

					<div className='form-group'>
						<label className='label'>Active Input (Try Focusing)</label>
						<input className='input' type='text' placeholder='Click to see focus ring...' />
					</div>

					<div className='form-group'>
						<label className='label'>Disabled Input</label>
						<input className='input' type='text' disabled value='This field is locked' />
					</div>

					<div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '6px' }}>
						<div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Main Text Color</div>
						<div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
							Muted Text (Metadata/Captions)
						</div>
						<div style={{ color: 'var(--text-disabled)', fontSize: '0.8rem' }}>Disabled Text</div>
					</div>
				</div>

				{/* 3. SURFACES & ALERTS */}
				<div className='card'>
					<h3>Surfaces (Tints)</h3>
					<p>
						Testing <code>--*-surface</code> variables for subtle backgrounds.
					</p>

					<div className='alert-grid'>
						<div
							className='alert'
							style={{ background: 'var(--primary-surface)', color: 'var(--primary)' }}
						>
							ℹ️ &nbsp; Primary Surface (Selection / Info)
						</div>
						<div
							className='alert'
							style={{ background: 'var(--warning-surface)', color: 'var(--warning)' }}
						>
							⚠️ &nbsp; <strong>Warning Surface</strong>
						</div>
						<div
							className='alert'
							style={{ background: 'var(--danger-surface)', color: 'var(--danger)' }}
						>
							⛔ &nbsp; Danger Surface (Critical Error)
						</div>
						<div
							className='alert'
							style={{ background: 'var(--success-surface)', color: 'var(--success)' }}
						>
							✅ &nbsp; Success Surface (Toast Message)
						</div>
					</div>
				</div>

				{/* 4. PALETTE SWATCHES */}
				<div className='card' style={{ gridColumn: '1 / -1' }}>
					<h3>Global Palette</h3>
					<div className='swatch-grid'>
						<div className='swatch' style={{ background: 'var(--primary)' }}>Pri</div>
						<div className='swatch' style={{ background: 'var(--primary-hover)' }}>Pri:Hov</div>
						<div className='swatch' style={{ background: 'var(--info)' }}>Info</div>
						<div className='swatch' style={{ background: 'var(--success)' }}>Succ</div>
						<div className='swatch' style={{ background: 'var(--warning)' }}>Warn</div>
						<div className='swatch' style={{ background: 'var(--danger)' }}>Dang</div>
						<div
							className='swatch'
							style={{
								background: 'var(--bg)',
								color: 'var(--text)',
								border: '1px solid var(--border-color)',
							}}
						>
							Bg
						</div>
						<div
							className='swatch'
							style={{
								background: 'var(--header)',
								color: 'var(--text)',
								border: '1px solid var(--border-color)',
							}}
						>
							Head
						</div>
						<div
							className='swatch'
							style={{
								background: 'var(--card)',
								color: 'var(--text)',
								border: '1px solid var(--border-color)',
							}}
						>
							Card
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
