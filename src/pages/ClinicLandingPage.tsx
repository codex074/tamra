import { useEffect, useRef, useState } from 'react';
import {
  Activity, ArrowRight, Award, Baby, Brain,
  Calendar, CheckCircle, Clock, Eye, FileText,
  FlaskConical, Heart, Lock, Mail, MapPin, Menu,
  Phone, Shield, Star, Stethoscope, Users, X,
  Bell, ChevronRight, Inbox
} from 'lucide-react';

/* ──────────────────────────────────────────────────────
   TYPES
────────────────────────────────────────────────────── */
interface Service {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  hours: string;
  color: string;
}

interface Doctor {
  id: string;
  initials: string;
  avatarBg: string;
  name: string;
  credentials: string;
  specialty: string;
  school: string;
  years: number;
  languages: string[];
  accepting: boolean;
  rating: number;
  reviews: number;
}

interface Testimonial {
  id: string;
  initials: string;
  name: string;
  role: string;
  rating: number;
  body: string;
  date: string;
  verified: boolean;
}

/* ──────────────────────────────────────────────────────
   STATIC DATA
────────────────────────────────────────────────────── */
const SERVICES: Service[] = [
  {
    id: 'primary',
    icon: Stethoscope,
    title: 'Primary Care',
    description: 'Comprehensive preventive care, annual physicals, and management of chronic conditions including diabetes and hypertension.',
    hours: 'Mon – Sat · 8 AM – 6 PM',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    id: 'cardiology',
    icon: Heart,
    title: 'Cardiology',
    description: 'Heart health evaluations, ECG, echocardiography, stress testing, and personalised cardiac risk assessments.',
    hours: 'Tue · Thu · Sat',
    color: 'bg-rose-50 text-rose-700',
  },
  {
    id: 'neurology',
    icon: Brain,
    title: 'Neurology',
    description: 'Diagnosis and treatment of headaches, epilepsy, memory disorders, nerve conditions, and movement disorders.',
    hours: 'Mon · Wed · Fri',
    color: 'bg-violet-50 text-violet-700',
  },
  {
    id: 'pediatrics',
    icon: Baby,
    title: 'Paediatrics',
    description: 'Well-child visits, vaccinations, developmental screenings, and acute illness care for infants through teens.',
    hours: 'Daily · 8 AM – 5 PM',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    id: 'ophthalmology',
    icon: Eye,
    title: 'Ophthalmology',
    description: 'Comprehensive eye examinations, vision correction consultations, and management of glaucoma and macular disease.',
    hours: 'Mon – Fri',
    color: 'bg-sky-50 text-sky-700',
  },
  {
    id: 'laboratory',
    icon: FlaskConical,
    title: 'Laboratory',
    description: 'Full blood panels, urinalysis, culture tests, and rapid point-of-care diagnostics — all results in the patient portal.',
    hours: 'Daily · 7 AM – 4 PM',
    color: 'bg-emerald-50 text-emerald-700',
  },
];

const DOCTORS: Doctor[] = [
  {
    id: 'd1',
    initials: 'SC',
    avatarBg: 'bg-cyan-600',
    name: 'Dr. Sarah Chen',
    credentials: 'MD, FACP',
    specialty: 'Internal Medicine',
    school: 'Harvard Medical School',
    years: 14,
    languages: ['English', 'Mandarin'],
    accepting: true,
    rating: 4.9,
    reviews: 312,
  },
  {
    id: 'd2',
    initials: 'MT',
    avatarBg: 'bg-rose-600',
    name: 'Dr. Michael Torres',
    credentials: 'MD, FACC',
    specialty: 'Cardiology',
    school: 'Johns Hopkins Medicine',
    years: 18,
    languages: ['English', 'Spanish'],
    accepting: true,
    rating: 4.8,
    reviews: 247,
  },
  {
    id: 'd3',
    initials: 'PS',
    avatarBg: 'bg-amber-600',
    name: 'Dr. Priya Sharma',
    credentials: 'MD, FAAP',
    specialty: 'Paediatrics',
    school: 'Stanford Medicine',
    years: 10,
    languages: ['English', 'Hindi'],
    accepting: false,
    rating: 4.9,
    reviews: 189,
  },
  {
    id: 'd4',
    initials: 'JO',
    avatarBg: 'bg-violet-600',
    name: 'Dr. James Okafor',
    credentials: 'MD, PhD',
    specialty: 'Neurology',
    school: 'Mayo Clinic School',
    years: 22,
    languages: ['English', 'French'],
    accepting: true,
    rating: 4.7,
    reviews: 156,
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    initials: 'PW',
    name: 'Patricia Williams',
    role: 'Patient since 2019',
    rating: 5,
    body: 'The care I received was exceptional. Dr. Chen took time to explain everything clearly and genuinely listened. The appointment portal makes scheduling incredibly easy.',
    date: 'March 2025',
    verified: true,
  },
  {
    id: 't2',
    initials: 'RN',
    name: 'Robert Nakamura',
    role: 'Patient since 2021',
    rating: 5,
    body: 'After years of struggling with my heart condition, Dr. Torres created a treatment plan that finally worked. Professional, kind, and always accessible through the portal.',
    date: 'February 2025',
    verified: true,
  },
  {
    id: 't3',
    initials: 'MS',
    name: 'Maria Santos',
    role: 'Parent · Patient since 2022',
    rating: 5,
    body: 'Dr. Sharma is wonderful with our son — patient, thorough, and the entire paediatrics team makes children feel safe. We would not choose any other clinic.',
    date: 'January 2025',
    verified: true,
  },
];

