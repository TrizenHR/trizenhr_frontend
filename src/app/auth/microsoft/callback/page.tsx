'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

type CallbackStatus = 'loading' | 'success' | 'error';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for Microsoft auth errors
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || 'Microsoft authentication was cancelled or failed');
        return;
      }

      // No code received
      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from Microsoft');
        return;
      }

      try {
        // Exchange code for tokens via our backend
        const response = await authApi.handleMicrosoftCallback(code);
        
        // Store auth data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setStatus('success');
        toast.success('Successfully signed in with Microsoft!');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Failed to complete Microsoft sign-in'
        );
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Signing in with Microsoft...'}
            {status === 'success' && 'Successfully Signed In!'}
            {status === 'error' && 'Sign-In Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete your authentication.'}
            {status === 'success' && 'Redirecting you to the dashboard...'}
            {status === 'error' && 'There was a problem signing you in.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          )}
          
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-sm text-red-600">
                {errorMessage}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/login')}
                >
                  Back to Login
                </Button>
                <Button
                  onClick={() => {
                    setStatus('loading');
                    setErrorMessage('');
                    authApi.getMicrosoftAuthUrl().then(({ authUrl }) => {
                      window.location.href = authUrl;
                    });
                  }}
                >
                  Try Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MicrosoftCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
