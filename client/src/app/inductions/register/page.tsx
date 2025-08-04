"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Building,
  Mail,
  User,
  Shield,
  Chrome,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMutation } from "@apollo/client";
import { CREATE_INDUCTION_CONTESTANT } from "@/graphql/inductionContestants.graphql";

// Mock Google OAuth - replace with actual Google OAuth implementation
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
}

interface RegistrationToken {
  id: string;
  token: string;
  isValid: boolean;
  expiresAt: string;
  createdAt: string;
}

interface CreateMutationData {
  createInductionContestant: {
    id: string;
    name: string;
    email: string;
  };
}

export default function InductionRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState<RegistrationToken | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // GraphQL Mutation for creating contestant
  const [createContestant, { error: createError }] = 
    useMutation<CreateMutationData>(CREATE_INDUCTION_CONTESTANT, {
      onCompleted: (data) => {
        setRegistrationComplete(true);
        toast.success("Registration completed successfully!");
      },
      onError: (error) => {
        console.error("Error creating contestant:", error);
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
          toast.error("You are already registered for this induction process.");
        } else {
          toast.error(`Registration failed: ${error.message}`);
        }
      },
    });

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    validateToken(token);
  }, [token]);

  // Initialize Google OAuth
  useEffect(() => {
    if (tokenValid) {
      initializeGoogleAuth();
    }
  }, [tokenValid]);

  const validateToken = async (tokenValue: string) => {
    try {
      // Simulate token validation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock token validation response
      const mockTokenData: RegistrationToken = {
        id: "token-id",
        token: tokenValue,
        isValid: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        createdAt: new Date().toISOString(),
      };

      setTokenData(mockTokenData);
      setTokenValid(mockTokenData.isValid);
    } catch (error) {
      console.error("Token validation error:", error);
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  const initializeGoogleAuth = () => {
    // Mock Google OAuth initialization
    // In a real implementation, you would load the Google API script
    // and initialize the OAuth client here
    console.log("Google OAuth would be initialized here");
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);

    try {
      // Mock Google Sign-in - replace with actual Google OAuth implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock Google user data
      const mockGoogleUser: GoogleUser = {
        name: "John Doe",
        email: "john.doe@example.com",
        picture: undefined, // No mock image
      };

      setGoogleUser(mockGoogleUser);
      toast.success("Google Sign-in successful!");
    } catch (error) {
      console.error("Google Sign-in error:", error);
      toast.error("Google Sign-in failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRegistration = async () => {
    if (!googleUser) {
      toast.error("Please sign in with Google first.");
      return;
    }

    setIsRegistering(true);

    try {
      await createContestant({
        variables: {
          createInductionContestantInput: {
            name: googleUser.name,
            email: googleUser.email,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Validating Registration Link
              </h3>
              <p className="text-muted-foreground">
                Please wait while we verify your registration link...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Invalid Registration Link
              </h3>
              <p className="text-muted-foreground">
                {!token 
                  ? "No registration token found in the URL." 
                  : "This registration link is invalid or has expired."
                }
              </p>
            </div>

            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                Please contact your organization administrator for a new registration link.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration complete state
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-2">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Registration Successful!
              </h2>
              <p className="text-muted-foreground text-lg">
                Welcome to the induction process, {googleUser?.name}!
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-green-200">
                    {googleUser?.picture ? (
                      <AvatarImage src={googleUser.picture} alt={googleUser.name} />
                    ) : (
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {googleUser?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{googleUser?.name}</p>
                    <p className="text-sm text-muted-foreground">{googleUser?.email}</p>
                  </div>
                </div>
                
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium mb-2">What happens next:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You have been added to the contestant pool</li>
                    <li>Your evaluation status is set to "Pending"</li>
                    <li>You will be notified about evaluation schedules</li>
                    <li>Contact your administrator for any questions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => window.close()}
                className="px-8 py-3"
              >
                Close Window
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main registration interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Induction Registration
              </h1>
              <p className="text-muted-foreground">
                Join our organization's induction process
              </p>
            </div>
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Valid Registration Link
          </Badge>
        </div>

        {/* Main Registration Card */}
        <Card className="shadow-xl border-2 mb-6">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Complete Your Registration
            </CardTitle>
            <p className="text-muted-foreground">
              Sign in with your Google account to register for the induction process
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {!googleUser ? (
              <>
                {/* Sign in with Google Section */}
                <div className="text-center space-y-4">
                  <div className="p-6 bg-muted/30 rounded-lg border-2 border-dashed">
                    <Chrome className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Sign in with Google</h3>
                    <p className="text-muted-foreground mb-4">
                      We'll use your Google account information to complete your registration
                    </p>
                    
                    <Button
                      size="lg"
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="w-full max-w-sm h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 shadow-sm"
                    >
                      {isSigningIn ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Information Section */}
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Privacy & Security:</strong> We only access your basic profile information (name and email) from Google. Your data is handled securely and used only for the induction process.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <>
                {/* User Information Display */}
                <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-4 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Google Sign-in Successful
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-green-200">
                      {googleUser.picture ? (
                        <AvatarImage src={googleUser.picture} alt={googleUser.name} />
                      ) : (
                        <AvatarFallback className="bg-green-100 text-green-700 text-lg">
                          {googleUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-200">
                          {googleUser.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 dark:text-green-300">
                          {googleUser.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Section */}
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Confirm Your Registration</h3>
                  <p className="text-muted-foreground">
                    Click the button below to complete your registration for the induction process.
                  </p>
                  
                  <Button
                    size="lg"
                    onClick={handleRegistration}
                    disabled={isRegistering}
                    className="w-full max-w-sm h-12"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Registering...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              What to Expect
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <p>Your information will be added to the contestant database</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <p>You'll be assigned a "Pending" evaluation status initially</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <p>Administrators will contact you regarding evaluation schedules</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">4</span>
                </div>
                <p>Your progress will be tracked throughout the induction process</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