const TIME_SLOTS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'];

/* ──────────────────────────────────────────────────────
   SMALL COMPONENTS
────────────────────────────────────────────────────── */
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-cyan-700 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-white"
    >
      Skip to main content
    </a>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </span>
  );
}

function Badge({ children, variant = 'green' }: { children: React.ReactNode; variant?: 'green' | 'gray' }) {
  const cls = variant === 'green'
    ? 'bg-green-100 text-green-800 border border-green-200'
    : 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────
   PATIENT PORTAL MOCKUP
────────────────────────────────────────────────────── */
function PortalMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      role="img"
      aria-label="Preview of the patient portal interface showing appointments, lab results, and messages"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
        <div className="ml-4 flex flex-1 items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs text-slate-400">
          <Lock size={10} aria-hidden="true" />
          portal.clearviewclinic.com
        </div>
      </div>

      {/* Portal top bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-cyan-700 px-5 py-3">
        <span className="text-sm font-semibold text-white">ClearView Patient Portal</span>
        <div className="flex items-center gap-3">
          <span className="relative" aria-hidden="true">
            <Bell size={16} className="text-cyan-200" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">2</span>
          </span>
          <div className="h-7 w-7 rounded-full bg-cyan-500 text-center text-xs font-bold leading-7 text-white" aria-hidden="true">PW</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0 divide-x divide-slate-100">
        {/* Sidebar */}
        <div className="col-span-1 bg-slate-50 py-4" aria-hidden="true">
          {[
            { icon: Calendar, label: 'Appointments', active: true },
            { icon: FileText, label: 'Lab Results', active: false },
            { icon: Inbox, label: 'Messages', active: false },
            { icon: Activity, label: 'Health Records', active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                active ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon size={13} />
              {label}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="col-span-2 p-4" aria-hidden="true">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Upcoming Appointments</p>

          {/* Appointment card */}
          <div className="mb-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-cyan-800">Dr. Sarah Chen</p>
                <p className="text-[11px] text-cyan-600">Internal Medicine · Annual Physical</p>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Confirmed</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-cyan-700">
              <span className="flex items-center gap-1"><Calendar size={10} />Apr 22, 2025</span>
              <span className="flex items-center gap-1"><Clock size={10} />10:00 AM</span>
            </div>
          </div>

          {/* Lab results teaser */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Lab Results</p>
          <div className="space-y-1.5">
            {[
              { name: 'Complete Blood Count', date: 'Apr 10', status: 'Normal', ok: true },
              { name: 'Lipid Panel', date: 'Apr 10', status: 'Review', ok: false },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px]">
                <span className="font-medium text-slate-700">{r.name}</span>
                <div className="flex items-center gap-2 text-slate-500">
                  <span>{r.date}</span>
                  <span className={`rounded-full px-1.5 py-0.5 font-medium ${r.ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   APPOINTMENT FORM
────────────────────────────────────────────────────── */
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  newPatient: string;
}

const FORM_INIT: FormFields = {
  firstName: '', lastName: '', email: '', phone: '',
  specialty: '', date: '', time: '', reason: '', newPatient: 'yes',
};

function AppointmentForm() {
  const [fields, setFields] = useState<FormFields>(FORM_INIT);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const successRef = useRef<HTMLDivElement>(null);

  function set(key: keyof FormFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    };
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!fields.firstName.trim()) errs.firstName = 'First name is required';
    if (!fields.lastName.trim()) errs.lastName = 'Last name is required';
    if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Valid email address required';
    if (!fields.phone.trim()) errs.phone = 'Phone number is required';
    if (!fields.specialty) errs.specialty = 'Please choose a specialty';
    if (!fields.date) errs.date = 'Appointment date is required';
    if (!fields.time) errs.time = 'Please select a time slot';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    await new Promise((r) => setTimeout(r, 1400));
    setStatus('success');
    setFields(FORM_INIT);
    setTimeout(() => successRef.current?.focus(), 100);
  }

  const inputClass = (key: keyof FormFields) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-teal-900 placeholder-slate-400 transition focus:outline-none focus:ring-3 focus:ring-cyan-500/40 focus:border-cyan-500 ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    }`;

  const labelClass = 'block text-sm font-medium text-teal-800 mb-1.5';

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-green-50 border border-green-200 p-12 text-center outline-none"
      >
        <CheckCircle size={52} className="text-green-600" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-teal-900">Appointment Request Sent!</h3>
        <p className="max-w-sm text-slate-600">
          We will confirm your appointment by phone or email within 2 business hours. Check your inbox for a booking reference.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-2 cursor-pointer rounded-xl bg-cyan-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-500/40"
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Appointment booking form">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* First name */}
        <div>
          <label htmlFor="ap-firstName" className={labelClass}>
            First Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="ap-firstName" type="text" autoComplete="given-name"
            className={inputClass('firstName')} value={fields.firstName}
            onChange={set('firstName')} placeholder="Patricia"
            aria-required="true" aria-describedby={errors.firstName ? 'err-firstName' : undefined}
          />
          {errors.firstName && <p id="err-firstName" role="alert" className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
        </div>

        {/* Last name */}
        <div>
          <label htmlFor="ap-lastName" className={labelClass}>
            Last Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="ap-lastName" type="text" autoComplete="family-name"
            className={inputClass('lastName')} value={fields.lastName}
            onChange={set('lastName')} placeholder="Williams"
            aria-required="true" aria-describedby={errors.lastName ? 'err-lastName' : undefined}
          />
          {errors.lastName && <p id="err-lastName" role="alert" className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="ap-email" className={labelClass}>
            Email Address <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="ap-email" type="email" autoComplete="email"
            className={inputClass('email')} value={fields.email}
            onChange={set('email')} placeholder="you@example.com"
            aria-required="true" aria-describedby={errors.email ? 'err-email' : undefined}
          />
          {errors.email && <p id="err-email" role="alert" className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="ap-phone" className={labelClass}>
            Phone Number <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="ap-phone" type="tel" autoComplete="tel"
            className={inputClass('phone')} value={fields.phone}
            onChange={set('phone')} placeholder="+1 (555) 000-0000"
            aria-required="true" aria-describedby={errors.phone ? 'err-phone' : undefined}
          />
          {errors.phone && <p id="err-phone" role="alert" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        {/* Specialty */}
        <div>
          <label htmlFor="ap-specialty" className={labelClass}>
            Department / Specialty <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="ap-specialty"
            className={`cursor-pointer ${inputClass('specialty')}`}
            value={fields.specialty} onChange={set('specialty')}
            aria-required="true" aria-describedby={errors.specialty ? 'err-specialty' : undefined}
          >
            <option value="">Select a department…</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          {errors.specialty && <p id="err-specialty" role="alert" className="mt-1 text-xs text-red-600">{errors.specialty}</p>}
        </div>

        {/* New patient */}
        <div>
          <fieldset>
            <legend className={labelClass}>Are you a new patient?</legend>
            <div className="flex gap-5">
              {[['yes', 'Yes, new patient'], ['no', 'Existing patient']].map(([val, lbl]) => (
                <label key={val} className="flex cursor-pointer items-center gap-2 text-sm text-teal-800">
                  <input
                    type="radio" name="newPatient" value={val}
                    checked={fields.newPatient === val}
                    onChange={set('newPatient')}
                    className="h-4 w-4 cursor-pointer accent-cyan-600 focus:ring-cyan-500"
                  />
                  {lbl}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="ap-date" className={labelClass}>
            Preferred Date <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="ap-date" type="date"
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            className={inputClass('date')} value={fields.date}
            onChange={set('date')}
            aria-required="true" aria-describedby={errors.date ? 'err-date' : undefined}
          />
          {errors.date && <p id="err-date" role="alert" className="mt-1 text-xs text-red-600">{errors.date}</p>}
        </div>

        {/* Time */}
        <div>
          <label htmlFor="ap-time" className={labelClass}>
            Preferred Time <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="ap-time"
            className={`cursor-pointer ${inputClass('time')}`}
            value={fields.time} onChange={set('time')}
            aria-required="true" aria-describedby={errors.time ? 'err-time' : undefined}
          >
            <option value="">Choose a time slot…</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.time && <p id="err-time" role="alert" className="mt-1 text-xs text-red-600">{errors.time}</p>}
        </div>

        {/* Reason */}
        <div className="sm:col-span-2">
          <label htmlFor="ap-reason" className={labelClass}>
            Reason for Visit <span className="text-sm font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="ap-reason" rows={3}
            className={`${inputClass('reason')} resize-none`}
            value={fields.reason} onChange={set('reason')}
            placeholder="Briefly describe your symptoms or the reason for your visit…"
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        <span className="text-red-500" aria-hidden="true">*</span> Required fields. Your information is protected under HIPAA and our{' '}
        <a href="#privacy" className="text-cyan-700 underline underline-offset-2 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 rounded">
          Privacy Policy
        </a>.
      </p>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        aria-busy={status === 'submitting'}
      >
        {status === 'submitting' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" aria-hidden="true" />
            Submitting…
          </>
        ) : (
          <>
            <Calendar size={18} aria-hidden="true" />
            Request Appointment
          </>
        )}
      </button>
    </form>
  );
}

/* ──────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────── */
export function ClinicLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#doctors', label: 'Our Doctors' },
    { href: '#portal', label: 'Patient Portal' },
    { href: '#booking', label: 'Appointments' },
  ];

  return (
    <>
      {/* Figtree font */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap"
      />

      <div className="min-h-screen bg-teal-50 text-teal-900" style={{ fontFamily: "'Figtree', sans-serif" }}>
        <SkipLink />

        {/* ── HEADER ───────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-teal-100/60 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            {/* Logo */}
            <a
              href="#main-content"
              className="flex items-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-cyan-500/40 rounded-lg"
              aria-label="ClearView Medical Clinic — Go to homepage"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-700" aria-hidden="true">
                <Stethoscope size={20} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold leading-tight text-teal-900">ClearView</p>
                <p className="text-xs leading-tight text-slate-500">Medical Clinic</p>
              </div>
            </a>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/40"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <a
                href="tel:+15550001234"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-teal-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/40 sm:flex"
                aria-label="Call us: +1 555 000 1234"
              >
                <Phone size={15} aria-hidden="true" />
                +1 555 000 1234
              </a>
              <a
                href="#booking"
                className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-500/40 sm:flex"
              >
                <Calendar size={15} aria-hidden="true" />
                Book Now
              </a>
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/40 md:hidden"
              >
                {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              className="border-t border-teal-100 bg-white px-4 pb-4 md:hidden"
            >
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-900 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-cyan-500/40"
                >
                  {label}
                  <ChevronRight size={16} className="text-slate-400" aria-hidden="true" />
                </a>
              ))}
              <a
                href="#booking"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-500/40"
              >
                <Calendar size={16} aria-hidden="true" />
                Book an Appointment
              </a>
            </nav>
          )}
        </header>

        {/* ── MAIN ─────────────────────────────────────────── */}
        <main id="main-content">

          {/* ── HERO ───────────────────────────────────────── */}
          <section
            aria-labelledby="hero-heading"
            className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 px-4 py-20 sm:py-28 lg:py-32"
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-700/20" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-teal-600/20" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2">

                {/* Text */}
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5">
                    <Shield size={14} className="text-cyan-400" aria-hidden="true" />
                    <span className="text-sm font-medium text-cyan-300">JCI Accredited · HIPAA Compliant</span>
                  </div>

                  <h1 id="hero-heading" className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Exceptional Care,<br />
                    <span className="text-cyan-400">Trusted by Thousands</span>
                  </h1>

                  <p className="mt-5 max-w-lg text-lg leading-relaxed text-teal-200">
                    ClearView Medical Clinic provides board-certified specialists, same-week appointments, and a patient portal that puts your health information at your fingertips.
                  </p>

                  {/* Trust stats */}
                  <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-6" role="list" aria-label="Clinic statistics">
                    {[
                      { stat: '25+', label: 'Years of care' },
                      { stat: '40k+', label: 'Patients served' },
                      { stat: '18', label: 'Specialists' },
                    ].map(({ stat, label }) => (
                      <div key={label} role="listitem" className="text-center">
                        <p className="text-3xl font-extrabold text-white">{stat}</p>
                        <p className="mt-0.5 text-xs text-teal-300">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href="#booking"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-400/40"
                    >
                      <Calendar size={18} aria-hidden="true" />
                      Book an Appointment
                    </a>
                    <a
                      href="#portal"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/40"
                    >
                      Patient Portal
                      <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>

                  {/* Emergency line */}
                  <p className="mt-6 flex items-center gap-2 text-sm text-teal-300">
                    <Phone size={14} aria-hidden="true" />
                    24/7 emergency line:{' '}
                    <a
                      href="tel:+15550009999"
                      className="font-semibold text-white underline underline-offset-2 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded"
                    >
                      +1 555 000 9999
                    </a>
                  </p>
                </div>

                {/* Portal preview – hero */}
                <div className="hidden lg:block">
                  <PortalMockup />
                </div>
              </div>
            </div>
          </section>

          {/* ── ACCREDITATION BAND ─────────────────────────── */}
          <section aria-label="Accreditations and certifications" className="border-y border-teal-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
                <p className="font-semibold text-slate-400 uppercase tracking-wide text-xs">Accredited &amp; Certified</p>
                {[
                  { icon: Award, label: 'JCI Accredited' },
                  { icon: Shield, label: 'HIPAA Compliant' },
                  { icon: CheckCircle, label: 'ISO 9001:2015' },
                  { icon: Users, label: 'Board-Certified Physicians' },
                  { icon: Activity, label: 'Electronic Health Records' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={16} className="text-cyan-600" aria-hidden="true" />
                    <span className="font-medium text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SERVICES ───────────────────────────────────── */}
          <section
            id="services"
            aria-labelledby="services-heading"
            className="px-4 py-20 sm:px-6 sm:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <header className="mb-12 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">What We Offer</p>
                <h2 id="services-heading" className="mt-2 text-3xl font-extrabold text-teal-900 sm:text-4xl">
                  Comprehensive Clinical Services
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
                  From routine check-ups to complex specialty care — all under one roof, with seamless referrals between departments.
                </p>
              </header>

              <ul
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label="Clinical services"
              >
                {SERVICES.map((svc) => (
                  <li key={svc.id} className="group">
                    <div className="flex h-full cursor-default flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-teal-100 transition hover:shadow-md hover:ring-cyan-200 focus-within:ring-2 focus-within:ring-cyan-500">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${svc.color}`} aria-hidden="true">
                        <svc.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-teal-900">{svc.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{svc.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={13} aria-hidden="true" />
                        <span>{svc.hours}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── DOCTORS ────────────────────────────────────── */}
          <section
            id="doctors"
            aria-labelledby="doctors-heading"
            className="bg-white px-4 py-20 sm:px-6 sm:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <header className="mb-12 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Meet the Team</p>
                <h2 id="doctors-heading" className="mt-2 text-3xl font-extrabold text-teal-900 sm:text-4xl">
                  Board-Certified Specialists
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
                  Every physician at ClearView is board-certified, fellowship-trained, and committed to evidence-based, patient-first care.
                </p>
              </header>

              <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" role="list" aria-label="Doctor profiles">
                {DOCTORS.map((doc) => (
                  <li key={doc.id}>
                    <article
                      className="flex h-full flex-col rounded-2xl bg-teal-50 p-6 ring-1 ring-teal-100 transition hover:shadow-md hover:ring-cyan-200"
                      aria-label={`${doc.name}, ${doc.specialty}`}
                    >
                      {/* Avatar + status */}
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white ${doc.avatarBg}`}
                          aria-hidden="true"
                        >
                          {doc.initials}
                        </div>
                        <Badge variant={doc.accepting ? 'green' : 'gray'}>
                          {doc.accepting ? (
                            <><CheckCircle size={11} aria-hidden="true" /> Accepting</>
                          ) : (
                            'Waitlist'
                          )}
                        </Badge>
                      </div>

                      {/* Info */}
                      <div className="mt-4 flex-1">
                        <h3 className="text-base font-bold leading-snug text-teal-900">{doc.name}</h3>
                        <p className="text-xs font-medium text-cyan-700">{doc.credentials}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{doc.specialty}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{doc.school}</p>
                      </div>

                      {/* Meta */}
                      <div className="mt-4 space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Award size={12} className="shrink-0 text-cyan-600" aria-hidden="true" />
                          <span>{doc.years} years experience</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="shrink-0 text-cyan-600" aria-hidden="true" />
                          <span>Languages: {doc.languages.join(', ')}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="mt-4 flex items-center gap-2">
                        <StarRow rating={doc.rating} />
                        <span className="text-xs font-medium text-slate-600">{doc.rating}</span>
                        <span className="text-xs text-slate-400">({doc.reviews})</span>
                      </div>

                      {doc.accepting && (
                        <a
                          href="#booking"
                          className="mt-4 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-cyan-700 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-500/40"
                          aria-label={`Book appointment with ${doc.name}`}
                        >
                          <Calendar size={13} aria-hidden="true" />
                          Book Appointment
                        </a>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── PATIENT PORTAL ─────────────────────────────── */}
          <section
            id="portal"
            aria-labelledby="portal-heading"
            className="px-4 py-20 sm:px-6 sm:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2">

                {/* Mockup */}
                <div className="order-2 lg:order-1">
                  <PortalMockup />
                </div>

                {/* Text */}
                <div className="order-1 lg:order-2">
                  <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Digital Health</p>
                  <h2 id="portal-heading" className="mt-2 text-3xl font-extrabold text-teal-900 sm:text-4xl">
                    Your Health, Always<br />Within Reach
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    The ClearView Patient Portal gives you secure, 24/7 access to everything you need — from scheduling to results — without a single phone call.
                  </p>

                  <ul className="mt-8 space-y-4" aria-label="Patient portal features">
                    {[
                      { icon: Calendar, title: 'Online Scheduling', desc: 'Book, reschedule, or cancel appointments at any time.' },
                      { icon: FileText, title: 'Lab Results & Records', desc: 'View test results and download health records securely.' },
                      { icon: Inbox, title: 'Secure Messaging', desc: 'Message your care team directly — responses within 1 business day.' },
                      { icon: Activity, title: 'Health Tracking', desc: 'Log vitals, track medications, and review visit summaries.' },
                    ].map(({ icon: Icon, title, desc }) => (
                      <li key={title} className="flex gap-4">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700" aria-hidden="true">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-teal-900">{title}</h3>
                          <p className="text-sm text-slate-600">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href="#"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-500/40"
                    >
                      <Lock size={15} aria-hidden="true" />
                      Sign In to Portal
                    </a>
                    <a
                      href="#"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-cyan-200 bg-transparent px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/40"
                    >
                      Create Free Account
                      <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── APPOINTMENT BOOKING ────────────────────────── */}
          <section
            id="booking"
            aria-labelledby="booking-heading"
            className="bg-white px-4 py-20 sm:px-6 sm:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="grid items-start gap-12 lg:grid-cols-5">

                {/* Left: info */}
                <div className="lg:col-span-2">
                  <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Get Started</p>
                  <h2 id="booking-heading" className="mt-2 text-3xl font-extrabold text-teal-900 sm:text-4xl">
                    Book Your Appointment
                  </h2>
                  <p className="mt-3 text-base text-slate-600">
                    Same-week appointments available. Fill in the form and our scheduling team will confirm within 2 hours.
                  </p>

                  <div className="mt-8 space-y-4">
                    {[
                      { icon: Clock, text: 'Same-week appointments available' },
                      { icon: Shield, text: 'Your data is 100% HIPAA protected' },
                      { icon: Phone, text: 'Confirmation call or SMS within 2 hrs' },
                      { icon: CheckCircle, text: 'Insurance accepted — we verify benefits' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
                        <Icon size={17} className="shrink-0 text-green-600" aria-hidden="true" />
                        {text}
                      </div>
                    ))}
                  </div>

                  {/* Contact block */}
                  <div className="mt-8 rounded-2xl bg-teal-50 p-5 text-sm">
                    <p className="font-semibold text-teal-900">Prefer to call?</p>
                    <a
                      href="tel:+15550001234"
                      className="mt-1 flex items-center gap-2 text-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 rounded font-medium"
                    >
                      <Phone size={14} aria-hidden="true" />
                      +1 555 000 1234
                    </a>
                    <p className="mt-2 text-slate-500">Monday – Saturday · 8 AM – 6 PM</p>
                  </div>
                </div>

                {/* Right: form */}
                <div className="rounded-2xl bg-teal-50 p-6 shadow-sm ring-1 ring-teal-100 sm:p-8 lg:col-span-3">
                  <h3 className="mb-6 text-xl font-bold text-teal-900">Patient Details</h3>
                  <AppointmentForm />
                </div>
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ───────────────────────────────── */}
          <section
            aria-labelledby="testimonials-heading"
            className="px-4 py-20 sm:px-6 sm:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <header className="mb-12 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Patient Stories</p>
                <h2 id="testimonials-heading" className="mt-2 text-3xl font-extrabold text-teal-900 sm:text-4xl">
                  Trusted by Our Community
                </h2>
                {/* Aggregate rating */}
                <div className="mt-4 flex items-center justify-center gap-3" aria-label="Overall rating: 4.9 out of 5 from over 900 reviews">
                  <StarRow rating={5} size={20} />
                  <span className="text-lg font-bold text-teal-900">4.9</span>
                  <span className="text-slate-500">· 900+ verified reviews</span>
                </div>
              </header>

              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Patient testimonials">
                {TESTIMONIALS.map((t) => (
                  <li key={t.id}>
                    <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-teal-100">
                      <header className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-sm font-bold text-white"
                            aria-hidden="true"
                          >
                            {t.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-teal-900">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.role}</p>
                          </div>
                        </div>
                        {t.verified && (
                          <Badge variant="green">
                            <CheckCircle size={11} aria-hidden="true" /> Verified
                          </Badge>
                        )}
                      </header>

                      <div className="mt-3">
                        <StarRow rating={t.rating} />
                      </div>

                      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                        "{t.body}"
                      </blockquote>

                      <footer className="mt-4 text-xs text-slate-400">{t.date}</footer>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── LOCATION BAND ──────────────────────────────── */}
          <section
            aria-label="Location and contact information"
            className="bg-teal-900 px-4 py-16 text-teal-100 sm:px-6"
          >
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: MapPin,
                    title: 'Address',
                    lines: ['742 Evergreen Terrace', 'Springfield, IL 62701'],
                    link: { href: '#', label: 'Get Directions' },
                  },
                  {
                    icon: Phone,
                    title: 'Phone',
                    lines: ['Main: +1 555 000 1234', 'Emergency: +1 555 000 9999'],
                    link: { href: 'tel:+15550001234', label: 'Call Now' },
                  },
                  {
                    icon: Mail,
                    title: 'Email',
                    lines: ['info@clearviewclinic.com', 'portal@clearviewclinic.com'],
                    link: { href: 'mailto:info@clearviewclinic.com', label: 'Send Email' },
                  },
                  {
                    icon: Clock,
                    title: 'Hours',
                    lines: ['Mon–Sat: 8 AM – 6 PM', 'Emergency: 24/7'],
                    link: null,
                  },
                ].map(({ icon: Icon, title, lines, link }) => (
                  <div key={title}>
                    <div className="mb-3 flex items-center gap-2">
                      <Icon size={18} className="text-cyan-400" aria-hidden="true" />
                      <h3 className="font-semibold text-white">{title}</h3>
                    </div>
                    {lines.map((l) => (
                      <p key={l} className="text-sm text-teal-200">{l}</p>
                    ))}
                    {link && (
                      <a
                        href={link.href}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-cyan-400 underline underline-offset-2 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded"
                      >
                        {link.label} <ArrowRight size={12} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="border-t border-teal-800 bg-teal-950 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-700" aria-hidden="true">
                  <Stethoscope size={16} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-white">ClearView Medical Clinic</span>
              </div>
              <p className="text-xs text-teal-400">
                © {new Date().getFullYear()} ClearView Medical Clinic. All rights reserved. ·
                <a href="#" className="ml-1 underline hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded">Privacy Policy</a> ·
                <a href="#" className="ml-1 underline hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded">Accessibility Statement</a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
