import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage(): JSX.Element {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/formulary';

  async function handleLogin(): Promise<void> {
    try {
      setError(null);
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-subtle px-4">
      {/* Back button */}
      <button
        className="absolute left-6 top-6 flex items-center gap-2 rounded-pill border border-line bg-white px-3 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
        onClick={() => navigate('/formulary')}
        type="button"
      >
        <ArrowLeft size={14} />
        กลับหน้าหลัก
      </button>

      <section className="w-full max-w-sm rounded-[24px] bg-white p-8 shadow-card">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Secure Access</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink">Sign in</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            การล็อกอินใช้สำหรับจัดการข้อมูลเท่านั้น — หน้าค้นหายาเปิดสาธารณะโดยไม่ต้องล็อกอิน
          </p>

          <div className="mt-6 grid gap-3">
            <input
              className="w-full rounded-[12px] border border-line px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="อีเมล"
              value={email}
            />
            <input
              className="w-full rounded-[12px] border border-line px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="รหัสผ่าน"
              type="password"
              value={password}
            />
            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <button
              className="rounded-pill bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
              onClick={() => void handleLogin()}
              type="button"
            >
              เข้าสู่ระบบ
            </button>
            <button
              className="rounded-pill border border-line py-2.5 text-sm font-medium text-muted transition hover:border-ink hover:text-ink"
              onClick={() => {
                loginDemo();
                navigate(redirectTo, { replace: true });
              }}
              type="button"
            >
              Guest mode
            </button>
          </div>
      </section>
    </div>
  );
}
