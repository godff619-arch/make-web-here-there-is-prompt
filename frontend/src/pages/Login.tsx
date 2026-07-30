import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff, Loader2, ArrowLeft, MailCheck, MessageSquare, Code2, Image, Video, Mic, Brain, Zap, Users } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
})

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type SignInValues = z.infer<typeof signInSchema>
type SignUpValues = z.infer<typeof signUpSchema>

const stats = [
  { icon: Brain, label: '100+ AI Models', value: '100+' },
  { icon: Users, label: 'Active Users', value: '50K+' },
  { icon: Zap, label: 'Uptime SLA', value: '99.9%' },
]

const featureCards = [
  { icon: MessageSquare, title: 'AI Chat', desc: 'Multi-model conversations with context memory' },
  { icon: Code2, title: 'Coding Studio', desc: 'Generate, debug, and deploy code instantly' },
  { icon: Image, title: 'Image Studio', desc: 'Create stunning visuals with text prompts' },
  { icon: Video, title: 'Video Studio', desc: 'Generate and edit video content with AI' },
  { icon: Mic, title: 'Voice Studio', desc: 'Text-to-speech and voice cloning' },
  { icon: Brain, title: 'Knowledge Base', desc: 'Train AI on your documents and data' },
]

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-40 right-[30%] w-96 h-96 rounded-full bg-violet-500/15 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-20 left-[20%] w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-40 right-[10%] w-64 h-64 rounded-full bg-fuchsia-500/10 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
    </div>
  )
}

function GridPattern() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}

function LeftHero() {
  return (
    <div className="relative flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 overflow-hidden">
      <FloatingOrbs />
      <GridPattern />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Enterprise AI Platform
        </motion.div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Universal
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-400 bg-clip-text text-transparent">
            AI Studio
          </span>
        </h1>

        <motion.p
          className="text-lg lg:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Chat, code, create, and collaborate with the most advanced AI models from every provider — all in one unified workspace.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-6 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-3 xl:gap-4 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              className="group relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
              whileHover={{ y: -2 }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                <card.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

const socialButtons = [
  { id: 'google', label: 'Continue with Google', icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
  ) },
  { id: 'github', label: 'Continue with GitHub', icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
  ) },
  { id: 'microsoft', label: 'Continue with Microsoft', icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" rx="1.5" fill="#F25022"/><rect x="13" y="1" width="10" height="10" rx="1.5" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" rx="1.5" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" rx="1.5" fill="#FFB900"/></svg>
  ) },
]

function PasswordField({ id, label, register, error, isLoading }: any) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder="Enter your password"
          disabled={isLoading}
          className="h-12 pr-10 text-base"
          {...register}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  )
}

function OTPButtons() {
  return (
    <div className="flex gap-2 pt-2">
      <Button variant="outline" className="flex-1 h-12 font-medium text-sm" disabled>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        OTP Login
      </Button>
      <Button variant="outline" className="flex-1 h-12 font-medium text-sm" disabled>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        SSO
      </Button>
    </div>
  )
}

