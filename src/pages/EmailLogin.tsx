import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { emailSignIn, emailRegister, resetPassword } from '@/lib/email-auth';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters')
});

type FormMode = 'login' | 'register' | 'reset';

const EmailLogin = () => {
  const [mode, setMode] = useState<FormMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate form based on current mode
  const validateForm = () => {
    setErrors({});
    try {
      if (mode === 'login') {
        loginSchema.parse({ email, password });
      } else if (mode === 'register') {
        registerSchema.parse({ email, password, displayName });
      } else if (mode === 'reset') {
        z.object({ email: z.string().email() }).parse({ email });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create or update user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email?.split('@')[0],
        is_premium: false,
        claude_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: user.photoURL || undefined,
        role: userSnap.exists() ? userSnap.data().role || 'basic' : 'basic',
        last_login: new Date().toISOString()
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, userData);
      } else {
        await setDoc(userRef, {
          ...userData,
          ...userSnap.data(),
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { merge: true });
      }

      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      toast({
        title: 'Authentication error',
        description: error.message || 'An error occurred during Google sign-in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        // Login with email and password
        await emailSignIn(email, password);

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });

        navigate('/dashboard');
      } else if (mode === 'register') {
        // Register with email and password
        await emailRegister(email, password, displayName);

        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });

        navigate('/dashboard');
      } else if (mode === 'reset') {
        // Send password reset email
        await resetPassword(email);

        toast({
          title: "Password reset email sent",
          description: "Check your email for instructions to reset your password.",
        });

        setMode('login');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);

      // Show appropriate error message based on error code
      let errorMessage = 'An error occurred during authentication';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Authentication error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-sortmy-darker">
      <Card className="w-full max-w-md bg-sortmy-darker border-sortmy-gray">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create an account' : 'Reset password'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login' ? 'Enter your email and password to sign in' :
             mode === 'register' ? 'Enter your details to create an account' :
             'Enter your email to receive a reset link'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sortmy-darker border-sortmy-gray"
                disabled={isLoading}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs text-sortmy-blue"
                      onClick={() => setMode('reset')}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-sortmy-darker border-sortmy-gray"
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-sortmy-darker border-sortmy-gray"
                  disabled={isLoading}
                />
                {errors.displayName && <p className="text-xs text-red-500">{errors.displayName}</p>}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' :
                   mode === 'register' ? 'Creating account...' :
                   'Sending reset link...'}
                </>
              ) : (
                mode === 'login' ? 'Sign in' :
                mode === 'register' ? 'Create account' :
                'Send reset link'
              )}
            </Button>

            {mode === 'login' && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sortmy-gray"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-sortmy-darker text-gray-400">Or continue with</span>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-sortmy-darker border-sortmy-gray mt-2"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center">
            {mode === 'login' ? (
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 text-sortmy-blue"
                  onClick={() => setMode('register')}
                  disabled={isLoading}
                >
                  Sign up
                </Button>
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 text-sortmy-blue"
                  onClick={() => setMode('login')}
                  disabled={isLoading}
                >
                  Sign in
                </Button>
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailLogin;
