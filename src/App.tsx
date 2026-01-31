import { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { DoshaAssessment } from './components/DoshaAssessment';
import { LifestyleAssessment } from './components/LifestyleAssessment';
import { EnhancedHealthDashboard } from './components/EnhancedHealthDashboard';
import { HomePage } from './components/HomePage';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { LogOut, Leaf, ArrowRight, Home } from 'lucide-react';
import { Toaster, toast } from 'sonner@2.0.3';
import {
  HealthParameters,
  LifestyleFactors,
  DoshaScores,
  DiseasePrediction,
  calculateDoshaProfile,
  predictDiseases,
  calculateLifestyleRisk,
} from './utils/ayush-algorithms';
import { apiRequest } from './utils/api';
import { getSupabaseClient } from './utils/supabase-client';

type AppStep = 'auth' | 'dosha' | 'lifestyle' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<AppStep>('auth');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [healthParams, setHealthParams] = useState<HealthParameters | null>(null);
  const [lifestyleFactors, setLifestyleFactors] = useState<LifestyleFactors | null>(null);
  const [doshaScores, setDoshaScores] = useState<DoshaScores | null>(null);
  const [predictions, setPredictions] = useState<DiseasePrediction[]>([]);
  const [lifestyleRisk, setLifestyleRisk] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        
        // Test the token with debug endpoint first
        try {
          const debugResponse = await fetch(
            `https://${(await import('./utils/supabase/info')).projectId}.supabase.co/functions/v1/make-server-8b756e70/debug-token`,
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            }
          );
          const debugData = await debugResponse.json();
          console.log('Token validation test:', debugData);
          
          if (!debugData.success) {
            console.error('Token validation failed, clearing session');
            setStep('auth');
            return;
          }
        } catch (debugError) {
          console.error('Debug endpoint error:', debugError);
        }
        
        // Load user profile
        try {
          const { profile } = await apiRequest('/profile', {}, session.access_token);
          setUserName(profile?.name || 'User');
          
          // Try to load existing assessments
          await loadExistingData(session.access_token);
        } catch (error) {
          console.error('Error loading profile:', error);
          setStep('dosha');
        }
      }
    } catch (error) {
      console.log('No existing session:', error);
    }
  };

  const loadExistingData = async (token: string) => {
    try {
      setLoading(true);
      
      // Load dosha assessment
      const { assessment: doshaAssessment } = await apiRequest('/dosha-assessment', {}, token);
      
      // Load health assessment
      const { assessment: healthAssessment } = await apiRequest('/health-assessment', {}, token);
      
      // Load lifestyle data
      const { lifestyle } = await apiRequest('/lifestyle', {}, token);
      
      // Load predictions
      const { predictions: savedPredictions } = await apiRequest('/predictions', {}, token);

      if (doshaAssessment && healthAssessment && lifestyle && savedPredictions) {
        setHealthParams(healthAssessment.params);
        setLifestyleFactors(lifestyle);
        setDoshaScores(doshaAssessment.scores);
        setPredictions(savedPredictions.predictions);
        setLifestyleRisk(savedPredictions.lifestyleRisk);
        setStep('dashboard');
        toast.success('Welcome back! Your data has been loaded.');
      } else {
        setStep('dosha');
      }
    } catch (error) {
      console.log('No existing assessments found');
      setStep('dosha');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (token: string, name: string) => {
    setAccessToken(token);
    setUserName(name);
    toast.success(`Welcome, ${name}!`);
    loadExistingData(token);
  };

  const handleDoshaComplete = async (params: HealthParameters) => {
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setHealthParams(params);
      
      // Calculate dosha scores
      const scores = calculateDoshaProfile(params);
      setDoshaScores(scores);

      // Save to backend
      await apiRequest(
        '/dosha-assessment',
        {
          method: 'POST',
          body: JSON.stringify({ scores, params }),
        },
        accessToken
      );

      await apiRequest(
        '/health-assessment',
        {
          method: 'POST',
          body: JSON.stringify({ params }),
        },
        accessToken
      );

      toast.success('Dosha assessment completed!');
      setStep('lifestyle');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save assessment';
      toast.error(errorMessage);
      console.error('Error saving dosha assessment:', error);
      // Continue to lifestyle even if save fails
      setStep('lifestyle');
    } finally {
      setLoading(false);
    }
  };

  const handleLifestyleComplete = async (lifestyle: LifestyleFactors) => {
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setLifestyleFactors(lifestyle);

      if (!healthParams || !doshaScores) {
        toast.error('Missing health data');
        return;
      }

      // Calculate predictions
      const diseasePredictions = predictDiseases(doshaScores, lifestyle, healthParams);
      setPredictions(diseasePredictions);

      // Calculate lifestyle risk
      const risk = calculateLifestyleRisk(lifestyle, healthParams);
      setLifestyleRisk(risk);

      // Save to backend
      await apiRequest(
        '/lifestyle',
        {
          method: 'POST',
          body: JSON.stringify(lifestyle),
        },
        accessToken
      );

      await apiRequest(
        '/predictions',
        {
          method: 'POST',
          body: JSON.stringify({
            predictions: diseasePredictions,
            lifestyleRisk: risk,
          }),
        },
        accessToken
      );

      toast.success('Analysis complete!');
      setStep('dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete analysis';
      toast.error(errorMessage);
      console.error('Error saving lifestyle assessment:', error);
      // Show dashboard even if save fails
      setStep('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      
      setAccessToken(null);
      setUserName('');
      setHealthParams(null);
      setLifestyleFactors(null);
      setDoshaScores(null);
      setPredictions([]);
      setLifestyleRisk(null);
      setStep('auth');
      
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const retakeAssessment = () => {
    setHealthParams(null);
    setLifestyleFactors(null);
    setDoshaScores(null);
    setPredictions([]);
    setLifestyleRisk(null);
    setStep('dosha');
    toast.info('Retaking assessment');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center space-y-4">
          <Leaf className="h-12 w-12 animate-spin mx-auto text-green-600" />
          <p className="text-lg text-muted-foreground">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700">AYUSH Health Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Personalized & Predictive Health Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              {step === 'dashboard' && (
                <Button onClick={retakeAssessment} variant="outline" size="sm">
                  Retake Assessment
                </Button>
              )}
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      {step !== 'dashboard' && (
        <div className="bg-white border-b py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Assessment Progress</span>
              <span className="text-sm text-muted-foreground">
                {step === 'dosha' && 'Step 1 of 2'}
                {step === 'lifestyle' && 'Step 2 of 2'}
              </span>
            </div>
            <Progress value={step === 'dosha' ? 50 : 100} className="h-2" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {step === 'dosha' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100">
                <CardTitle className="text-2xl">Welcome to Your Health Journey</CardTitle>
                <CardDescription className="text-base">
                  We'll assess your unique constitution using principles from Ayurveda, Yoga, 
                  Naturopathy, Unani, Homeopathy, and Siddha (AYUSH) systems.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700">Step 1</h4>
                    <p className="text-sm text-muted-foreground">Health Assessment</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700">Step 2</h4>
                    <p className="text-sm text-muted-foreground">Lifestyle Analysis</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700">Results</h4>
                    <p className="text-sm text-muted-foreground">Personalized Dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <DoshaAssessment onComplete={handleDoshaComplete} />
          </div>
        )}

        {step === 'lifestyle' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Almost Done!</h3>
                    <p className="text-sm text-muted-foreground">
                      Now let's analyze your lifestyle for a complete health picture
                    </p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <LifestyleAssessment onComplete={handleLifestyleComplete} />
          </div>
        )}

        {step === 'dashboard' && doshaScores && lifestyleRisk && accessToken && (
          <div className="max-w-7xl mx-auto">
            <EnhancedHealthDashboard
              userName={userName}
              doshaScores={doshaScores}
              predictions={predictions}
              lifestyleRisk={lifestyleRisk}
              accessToken={accessToken}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Disclaimer:</strong> This platform is for educational and informational purposes only.
            </p>
            <p>
              It is not intended to diagnose, treat, cure, or prevent any disease. 
              Always consult with qualified healthcare practitioners before making health decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}