export default function LoginPage() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState<'sign-in' | 'sign-up' | 'forgot-password' | 'reset-success'>('sign-in')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', terms: false as unknown as true },
  })

  const forgotForm = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const handleSignIn = async (data: SignInValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await signup(data.email, data.password, data.name)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (data: { email: string }) => {
    setIsLoading(true)
    try {
      await import('@/lib/api').then(m => m.API.auth.forgotPassword(data.email))
      setView('reset-success')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative bg-gradient-to-br from-background via-background to-primary/[0.03]">
        <LeftHero />
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full lg:w-[45%] xl:w-[40%] items-center justify-center p-6 sm:p-8 lg:p-12">
        {/* Mobile background orbs */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
          <motion.div className="absolute top-10 right-0 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" animate={{ x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        </div>

        <motion.div
          key={view}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-[440px]"
        >
          {view === 'sign-in' && (
            <div className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl shadow-background/50 p-8 sm:p-10">
              {/* Mobile branding */}
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Universal AI Studio</h2>
                  <p className="text-xs text-muted-foreground">Enterprise AI Platform</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h2>
                <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </motion.div>
              )}

              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <Input id="email" type="email" placeholder="name@example.com"
                    disabled={isLoading} className="h-12 text-base"
                    {...signInForm.register('email')} />
                  {signInForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>

                <PasswordField
                  id="password"
                  label="Password"
                  register={signInForm.register('password')}
                  error={signInForm.formState.errors.password}
                  isLoading={isLoading}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox id="remember"
                      checked={signInForm.watch('remember')}
                      onCheckedChange={(c) => signInForm.setValue('remember', c === true)} />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <Button type="button" variant="link" className="h-auto p-0 text-sm font-medium text-primary hover:text-primary/80"
                    onClick={() => setView('forgot-password')}>
                    Forgot password?
                  </Button>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</span>
                  ) : 'Sign in'}
                </Button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or continue with</span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              <div className="space-y-2.5">
                {socialButtons.map((btn) => (
                  <Button key={btn.id} variant="outline"
                    className="w-full h-12 font-medium text-sm rounded-xl border-border/60 hover:bg-accent/50 transition-all"
                    disabled>
                    {btn.icon}
                    <span className="ml-3">{btn.label}</span>
                  </Button>
                ))}
              </div>

              <OTPButtons />

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => { setView('sign-up'); setError(null) }}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Create one
                </button>
              </p>
            </div>
          )}

          {view === 'sign-up' && (
            <div className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl shadow-background/50 p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Create your account</h2>
                <p className="text-sm text-muted-foreground">Start building with AI in seconds</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </motion.div>
              )}

              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
                  <Input id="name" placeholder="John Doe" disabled={isLoading} className="h-12 text-base" {...signUpForm.register('name')} />
                  {signUpForm.formState.errors.name && <p className="text-xs text-destructive">{signUpForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email address</Label>
                  <Input id="signup-email" type="email" placeholder="name@example.com" disabled={isLoading} className="h-12 text-base" {...signUpForm.register('email')} />
                  {signUpForm.formState.errors.email && <p className="text-xs text-destructive">{signUpForm.formState.errors.email.message}</p>}
                </div>
                <PasswordField id="signup-password" label="Password" register={signUpForm.register('password')}
                  error={signUpForm.formState.errors.password} isLoading={isLoading} />
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox id="terms" checked={signUpForm.watch('terms')}
                    onCheckedChange={(c) => signUpForm.setValue('terms', c === true ? true as unknown as true : false as unknown as true)} />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the{' '}
                    <span className="text-primary hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-primary hover:underline">Privacy Policy</span>
                  </Label>
                </div>
                {signUpForm.formState.errors.terms && <p className="text-xs text-destructive">{signUpForm.formState.errors.terms.message}</p>}
                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl" disabled={isLoading}>
                  {isLoading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</span> : 'Create account'}
                </Button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or continue with</span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              <div className="space-y-2.5">
                {socialButtons.map((btn) => (
                  <Button key={btn.id} variant="outline"
                    className="w-full h-12 font-medium text-sm rounded-xl border-border/60 hover:bg-accent/50 transition-all"
                    disabled>
                    {btn.icon}
                    <span className="ml-3">{btn.label}</span>
                  </Button>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => { setView('sign-in'); setError(null) }}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          )}

          {view === 'forgot-password' && (
            <div className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl shadow-background/50 p-8 sm:p-10">
              <div className="mb-8">
                <button type="button" onClick={() => setView('sign-in')}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                  <ArrowLeft className="h-4 w-4" /> Back to sign in
                </button>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Reset your password</h2>
                <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-sm font-medium">Email address</Label>
                  <Input id="forgot-email" type="email" placeholder="name@example.com" disabled={isLoading} className="h-12 text-base" {...forgotForm.register('email')} />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl" disabled={isLoading}>
                  {isLoading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending...</span> : 'Send reset link'}
                </Button>
              </form>
            </div>
          )}

          {view === 'reset-success' && (
            <div className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl shadow-background/50 p-8 sm:p-10 text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-primary/10">
                  <MailCheck className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                <p className="text-sm text-muted-foreground">We sent a password reset link to your email address.</p>
                <Button variant="outline" className="mt-8" onClick={() => setView('sign-in')}>Back to sign in</Button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
