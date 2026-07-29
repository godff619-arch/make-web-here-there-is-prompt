import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff, Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

export default function LoginPage() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState<'sign-in' | 'sign-up' | 'forgot-password' | 'reset-success'>('sign-in')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
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
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Universal AI Studio</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Chat, code, create, and collaborate with the most advanced AI platform.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <p className="font-medium text-foreground">AI Chat</p>
              <p>Multi-model conversations</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <p className="font-medium text-foreground">Coding Studio</p>
              <p>VS Code-like experience</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <p className="font-medium text-foreground">Image & Video</p>
              <p>Generate and edit media</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <p className="font-medium text-foreground">Knowledge Base</p>
              <p>Train on your documents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {view === 'sign-in' && (
              <motion.div key="sign-in" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" disabled={isLoading} {...signInForm.register('email')} />
                        {signInForm.formState.errors.email && <p className="text-xs text-destructive">{signInForm.formState.errors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setView('forgot-password')}>Forgot?</Button>
                        </div>
                        <div className="relative">
                          <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" disabled={isLoading} {...signInForm.register('password')} />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {signInForm.formState.errors.password && <p className="text-xs text-destructive">{signInForm.formState.errors.password.message}</p>}
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign in'}
                      </Button>
                    </form>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><Separator /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      No account? <Button variant="link" className="h-auto p-0" onClick={() => setView('sign-up')}>Create one</Button>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {view === 'sign-up' && (
              <motion.div key="sign-up" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create account</CardTitle>
                    <CardDescription>Get started with your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="John Doe" disabled={isLoading} {...signUpForm.register('name')} />
                        {signUpForm.formState.errors.name && <p className="text-xs text-destructive">{signUpForm.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="name@example.com" disabled={isLoading} {...signUpForm.register('email')} />
                        {signUpForm.formState.errors.email && <p className="text-xs text-destructive">{signUpForm.formState.errors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" disabled={isLoading} {...signUpForm.register('password')} />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" checked={signUpForm.watch('terms')} onCheckedChange={(c) => signUpForm.setValue('terms', c === true ? true as unknown as true : false as unknown as true)} />
                        <Label htmlFor="terms" className="text-sm">I agree to the terms and privacy policy</Label>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create account'}
                      </Button>
                    </form>
                    <p className="text-center text-sm text-muted-foreground">
                      Have an account? <Button variant="link" className="h-auto p-0" onClick={() => setView('sign-in')}>Sign in</Button>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {view === 'forgot-password' && (
              <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                  <CardHeader className="text-center relative">
                    <Button variant="ghost" size="icon" className="absolute left-0 top-0" onClick={() => setView('sign-in')}><ArrowLeft className="h-4 w-4" /></Button>
                    <CardTitle className="text-2xl">Reset password</CardTitle>
                    <CardDescription>Enter your email to receive a reset link</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input id="forgot-email" type="email" placeholder="name@example.com" disabled={isLoading} {...forgotForm.register('email')} />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send reset link'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {view === 'reset-success' && (
              <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl text-center">
                  <CardContent className="pt-8 pb-8">
                    <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
                      <MailCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Check your email</h2>
                    <p className="mt-2 text-sm text-muted-foreground">We sent a password reset link to your email.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setView('sign-in')}>Back to sign in</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
