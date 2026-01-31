import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
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
  Mountain,
  Download,
  MapPin,
  Hospital,
  Stethoscope,
  Phone,
  Navigation,
  Clock,
  Star,
  FileText,
  Pill,
  Flower2
} from 'lucide-react';
import { 
  DoshaScores, 
  DiseasePrediction, 
  getDominantDosha,
  getDoshaDescription 
} from '../utils/ayush-algorithms';
import { projectId } from '../utils/supabase/info';

interface DoctorRecommendation {
  name: string;
  specialty: string;
  ayushFocus: string;
  rating: number;
  distance: string;
  address: string;
  phone: string;
  availability: string;
  consultationFee: string;
}

interface HealthDashboardProps {
  userName: string;
  doshaScores: DoshaScores;
  predictions: DiseasePrediction[];
  lifestyleRisk: {
    overallRisk: number;
    riskFactors: Array<{ factor: string; impact: string; score: number }>;
  };
  accessToken: string;
}

export function EnhancedHealthDashboard({ 
  userName, 
  doshaScores, 
  predictions, 
  lifestyleRisk,
  accessToken 
}: HealthDashboardProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [doctors, setDoctors] = useState<DoctorRecommendation[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const dominantDosha = getDominantDosha(doshaScores);
  const doshaDescription = getDoshaDescription(dominantDosha);

  useEffect(() => {
    // Auto-request location on mount
    requestLocation();
  }, []);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          fetchNearbyDoctors(coords);
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          setLoadingLocation(false);
          // Fallback to sample data
          fetchNearbyDoctors(null);
        }
      );
    } else {
      // Fallback to sample data
      fetchNearbyDoctors(null);
    }
  };

  const fetchNearbyDoctors = async (coords: { lat: number; lng: number } | null) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b756e70/nearby-doctors`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            location: coords,
            doshaProfile: dominantDosha,
            conditions: predictions.map(p => p.disease)
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Set fallback sample doctors
      setDoctors(getSampleDoctors());
    }
  };

  const getSampleDoctors = (): DoctorRecommendation[] => {
    return [
      {
        name: 'Dr. Priya Sharma',
        specialty: 'Ayurvedic Medicine',
        ayushFocus: 'Panchakarma & Dosha Balancing',
        rating: 4.8,
        distance: '1.2 km',
        address: '123 Wellness Center, Green Park',
        phone: '+91-9876543210',
        availability: 'Mon-Sat, 9 AM - 6 PM',
        consultationFee: '₹800'
      },
      {
        name: 'Dr. Rajesh Kumar',
        specialty: 'Yoga Therapy',
        ayushFocus: 'Stress Management & Pranayama',
        rating: 4.9,
        distance: '2.5 km',
        address: '456 Holistic Health Clinic, Central Avenue',
        phone: '+91-9876543211',
        availability: 'Mon-Fri, 10 AM - 7 PM',
        consultationFee: '₹1000'
      },
      {
        name: 'Dr. Meera Patel',
        specialty: 'Naturopathy',
        ayushFocus: 'Diet & Lifestyle Counseling',
        rating: 4.7,
        distance: '3.0 km',
        address: '789 Nature Cure Center, Herbal Lane',
        phone: '+91-9876543212',
        availability: 'Tue-Sun, 8 AM - 5 PM',
        consultationFee: '₹700'
      }
    ];
  };

  const downloadReport = async () => {
    setDownloadingPDF(true);
    try {
      // Generate comprehensive report HTML
      const reportHTML = generateComprehensiveReportHTML();
      
      // Create a better formatted report for download
      const reportData = {
        userName,
        generatedDate: new Date().toISOString(),
        doshaProfile: {
          dominant: dominantDosha,
          description: doshaDescription,
          scores: doshaScores
        },
        predictions,
        lifestyleRisk,
        doctors,
        location
      };

      // Save to localStorage
      localStorage.setItem('ayush_latest_report', JSON.stringify(reportData));
      localStorage.setItem('ayush_report_history', JSON.stringify([
        ...(JSON.parse(localStorage.getItem('ayush_report_history') || '[]')),
        { date: new Date().toISOString(), data: reportData }
      ]));

      // Create downloadable text report as fallback
      const textReport = generateTextReport(reportData);
      
      // Try to download as a formatted HTML file (works better than PDF generation)
      const blob = new Blob([reportHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AYUSH_Health_Report_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also download as JSON for data backup
      const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `AYUSH_Data_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // Also download as text report
      const textBlob = new Blob([textReport], { type: 'text/plain' });
      const textUrl = URL.createObjectURL(textBlob);
      const textLink = document.createElement('a');
      textLink.href = textUrl;
      textLink.download = `AYUSH_Report_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(textLink);
      textLink.click();
      document.body.removeChild(textLink);
      URL.revokeObjectURL(textUrl);

      alert('✅ Report downloaded successfully!\n\n3 files have been saved:\n1. HTML Report (formatted view)\n2. JSON Data (complete data backup)\n3. Text Report (readable format)');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Your data has been saved to local storage. Please check browser console for details.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const generateTextReport = (data: any) => {
    return `
