import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Flower2, 
  Brain, 
  Activity, 
  Heart, 
  Stethoscope,
  FileText,
  TrendingUp,
  User,
  Home,
  ArrowRight,
  Leaf,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  userName: string;
  onNavigate: (page: 'dashboard' | 'assessment' | 'about') => void;
  hasCompletedAssessment: boolean;
}

export function HomePage({ userName, onNavigate, hasCompletedAssessment }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#e8f5e9]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#87a96b] via-[#2d5016] to-[#5d4e37] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-[150px]">🌿</div>
          <div className="absolute bottom-10 right-10 text-[150px]">🪷</div>
          <div className="absolute top-1/2 left-1/3 text-[100px]">🌱</div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Flower2 className="h-16 w-16 animate-pulse" />
              <h1 className="text-5xl md:text-6xl font-bold">
                AYUSH Health Analytics
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-green-100">
              Welcome back, <span className="font-bold text-white">{userName}</span>! 🙏
            </p>
            
            <p className="text-lg text-green-50 max-w-2xl mx-auto">
              Your Personalized & Predictive Health Platform combining Ayurveda, Yoga, 
              Naturopathy, Unani, Homeopathy, and Siddha principles
            </p>

            {hasCompletedAssessment && (
              <div className="flex items-center justify-center gap-3 mt-6 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-flex">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-semibold">Your health assessment is complete!</span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#faf8f3] to-transparent"></div>
      </div>

      {/* Main Navigation Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2d5016] mb-8 text-center">
            What would you like to do today?
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Dashboard Card */}
            <Card className="border-4 border-[#87a96b] hover:shadow-2xl transition-all hover:scale-105 cursor-pointer bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[#87a96b] rounded-full">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-[#2d5016]">Health Dashboard</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {hasCompletedAssessment 
                    ? 'View your personalized health insights, predictions, and recommendations'
                    : 'Complete your assessment to unlock your health dashboard'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => onNavigate('dashboard')}
                  disabled={!hasCompletedAssessment}
                  className="w-full bg-gradient-to-r from-[#87a96b] to-[#2d5016] hover:from-[#2d5016] hover:to-[#87a96b] text-white font-semibold py-6 text-lg"
                >
                  {hasCompletedAssessment ? (
                    <>
                      View Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Complete Assessment First
                    </>
                  )}
                </Button>
                
                {hasCompletedAssessment && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="text-center p-2 bg-white rounded-lg border border-[#87a96b]">
                      <Brain className="h-5 w-5 mx-auto text-[#87a96b] mb-1" />
                      <p className="text-xs font-medium">Predictions</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-[#87a96b]">
                      <TrendingUp className="h-5 w-5 mx-auto text-[#87a96b] mb-1" />
                      <p className="text-xs font-medium">Risk Analysis</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-[#87a96b]">
                      <Heart className="h-5 w-5 mx-auto text-[#87a96b] mb-1" />
                      <p className="text-xs font-medium">Tips</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-[#87a96b]">
                      <Stethoscope className="h-5 w-5 mx-auto text-[#87a96b] mb-1" />
                      <p className="text-xs font-medium">Doctors</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Card */}
            <Card className="border-4 border-[#98d8c8] hover:shadow-2xl transition-all hover:scale-105 cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[#98d8c8] rounded-full">
                    <FileText className="h-8 w-8 text-[#2d5016]" />
                  </div>
                  <CardTitle className="text-2xl text-[#2d5016]">
                    {hasCompletedAssessment ? 'Retake Assessment' : 'Start Assessment'}
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  {hasCompletedAssessment 
                    ? 'Update your health profile with a new assessment'
                    : 'Take our comprehensive AYUSH health assessment'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => onNavigate('assessment')}
                  className="w-full bg-gradient-to-r from-[#98d8c8] to-[#87a96b] hover:from-[#87a96b] hover:to-[#98d8c8] text-white font-semibold py-6 text-lg"
                >
                  {hasCompletedAssessment ? 'Retake Assessment' : 'Start Now'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-[#98d8c8]">
                    <p className="text-2xl font-bold text-[#87a96b]">2</p>
                    <p className="text-xs font-medium text-muted-foreground">Steps</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-[#98d8c8]">
                    <p className="text-2xl font-bold text-[#87a96b]">~5</p>
                    <p className="text-xs font-medium text-muted-foreground">Minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-2 border-[#d4af37] bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="text-xl text-[#2d5016] flex items-center gap-2">
                <Leaf className="h-6 w-6" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-[#87a96b] hover:bg-[#87a96b] hover:text-white"
                  onClick={() => onNavigate('dashboard')}
                  disabled={!hasCompletedAssessment}
                >
                  <Stethoscope className="h-6 w-6" />
                  <span className="font-semibold">Find Doctors</span>
                  <span className="text-xs text-muted-foreground">Nearby AYUSH practitioners</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-[#87a96b] hover:bg-[#87a96b] hover:text-white"
                  onClick={() => onNavigate('dashboard')}
                  disabled={!hasCompletedAssessment}
                >
                  <FileText className="h-6 w-6" />
                  <span className="font-semibold">Download Report</span>
                  <span className="text-xs text-muted-foreground">Get your health PDF</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-[#87a96b] hover:bg-[#87a96b] hover:text-white"
                  onClick={() => onNavigate('about')}
                >
                  <Heart className="h-6 w-6" />
                  <span className="font-semibold">About AYUSH</span>
                  <span className="text-xs text-muted-foreground">Learn more</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <div className="text-4xl mb-2">🧘</div>
                <CardTitle className="text-lg text-[#2d5016]">Holistic Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Combining ancient wisdom with modern analytics for comprehensive health insights
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="text-4xl mb-2">🎯</div>
                <CardTitle className="text-lg text-[#2d5016]">Personalized Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tailored recommendations based on your unique dosha profile and lifestyle
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="text-4xl mb-2">🌿</div>
                <CardTitle className="text-lg text-[#2d5016]">Natural Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Evidence-based AYUSH practices for sustainable health and wellness
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
