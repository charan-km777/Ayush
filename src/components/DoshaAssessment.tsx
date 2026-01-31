import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { HealthParameters } from '../utils/ayush-algorithms';

interface DoshaAssessmentProps {
  onComplete: (params: HealthParameters) => void;
}

export function DoshaAssessment({ onComplete }: DoshaAssessmentProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<HealthParameters>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      onComplete(formData as HealthParameters);
      setLoading(false);
    }, 500);
  };

  const updateField = (field: keyof HealthParameters, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dosha Assessment</CardTitle>
        <CardDescription>
          Answer these questions to determine your Ayurvedic constitution (Prakriti)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                required
                onChange={(e) => updateField('age', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="20"
                max="200"
                required
                onChange={(e) => updateField('weight', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                min="100"
                max="250"
                required
                onChange={(e) => updateField('height', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyTemp">Body Temperature Tendency</Label>
              <Select onValueChange={(value) => updateField('bodyTemperature', value)} required>
                <SelectTrigger id="bodyTemp">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Usually cold hands/feet</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="warm">Usually warm/hot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="digestion">Digestion Pattern</Label>
              <Select onValueChange={(value) => updateField('digestion', value)} required>
                <SelectTrigger id="digestion">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="irregular">Irregular/Variable</SelectItem>
                  <SelectItem value="strong">Strong/Fast</SelectItem>
                  <SelectItem value="slow">Slow/Sluggish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep Pattern</Label>
              <Select onValueChange={(value) => updateField('sleepPattern', value)} required>
                <SelectTrigger id="sleep">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light/Interrupted</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="deep">Deep/Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="energy">Energy Level</Label>
              <Select onValueChange={(value) => updateField('energyLevel', value)} required>
                <SelectTrigger id="energy">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variable">Variable/Fluctuating</SelectItem>
                  <SelectItem value="high">High/Intense</SelectItem>
                  <SelectItem value="steady">Steady/Consistent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skin">Skin Type</Label>
              <Select onValueChange={(value) => updateField('skinType', value)} required>
                <SelectTrigger id="skin">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry">Dry/Rough</SelectItem>
                  <SelectItem value="oily">Oily/Acne-prone</SelectItem>
                  <SelectItem value="normal">Normal/Smooth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stress">Stress Level</Label>
              <Select onValueChange={(value) => updateField('stressLevel', value)} required>
                <SelectTrigger id="stress">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise Frequency</Label>
              <Select onValueChange={(value) => updateField('exerciseFrequency', value)} required>
                <SelectTrigger id="exercise">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Few times a week</SelectItem>
                  <SelectItem value="rarely">Rarely/Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Complete Assessment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