╔════════════════════════════════════════════════════════════════════╗
║           🌿 AYUSH HEALTH ANALYTICS REPORT 🌿                      ║
║     Personalized & Predictive Health Assessment                   ║
╚════════════════════════════════════════════════════════════════════╝

Patient Name: ${data.userName}
Report Generated: ${new Date(data.generatedDate).toLocaleString()}
Location: ${data.location ? `Lat: ${data.location.lat}, Lng: ${data.location.lng}` : 'Not available'}

═══════════════════════════════════════════════════════════════════

📊 DOSHA PROFILE
═══════════════════════════════════════════════════════════════════

Dominant Dosha: ${data.doshaProfile.dominant}
Description: ${data.doshaProfile.description}

Dosha Distribution:
  • Vata (Air & Space):    ${data.doshaProfile.scores.vata}%
  • Pitta (Fire & Water):  ${data.doshaProfile.scores.pitta}%
  • Kapha (Earth & Water): ${data.doshaProfile.scores.kapha}%

════════════════════════════════════════════��══════════════════════

🏥 DISEASE RISK PREDICTIONS
═══════════════════════════════════════════════════════════════════

${data.predictions.length === 0 ? '✅ No significant health risks detected. Excellent!' : data.predictions.map((pred: any, idx: number) => `
${idx + 1}. ${pred.disease}
   System: ${pred.ayushSystem}
   Risk Probability: ${Math.round(pred.probability * 100)}%
   Severity: ${pred.severity.toUpperCase()}
   
   Recommendations:
   ${pred.recommendations.map((rec: string) => `   ✓ ${rec}`).join('\n   ')}
`).join('\n')}

═══════════════════════════════════════════════════════════════════

⚠️ LIFESTYLE RISK ANALYSIS
═══════════════════════════════════════════════════════════════════

Overall Risk Score: ${data.lifestyleRisk.overallRisk}/100
Status: ${data.lifestyleRisk.overallRisk < 30 ? '✅ Low Risk - Excellent!' : data.lifestyleRisk.overallRisk < 60 ? '⚠️ Moderate Risk' : '🚨 High Risk'}

Risk Factors:
${data.lifestyleRisk.riskFactors.length === 0 ? '✅ None detected' : data.lifestyleRisk.riskFactors.map((factor: any) => `
  • ${factor.factor} (${factor.score} points)
    ${factor.impact}
`).join('\n')}

═══════════════════════════════════════════════════════════════════

👨‍⚕️ RECOMMENDED AYUSH PRACTITIONERS
═══════════════════════════════════════════════════════════════════

