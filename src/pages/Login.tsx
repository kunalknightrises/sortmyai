import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Github } from 'lucide-react';  
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseConnection } from '@/contexts/FirebaseConnectionContext';
import { useEffect, useState } from 'react';  
import { GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { user } = useAuth();
  const { isOnline, forceReconnect } = useFirebaseConnection();  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const getProvider = (name: string) => {
    switch (name) {
      case 'google':
        const provider = new GoogleAuthProvider();
        // Add scopes and custom parameters
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
          client_id: '220186510992-5oa2tojm2o51qh4324ao7fe0mmfkh021.apps.googleusercontent.com',
          prompt: 'select_account'
        });
        return provider;
      case 'github':
        return new GithubAuthProvider();
      case 'twitter':
        return new TwitterAuthProvider();
      default:
        throw new Error('Unsupported provider');
    }
  };

  const signInWithProvider = async (providerName: 'google' | 'github' | 'twitter') => {
    try {
      const provider = getProvider(providerName);
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user profile exists, if not create one
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          is_premium: false,
          claude_enabled: false,
          created_at: new Date().toISOString(),
          avatar_url: firebaseUser.photoURL || undefined,
          role: 'basic'
        });
      }

      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      });
    } catch (error) {
        toast({
          title: 'Authentication error',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          variant: 'destructive',
        });
      if (!(error instanceof Error)) {
        console.error('An unknown error occurred');
      }
      return;
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
              {isLoading ? 'Connecting...' : 'Sign in with Google'}
            </Button>
            <Button
              variant="outline" 
              type="button" 
              disabled={isLoading}
              onClick={() => handleProviderSignIn('github')}
            >
              <Github className="mr-2 h-4 w-4" />
              {isLoading ? 'Connecting...' : 'Sign in with GitHub'}
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              disabled={isLoading}
              onClick={() => handleProviderSignIn('twitter')}
            >
              {isLoading ? 'Connecting...' : 'Sign in with Twitter'}
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
