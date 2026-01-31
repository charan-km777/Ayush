import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  Brain, 
  Heart, 
  Leaf, 
  TrendingUp,
  Sun,
  Moon,
  Wind,
  Flame,
  Mountain
} from 'lucide-react';
import { 
  DoshaScores, 
  DiseasePrediction, 
  getDominantDosha,
  getDoshaDescription 
} from '../utils/ayush-algorithms';

interface HealthDashboardProps {
  userName: string;
  doshaScores: DoshaScores;
  predictions: DiseasePrediction[];
  lifestyleRisk: {
    overallRisk: number;
    riskFactors: Array<{ factor: string; impact: string; score: number }>;
  };
}

export function HealthDashboard({ 
  userName, 
  doshaScores, 
  predictions, 
  lifestyleRisk 
}: HealthDashboardProps) {
  const dominantDosha = getDominantDosha(doshaScores);
  const doshaDescription = getDoshaDescription(dominantDosha);

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case 'Vata': return <Wind className="h-5 w-5" />;
      case 'Pitta': return <Flame className="h-5 w-5" />;
      case 'Kapha': return <Mountain className="h-5 w-5" />;
      default: return <Leaf className="h-5 w-5" />;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-green-600';
    if (risk < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
          <p className="text-muted-foreground">Your personalized AYUSH health insights</p>
        </div>
        <Activity className="h-8 w-8 text-green-600" />
      </div>

      {/* Dosha Profile Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            {getDoshaIcon(dominantDosha)}
            <CardTitle>Your Dosha Profile: {dominantDosha} Dominant</CardTitle>
          </div>
          <CardDescription>{doshaDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Wind className="h-4 w-4" /> Vata
                </span>
                <span className="text-sm font-bold">{doshaScores.vata}%</span>
              </div>
              <Progress value={doshaScores.vata} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4" /> Pitta
                </span>
                <span className="text-sm font-bold">{doshaScores.pitta}%</span>
              </div>
              <Progress value={doshaScores.pitta} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Mountain className="h-4 w-4" /> Kapha
                </span>
                <span className="text-sm font-bold">{doshaScores.kapha}%</span>
              </div>
              <Progress value={doshaScores.kapha} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">
            <Brain className="h-4 w-4 mr-2" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Heart className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Disease Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disease Risk Predictions</CardTitle>
              <CardDescription>
                Based on your dosha profile, lifestyle, and AYUSH principles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.length === 0 ? (
                <Alert>
                  <Leaf className="h-4 w-4" />
                  <AlertDescription>
                    Great! No significant health risks detected. Continue your healthy lifestyle.
                  </AlertDescription>
                </Alert>
              ) : (
                predictions.map((prediction, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{prediction.disease}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {prediction.ayushSystem}
                          </CardDescription>
                        </div>
                        <Badge className={getSeverityColor(prediction.severity)}>
                          {prediction.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Risk Probability</span>
                          <span className="text-sm font-bold">
                            {Math.round(prediction.probability * 100)}%
                          </span>
                        </div>
                        <Progress value={prediction.probability * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifestyle Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Risk Analysis</CardTitle>
              <CardDescription>
                Factors that may impact your health and well-being
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Overall Risk Score</span>
                  <span className={`text-2xl font-bold ${getRiskColor(lifestyleRisk.overallRisk)}`}>
                    {lifestyleRisk.overallRisk}/100
                  </span>
                </div>
                <Progress value={lifestyleRisk.overallRisk} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {lifestyleRisk.overallRisk < 30 && 'Low risk - Excellent lifestyle habits!'}
                  {lifestyleRisk.overallRisk >= 30 && lifestyleRisk.overallRisk < 60 && 'Moderate risk - Room for improvement'}
                  {lifestyleRisk.overallRisk >= 60 && 'High risk - Immediate lifestyle changes recommended'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Risk Factors</h4>
                {lifestyleRisk.riskFactors.length === 0 ? (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Excellent! No significant lifestyle risk factors detected.
                    </AlertDescription>
                  </Alert>
                ) : (
                  lifestyleRisk.riskFactors.map((factor, index) => (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{factor.factor}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{factor.impact}</p>
                          </div>
                          <Badge variant="outline">{factor.score} pts</Badge>
                        </div>
                        <Progress value={(factor.score / 30) * 100} className="h-1.5" />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                AYUSH-based guidance for optimal health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {predictions.map((prediction, predIndex) => (
                <div key={predIndex} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h4 className="font-semibold">{prediction.disease}</h4>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {prediction.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {predictions.length === 0 && (
                <Alert>
                  <Sun className="h-4 w-4" />
                  <AlertDescription>
                    <strong>General Wellness Tips:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Maintain regular sleep schedule (7-8 hours)</li>
                      <li>• Practice yoga or meditation daily</li>
                      <li>• Eat fresh, seasonal foods</li>
                      <li>• Stay hydrated with warm water</li>
                      <li>• Exercise regularly (30+ minutes/day)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Dosha-Specific Guidance */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getDoshaIcon(dominantDosha)}
                {dominantDosha}-Specific Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {dominantDosha === 'Vata' && (
                  <>
                    <li className="flex items-start gap-2">
                      <Moon className="h-4 w-4 mt-0.5 text-purple-600" />
                      <span>Follow a regular daily routine to ground Vata energy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Leaf className="h-4 w-4 mt-0.5 text-purple-600" />
                      <span>Favor warm, cooked, and nourishing foods</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 mt-0.5 text-purple-600" />
                      <span>Practice gentle, grounding yoga and meditation</span>
                    </li>
                  </>
                )}
                {dominantDosha === 'Pitta' && (
                  <>
                    <li className="flex items-start gap-2">
                      <Sun className="h-4 w-4 mt-0.5 text-orange-600" />
                      <span>Avoid excessive heat and competitive activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Leaf className="h-4 w-4 mt-0.5 text-orange-600" />
                      <span>Choose cooling, sweet foods; avoid spicy meals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 mt-0.5 text-orange-600" />
                      <span>Practice calming activities and spend time in nature</span>
                    </li>
                  </>
                )}
                {dominantDosha === 'Kapha' && (
                  <>
                    <li className="flex items-start gap-2">
                      <Activity className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Engage in vigorous exercise and physical activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Leaf className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Choose light, warm foods with pungent spices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Stay mentally stimulated and avoid excessive sleep</span>
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
