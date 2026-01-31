import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { LifestyleFactors } from '../utils/ayush-algorithms';

interface LifestyleAssessmentProps {
  onComplete: (lifestyle: LifestyleFactors) => void;
}

export function LifestyleAssessment({ onComplete }: LifestyleAssessmentProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<LifestyleFactors>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      onComplete(formData as LifestyleFactors);
      setLoading(false);
    }, 500);
  };

  const updateField = (field: keyof LifestyleFactors, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifestyle Assessment</CardTitle>
        <CardDescription>
          Tell us about your daily habits and lifestyle patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diet">Diet Type</Label>
              <Select onValueChange={(value) => updateField('diet', value)} required>
                <SelectTrigger id="diet">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealTiming">Meal Timing</Label>
              <Select onValueChange={(value) => updateField('mealTiming', value)} required>
                <SelectTrigger id="mealTiming">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular (same time daily)</SelectItem>
                  <SelectItem value="irregular">Irregular/Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="water">Water Intake</Label>
              <Select onValueChange={(value) => updateField('waterIntake', value)} required>
                <SelectTrigger id="water">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (less than 4 glasses)</SelectItem>
                  <SelectItem value="moderate">Moderate (4-6 glasses)</SelectItem>
                  <SelectItem value="high">High (more than 6 glasses)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleepHours">Sleep Hours (per night)</Label>
              <Input
                id="sleepHours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                required
                onChange={(e) => updateField('sleepHours', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exerciseMin">Exercise (minutes per day)</Label>
              <Input
                id="exerciseMin"
                type="number"
                min="0"
                max="300"
                required
                onChange={(e) => updateField('exerciseMinutes', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stressMgmt">Stress Management Practice</Label>
              <Select onValueChange={(value) => updateField('stressManagement', value)} required>
                <SelectTrigger id="stressMgmt">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="meditation">Meditation</SelectItem>
                  <SelectItem value="other">Other activities</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenTime">Screen Time (hours per day)</Label>
              <Input
                id="screenTime"
                type="number"
                min="0"
                max="24"
                step="0.5"
                required
                onChange={(e) => updateField('screenTime', parseFloat(e.target.value))}
              />
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