${data.doctors.length === 0 ? 'No practitioners found. Please enable location services.' : data.doctors.map((doc: any, idx: number) => `
${idx + 1}. ${doc.name}
   Specialty: ${doc.specialty}
   AYUSH Focus: ${doc.ayushFocus}
   Rating: ${doc.rating} ⭐
   Distance: ${doc.distance}
   Address: ${doc.address}
   Phone: ${doc.phone}
   Availability: ${doc.availability}
   Consultation Fee: ${doc.consultationFee}
`).join('\n')}

═══════════════════════════════════════════════════════════════════

⚠️ DISCLAIMER
═══════════════════════════════════════════════════════════════════

This report is for educational and informational purposes only. It is 
not intended to diagnose, treat, cure, or prevent any disease. Always 
consult with qualified healthcare practitioners before making health 
decisions.

Report ID: ${data.generatedDate}
Platform: AYUSH Health Analytics
Version: 2.0

═══════════════════════════════════════════════════════════════════
    `.trim();
  };

  const generateComprehensiveReportHTML = () => {
    return `
      <div style="font-family: Arial, sans-serif; color: #2d5016;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #87a96b 0%, #2d5016 100%); color: white; border-radius: 10px;">
          <h1 style="margin: 0; font-size: 32px;">🌿 AYUSH Health Analytics</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Personalized & Predictive Health Report</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #2d5016; border-bottom: 2px solid #87a96b; padding-bottom: 10px;">Patient Information</h2>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Dominant Dosha:</strong> ${dominantDosha}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #2d5016; border-bottom: 2px solid #87a96b; padding-bottom: 10px;">Dosha Profile</h2>
          <div style="margin: 15px 0;">
            <p><strong>Vata:</strong> ${doshaScores.vata}%</p>
            <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
              <div style="background: #87a96b; width: ${doshaScores.vata}%; height: 100%;"></div>
            </div>
          </div>
          <div style="margin: 15px 0;">
            <p><strong>Pitta:</strong> ${doshaScores.pitta}%</p>
            <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
              <div style="background: #c65d3b; width: ${doshaScores.pitta}%; height: 100%;"></div>
            </div>
          </div>
          <div style="margin: 15px 0;">
            <p><strong>Kapha:</strong> ${doshaScores.kapha}%</p>
            <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
              <div style="background: #98d8c8; width: ${doshaScores.kapha}%; height: 100%;"></div>
            </div>
          </div>
          <p style="margin-top: 15px; font-style: italic; color: #5d4e37;">${doshaDescription}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #2d5016; border-bottom: 2px solid #87a96b; padding-bottom: 10px;">Disease Risk Predictions</h2>
          ${predictions.map(pred => `
            <div style="margin: 15px 0; padding: 15px; border: 2px solid #87a96b; border-radius: 8px; background: #faf8f3;">
              <h3 style="margin: 0 0 10px 0; color: #2d5016;">${pred.disease}</h3>
              <p style="margin: 5px 0;"><strong>System:</strong> ${pred.ayushSystem}</p>
              <p style="margin: 5px 0;"><strong>Risk Probability:</strong> ${Math.round(pred.probability * 100)}%</p>
              <p style="margin: 5px 0;"><strong>Severity:</strong> <span style="color: ${pred.severity === 'high' ? '#c65d3b' : pred.severity === 'moderate' ? '#d4af37' : '#87a96b'};">${pred.severity.toUpperCase()}</span></p>
              <p style="margin: 10px 0 5px 0;"><strong>Recommendations:</strong></p>
              <ul style="margin: 0; padding-left: 20px;">
                ${pred.recommendations.map(rec => `<li style="margin: 5px 0;">${rec}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #2d5016; border-bottom: 2px solid #87a96b; padding-bottom: 10px;">Lifestyle Risk Analysis</h2>
          <p><strong>Overall Risk Score:</strong> ${lifestyleRisk.overallRisk}/100</p>
          <div style="background: #e0e0e0; height: 25px; border-radius: 10px; overflow: hidden; margin: 10px 0;">
            <div style="background: ${lifestyleRisk.overallRisk < 30 ? '#87a96b' : lifestyleRisk.overallRisk < 60 ? '#d4af37' : '#c65d3b'}; width: ${lifestyleRisk.overallRisk}%; height: 100%;"></div>
          </div>
          ${lifestyleRisk.riskFactors.map(factor => `
            <div style="margin: 10px 0; padding: 10px; background: #faf8f3; border-radius: 5px;">
              <p style="margin: 0; font-weight: bold;">${factor.factor}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #5d4e37;">${factor.impact}</p>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 40px; padding: 20px; background: #faf8f3; border-radius: 10px; border: 2px solid #87a96b;">
          <p style="margin: 0; font-size: 12px; color: #5d4e37;"><strong>Disclaimer:</strong> This report is for educational and informational purposes only. It is not intended to diagnose, treat, cure, or prevent any disease. Always consult with qualified healthcare practitioners before making health decisions.</p>
        </div>
      </div>
    `;
  };

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
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Enhanced Header with Herbal Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#87a96b] via-[#2d5016] to-[#5d4e37] p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 opacity-10 text-[200px]">🌿</div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Flower2 className="h-10 w-10" />
                Welcome, {userName}
              </h1>
              <p className="text-green-100 text-lg">Your Personalized AYUSH Health Insights</p>
            </div>
            <Button
              onClick={downloadReport}
              disabled={downloadingPDF}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white font-semibold px-6 py-6 text-lg"
            >
              {downloadingPDF ? (
                <>
                  <Activity className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Dosha Profile Card */}
      <Card className="border-4 border-[#87a96b] dosha-card">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            {getDoshaIcon(dominantDosha)}
            <div>
              <CardTitle className="text-2xl">Your Dosha Profile: {dominantDosha} Dominant</CardTitle>
              <CardDescription className="text-base mt-1">{doshaDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold flex items-center gap-2">
                  <Wind className="h-5 w-5 text-purple-600" /> Vata (Air & Space)
                </span>
                <span className="text-lg font-bold text-purple-700">{doshaScores.vata}%</span>
              </div>
              <Progress value={doshaScores.vata} className="h-3 bg-purple-100" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" /> Pitta (Fire & Water)
                </span>
                <span className="text-lg font-bold text-orange-700">{doshaScores.pitta}%</span>
              </div>
              <Progress value={doshaScores.pitta} className="h-3 bg-orange-100" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-blue-600" /> Kapha (Earth & Water)
                </span>
                <span className="text-lg font-bold text-blue-700">{doshaScores.kapha}%</span>
              </div>
              <Progress value={doshaScores.kapha} className="h-3 bg-blue-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-14 bg-[#faf8f3] border-2 border-[#87a96b]">
          <TabsTrigger value="predictions" className="text-base data-[state=active]:bg-[#87a96b] data-[state=active]:text-white">
            <Brain className="h-5 w-5 mr-2" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="risks" className="text-base data-[state=active]:bg-[#87a96b] data-[state=active]:text-white">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-base data-[state=active]:bg-[#87a96b] data-[state=active]:text-white">
            <Heart className="h-5 w-5 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="doctors" className="text-base data-[state=active]:bg-[#87a96b] data-[state=active]:text-white">
            <Stethoscope className="h-5 w-5 mr-2" />
            Find Doctors
          </TabsTrigger>
        </TabsList>

        {/* Disease Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4 mt-6">
          <Card className="border-2 border-[#87a96b]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#2d5016]" />
                Disease Risk Predictions
              </CardTitle>
              <CardDescription className="text-base">
                Based on your dosha profile, lifestyle, and AYUSH principles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {predictions.length === 0 ? (
                <Alert className="bg-green-50 border-2 border-green-300">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-base text-green-800">
                    Excellent! No significant health risks detected. Continue your healthy lifestyle.
                  </AlertDescription>
                </Alert>
              ) : (
                predictions.map((prediction, index) => (
                  <Card key={index} className="border-l-8 border-l-[#87a96b] shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-[#2d5016]">{prediction.disease}</CardTitle>
                          <CardDescription className="text-sm mt-2 flex items-center gap-2">
                            <Pill className="h-4 w-4" />
                            {prediction.ayushSystem}
                          </CardDescription>
                        </div>
                        <Badge className={`${getSeverityColor(prediction.severity)} border-2 px-4 py-2 text-sm font-semibold`}>
                          {prediction.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base font-medium">Risk Probability</span>
                          <span className="text-xl font-bold text-[#2d5016]">
                            {Math.round(prediction.probability * 100)}%
                          </span>
                        </div>
                        <Progress value={prediction.probability * 100} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifestyle Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-4 mt-6">
          <Card className="border-2 border-[#87a96b]">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="text-xl">Lifestyle Risk Analysis</CardTitle>
              <CardDescription className="text-base">
                Factors that may impact your health and well-being
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-lg">Overall Risk Score</span>
                  <span className={`text-4xl font-bold ${getRiskColor(lifestyleRisk.overallRisk)}`}>
                    {lifestyleRisk.overallRisk}/100
                  </span>
                </div>
                <Progress value={lifestyleRisk.overallRisk} className="h-4" />
                <p className="text-sm text-muted-foreground mt-3">
                  {lifestyleRisk.overallRisk < 30 && '✅ Low risk - Excellent lifestyle habits!'}
                  {lifestyleRisk.overallRisk >= 30 && lifestyleRisk.overallRisk < 60 && '⚠️ Moderate risk - Room for improvement'}
                  {lifestyleRisk.overallRisk >= 60 && '🚨 High risk - Immediate lifestyle changes recommended'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-base">Risk Factors</h4>
                {lifestyleRisk.riskFactors.length === 0 ? (
                  <Alert className="bg-green-50 border-2 border-green-300">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-base text-green-800">
                      Excellent! No significant lifestyle risk factors detected.
                    </AlertDescription>
                  </Alert>
                ) : (
                  lifestyleRisk.riskFactors.map((factor, index) => (
                    <Card key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-base">{factor.factor}</h5>
                            <p className="text-sm text-muted-foreground mt-2">{factor.impact}</p>
                          </div>
                          <Badge variant="outline" className="px-3 py-1 text-base font-bold">
                            {factor.score} pts
                          </Badge>
                        </div>
                        <Progress value={(factor.score / 30) * 100} className="h-2" />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <Card className="border-2 border-[#87a96b]">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-xl">Personalized Recommendations</CardTitle>
              <CardDescription className="text-base">
                AYUSH-based guidance for optimal health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {predictions.map((prediction, predIndex) => (
                <div key={predIndex} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-red-500" />
                    <h4 className="font-bold text-lg text-[#2d5016]">{prediction.disease}</h4>
                  </div>
                  <ul className="space-y-3 ml-9">
                    {prediction.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-base flex items-start gap-3">
                        <span className="text-green-600 mt-1 text-xl">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {predictions.length === 0 && (
                <Alert className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
                  <Sun className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-base">
                    <strong>General Wellness Tips:</strong>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li>🌅 Maintain regular sleep schedule (7-8 hours)</li>
                      <li>🧘 Practice yoga or meditation daily</li>
                      <li>🥗 Eat fresh, seasonal foods</li>
                      <li>💧 Stay hydrated with warm water</li>
                      <li>🏃 Exercise regularly (30+ minutes/day)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Dosha-Specific Guidance */}
          <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-[#9678b6]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                {getDoshaIcon(dominantDosha)}
                {dominantDosha}-Specific Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-base">
                {dominantDosha === 'Vata' && (
                  <>
                    <li className="flex items-start gap-3">
                      <Moon className="h-5 w-5 mt-0.5 text-purple-600" />
                      <span>Follow a regular daily routine to ground Vata energy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Leaf className="h-5 w-5 mt-0.5 text-purple-600" />
                      <span>Favor warm, cooked, and nourishing foods</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="h-5 w-5 mt-0.5 text-purple-600" />
                      <span>Practice gentle, grounding yoga and meditation</span>
                    </li>
                  </>
                )}
                {dominantDosha === 'Pitta' && (
                  <>
                    <li className="flex items-start gap-3">
                      <Sun className="h-5 w-5 mt-0.5 text-orange-600" />
                      <span>Avoid excessive heat and competitive activities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Leaf className="h-5 w-5 mt-0.5 text-orange-600" />
                      <span>Choose cooling, sweet foods; avoid spicy meals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="h-5 w-5 mt-0.5 text-orange-600" />
                      <span>Practice calming activities and spend time in nature</span>
                    </li>
                  </>
                )}
                {dominantDosha === 'Kapha' && (
                  <>
                    <li className="flex items-start gap-3">
                      <Activity className="h-5 w-5 mt-0.5 text-blue-600" />
                      <span>Engage in vigorous exercise and physical activity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Leaf className="h-5 w-5 mt-0.5 text-blue-600" />
                      <span>Choose light, warm foods with pungent spices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Brain className="h-5 w-5 mt-0.5 text-blue-600" />
                      <span>Stay mentally stimulated and avoid excessive sleep</span>
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctor Recommendations Tab */}
        <TabsContent value="doctors" className="space-y-4 mt-6">
          <Card className="border-2 border-[#87a96b]">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Hospital className="h-6 w-6 text-[#2d5016]" />
                    Nearby AYUSH Practitioners
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Based on your location and health profile
                  </CardDescription>
                </div>
                <Button
                  onClick={requestLocation}
                  disabled={loadingLocation}
                  variant="outline"
                  className="border-2 border-[#87a96b] text-[#2d5016] hover:bg-[#87a96b] hover:text-white"
                >
                  {loadingLocation ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Finding...
                    </>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Update Location
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {location && (
                <Alert className="mb-6 bg-green-50 border-2 border-green-300">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-base text-green-800">
                    Showing practitioners near your location (Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)})
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor, index) => (
                  <Card key={index} className="border-2 border-[#98d8c8] hover:shadow-xl transition-all hover:scale-105">
                    <CardHeader className="bg-gradient-to-br from-teal-50 to-green-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-[#2d5016]">{doctor.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {doctor.specialty}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-bold">{doctor.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Pill className="h-4 w-4 text-[#87a96b]" />
                        <span className="font-medium text-[#2d5016]">{doctor.ayushFocus}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-[#87a96b]" />
                        <span>{doctor.distance} away</span>
                      </div>

                      <p className="text-sm text-muted-foreground">{doctor.address}</p>

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-[#87a96b]" />
                        <span className="font-mono">{doctor.phone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#87a96b]" />
                        <span>{doctor.availability}</span>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm">
                          <span className="font-semibold text-[#2d5016]">Consultation Fee:</span>{' '}
                          <span className="text-base font-bold text-[#87a96b]">{doctor.consultationFee}</span>
                        </p>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-[#87a96b] to-[#2d5016] hover:from-[#2d5016] hover:to-[#87a96b] text-white font-semibold">
                        <Phone className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {doctors.length === 0 && !loadingLocation && (
                <Alert className="bg-yellow-50 border-2 border-yellow-300">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <AlertDescription className="text-base text-yellow-800">
                    No practitioners found. Please enable location services or try again later.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Disclaimer */}
      <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-sm">
          <strong>Disclaimer:</strong> This platform is for educational and informational purposes only.
          It is not intended to diagnose, treat, cure, or prevent any disease. Always consult with qualified healthcare practitioners
          before making health decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}