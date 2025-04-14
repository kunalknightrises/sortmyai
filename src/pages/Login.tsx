import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Github, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseConnection } from '@/contexts/FirebaseConnectionContext';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithProviderRedirect, getAuthRedirectResult, createOrUpdateUserProfile, ProviderType } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { user } = useAuth();
  const { isOnline, forceReconnect } = useFirebaseConnection();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check for redirect result when component mounts
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('Checking for redirect result...');
        setIsLoading(true);
        const result = await getAuthRedirectResult();
        console.log('Redirect result:', result);

        if (result && result.user) {
          console.log('User authenticated:', result.user);
          // Create or update user profile
          await createOrUpdateUserProfile(result.user);

          toast({
            title: "Welcome!",
            description: "You've successfully signed in.",
          });

          // Force navigation to dashboard
          window.location.href = '/dashboard';
        } else {
          console.log('No redirect result found');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: 'Authentication error',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirectResult();
  }, [toast]);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    console.log('User state changed:', user);
    if (user) {
      console.log('User is logged in, redirecting to dashboard');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const signInWithProvider = async (providerName: ProviderType) => {
    try {
      console.log('Starting sign in with provider:', providerName);
      // Use redirect method only - no popups
      await signInWithProviderRedirect(providerName);
      console.log('Redirect initiated');
      // The redirect will navigate away from the page
      // Result will be handled in the useEffect above
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication error',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleProviderSignIn = async (providerName: 'google' | 'github' | 'twitter') => {
    setIsLoading(true);
    try {
      if (!isOnline) {
        await forceReconnect().catch(() => {
          toast({
            title: "Network Error",
            description: "Could not reconnect to the network.",
            variant: "destructive",
          });
          return;
        });
      }
       await signInWithProvider(providerName);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('google')}
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : 'Sign in with Google'}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('github')}
            >
              <Github className="mr-2 h-4 w-4" />
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : 'Sign in with GitHub'}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('twitter')}
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : 'Sign in with Twitter'}
            </Button>
            {!isOnline && (
              <Button
                variant="destructive"
                onClick={forceReconnect}
                type="button"
                disabled={isLoading}
              >
                Retry Connection
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-sortmy-blue hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
