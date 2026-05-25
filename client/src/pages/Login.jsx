import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.data?.success) {
        localStorage.setItem('srisai_token', res.data.token);
        localStorage.setItem('srisai_admin', JSON.stringify(res.data.admin));
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;
      if (status === 401) {
        setError('Wrong email or password. Please try again.');
      } else if (!err.response) {
        setError('Cannot reach server. Make sure your backend is running on port 5000.');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <span style={S.icon}>🏛️</span>
          <h1 style={S.brand}>Sri Sai Real Estate</h1>
          <p style={S.sub}>ADMIN PORTAL</p>
        </div>
        <div style={S.hr} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={S.form} noValidate>

          {/* Email */}
          <div style={S.group}>
            <label style={S.label} htmlFor="adm-email">Email Address</label>
            <div style={S.row}>
              <span style={S.ico}>✉️</span>
              <input
                id="adm-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter admin email"
                style={S.inp}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={S.group}>
            <label style={S.label} htmlFor="adm-pass">Password</label>
            <div style={S.row}>
              <span style={S.ico}>🔒</span>
              <input
                id="adm-pass"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                style={{ ...S.inp, paddingRight: 48 }}
                required
              />
              <button
                type="button"
                style={S.eye}
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={S.err}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Hint box */}
          <div style={S.hint}>
            <strong>Default credentials:</strong><br />
            Email: admin@gmail.com<br />
            Password: admin123
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{ ...S.btn, opacity: loading ? 0.78 : 1 }}
            disabled={loading}
          >
            {loading
              ? <><span style={S.spin} /> Signing in...</>
              : <><span>Sign In</span><span style={{ fontSize: 18 }}>→</span></>
            }
          </button>
        </form>

        <p style={S.back}>
          <a href="/" style={S.backLink}>← Back to Website</a>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0D1B2A 0%,#1A2E42 55%,#243B55 100%)',
    padding: 24, position: 'relative', overflow: 'hidden',
  },
  blob1: {
    position:'absolute', width:420, height:420, borderRadius:'50%', top:-100, right:-100,
    background:'radial-gradient(circle,rgba(201,168,76,.13) 0%,transparent 70%)', pointerEvents:'none',
  },
  blob2: {
    position:'absolute', width:300, height:300, borderRadius:'50%', bottom:-80, left:-80,
    background:'radial-gradient(circle,rgba(201,168,76,.08) 0%,transparent 70%)', pointerEvents:'none',
  },
  card: {
    background:'#fff', borderRadius:24, padding:'48px 40px',
    width:'100%', maxWidth:440,
    boxShadow:'0 40px 80px rgba(0,0,0,.44)',
    position:'relative', zIndex:1,
  },
  header: { textAlign:'center', marginBottom:28 },
  icon:  { fontSize:52, display:'block', marginBottom:12 },
  brand: { fontFamily:"'Playfair Display',serif", fontSize:25, fontWeight:700, color:'#0D1B2A', marginBottom:6 },
  sub:   { color:'#C9A84C', fontWeight:700, fontSize:12, letterSpacing:2 },
  hr:    { height:1, background:'linear-gradient(90deg,transparent,#DDD0BE,transparent)', margin:'0 0 28px' },
  form:  { display:'flex', flexDirection:'column', gap:18 },
  group: { display:'flex', flexDirection:'column', gap:7 },
  label: { fontSize:13, fontWeight:600, color:'#4A5568' },
  row:   { position:'relative', display:'flex', alignItems:'center' },
  ico:   { position:'absolute', left:13, fontSize:16, pointerEvents:'none', userSelect:'none' },
  inp: {
    width:'100%', padding:'13px 14px 13px 42px',
    border:'2px solid #E2D5C3', borderRadius:10,
    fontSize:15, color:'#111', background:'#FAFAF8',
    outline:'none', boxSizing:'border-box',
  },
  eye: {
    position:'absolute', right:11, background:'none', border:'none',
    cursor:'pointer', fontSize:17, padding:4, lineHeight:1,
  },
  err: {
    background:'rgba(231,76,60,.08)', border:'1px solid rgba(231,76,60,.25)',
    borderRadius:8, padding:'11px 15px', fontSize:13, color:'#C0392B',
    display:'flex', alignItems:'flex-start', gap:8, lineHeight:1.5,
  },
  hint: {
    background:'rgba(201,168,76,.08)', border:'1px solid rgba(201,168,76,.25)',
    borderRadius:8, padding:'11px 15px', fontSize:12, color:'#7A6020', lineHeight:1.7,
  },
  btn: {
    background:'linear-gradient(135deg,#C9A84C,#A07830)', color:'#fff',
    border:'none', borderRadius:10, padding:'14px 24px', fontSize:16,
    fontWeight:700, letterSpacing:.5, display:'flex', alignItems:'center',
    justifyContent:'center', gap:10, cursor:'pointer', marginTop:4, width:'100%',
  },
  spin: {
    width:18, height:18, border:'2px solid rgba(255,255,255,.35)',
    borderTopColor:'#fff', borderRadius:'50%', display:'inline-block',
    animation:'spin .8s linear infinite',
  },
  back:     { textAlign:'center', marginTop:22, fontSize:13 },
  backLink: { color:'#C9A84C', fontWeight:600, textDecoration:'none' },
};