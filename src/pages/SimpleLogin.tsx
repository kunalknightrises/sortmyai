import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Github, Loader2, Twitter } from 'lucide-react';
import { popupSignIn, ProviderType } from '@/lib/direct-auth';
import { useToast } from '@/hooks/use-toast';

const SimpleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (provider: ProviderType) => {
    setIsLoading(true);
    try {
      // Use direct popup authentication
      await popupSignIn(provider);
      
      // Show success toast
      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show error toast
      toast({
        title: 'Authentication error',
        description: error.message || 'An error occurred during sign-in',
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
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            type="button" 
            disabled={isLoading}
            onClick={() => handleLogin('google')}
            className="bg-sortmy-darker hover:bg-sortmy-gray/20"
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
          
          <Button
            variant="outline" 
            type="button" 
            disabled={isLoading}
            onClick={() => handleLogin('github')}
            className="bg-sortmy-darker hover:bg-sortmy-gray/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            type="button" 
            disabled={isLoading}
            onClick={() => handleLogin('twitter')}
            className="bg-sortmy-darker hover:bg-sortmy-gray/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Twitter className="mr-2 h-4 w-4" />
                Sign in with Twitter
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-gray-400 text-center mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SimpleLogin;
