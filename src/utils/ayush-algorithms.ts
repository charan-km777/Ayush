// AYUSH-based health analytics algorithms

export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface HealthParameters {
  age: number;
  weight: number;
  height: number;
  bodyTemperature: 'cold' | 'neutral' | 'warm';
  digestion: 'irregular' | 'strong' | 'slow';
  sleepPattern: 'light' | 'moderate' | 'deep';
  energyLevel: 'variable' | 'high' | 'steady';
  skinType: 'dry' | 'oily' | 'normal';
  stressLevel: 'high' | 'moderate' | 'low';
  exerciseFrequency: 'daily' | 'weekly' | 'rarely';
}

export interface LifestyleFactors {
  diet: 'vegetarian' | 'non-vegetarian' | 'vegan';
  mealTiming: 'regular' | 'irregular';
  waterIntake: 'low' | 'moderate' | 'high';
  sleepHours: number;
  exerciseMinutes: number;
  stressManagement: 'yoga' | 'meditation' | 'none' | 'other';
  screenTime: number;
}

export interface DiseasePrediction {
  disease: string;
  probability: number;
  severity: 'low' | 'moderate' | 'high';
  ayushSystem: string;
  recommendations: string[];
}

// Calculate Dosha profile based on health parameters
export function calculateDoshaProfile(params: HealthParameters): DoshaScores {
  let vata = 0, pitta = 0, kapha = 0;

  // Body temperature influence
  if (params.bodyTemperature === 'cold') vata += 2;
  if (params.bodyTemperature === 'warm') pitta += 2;
  if (params.bodyTemperature === 'neutral') kapha += 1;

  // Digestion patterns
  if (params.digestion === 'irregular') vata += 3;
  if (params.digestion === 'strong') pitta += 3;
  if (params.digestion === 'slow') kapha += 3;

  // Sleep patterns
  if (params.sleepPattern === 'light') vata += 2;
  if (params.sleepPattern === 'moderate') pitta += 2;
  if (params.sleepPattern === 'deep') kapha += 2;

  // Energy levels
  if (params.energyLevel === 'variable') vata += 2;
  if (params.energyLevel === 'high') pitta += 2;
  if (params.energyLevel === 'steady') kapha += 2;

  // Skin type
  if (params.skinType === 'dry') vata += 2;
  if (params.skinType === 'oily') pitta += 2;
  if (params.skinType === 'normal') kapha += 1;

  // Stress response
  if (params.stressLevel === 'high') vata += 2;
  if (params.stressLevel === 'moderate') pitta += 1;
  if (params.stressLevel === 'low') kapha += 1;

  // Normalize scores to percentages
  const total = vata + pitta + kapha;
  return {
    vata: Math.round((vata / total) * 100),
    pitta: Math.round((pitta / total) * 100),
    kapha: Math.round((kapha / total) * 100),
  };
}

// Predict diseases based on dosha imbalance and lifestyle
export function predictDiseases(
  doshaScores: DoshaScores,
  lifestyle: LifestyleFactors,
  params: HealthParameters
): DiseasePrediction[] {
  const predictions: DiseasePrediction[] = [];
  const bmi = params.weight / Math.pow(params.height / 100, 2);

  // Vata-related conditions
  if (doshaScores.vata > 40) {
    if (params.stressLevel === 'high' && lifestyle.sleepHours < 6) {
      predictions.push({
        disease: 'Anxiety & Sleep Disorders',
        probability: 0.65 + (doshaScores.vata / 200),
        severity: doshaScores.vata > 50 ? 'high' : 'moderate',
        ayushSystem: 'Ayurveda',
        recommendations: [
          'Practice Vata-pacifying yoga (gentle, grounding poses)',
          'Follow regular meal times with warm, cooked foods',
          'Abhyanga (oil massage) with sesame oil',
          'Meditation and pranayama for stress reduction',
          'Ensure 7-8 hours of sleep'
        ]
      });
    }

    if (params.digestion === 'irregular') {
      predictions.push({
        disease: 'Digestive Irregularity (Vishamagni)',
        probability: 0.55 + (doshaScores.vata / 250),
        severity: 'moderate',
        ayushSystem: 'Ayurveda',
        recommendations: [
          'Consume ginger tea before meals',
          'Avoid cold and raw foods',
          'Practice mindful eating',
          'Take Triphala supplement (consult practitioner)'
        ]
      });
    }
  }

  // Pitta-related conditions
  if (doshaScores.pitta > 40) {
    if (params.stressLevel === 'high' && lifestyle.mealTiming === 'irregular') {
      predictions.push({
        disease: 'Hyperacidity & Inflammatory Conditions',
        probability: 0.60 + (doshaScores.pitta / 200),
        severity: doshaScores.pitta > 50 ? 'high' : 'moderate',
        ayushSystem: 'Ayurveda',
        recommendations: [
          'Avoid spicy, fried, and acidic foods',
          'Practice cooling pranayama (Shitali, Sitkari)',
          'Consume cooling foods (cucumber, coconut, coriander)',
          'Avoid excessive sun exposure',
          'Practice stress management techniques'
        ]
      });
    }

    if (params.bodyTemperature === 'warm') {
      predictions.push({
        disease: 'Skin Inflammation & Rashes',
        probability: 0.45 + (doshaScores.pitta / 250),
        severity: 'moderate',
        ayushSystem: 'Ayurveda',
        recommendations: [
          'Apply cooling herbs like neem and aloe vera',
          'Avoid hot and spicy foods',
          'Practice yoga in cooler hours',
          'Stay hydrated with room temperature water'
        ]
      });
    }
  }

  // Kapha-related conditions
  if (doshaScores.kapha > 40) {
    if (bmi > 25 && lifestyle.exerciseFrequency === 'rarely') {
      predictions.push({
        disease: 'Metabolic Syndrome Risk',
        probability: 0.55 + (doshaScores.kapha / 200) + ((bmi - 25) / 50),
        severity: bmi > 30 ? 'high' : 'moderate',
        ayushSystem: 'Ayurveda & Yoga',
        recommendations: [
          'Daily exercise (minimum 30 minutes)',
          'Avoid heavy, oily, and sweet foods',
          'Practice vigorous yoga styles (Surya Namaskar)',
          'Consume warm water with honey and lemon',
          'Include more vegetables and reduce dairy'
        ]
      });
    }

    if (params.digestion === 'slow' && lifestyle.waterIntake === 'low') {
      predictions.push({
        disease: 'Sluggish Digestion & Water Retention',
        probability: 0.50 + (doshaScores.kapha / 250),
        severity: 'moderate',
        ayushSystem: 'Ayurveda & Naturopathy',
        recommendations: [
          'Increase water intake (warm water preferred)',
          'Consume light, warm meals',
          'Practice Kapalabhati pranayama',
          'Add ginger, black pepper to diet',
          'Avoid sleeping during day'
        ]
      });
    }
  }

  // Lifestyle-based predictions (applying principles from multiple systems)
  if (lifestyle.screenTime > 8 && params.stressLevel === 'high') {
    predictions.push({
      disease: 'Digital Eye Strain & Mental Fatigue',
      probability: 0.70,
      severity: 'moderate',
      ayushSystem: 'Yoga & Naturopathy',
      recommendations: [
        'Practice Trataka (candle gazing) for eye health',
        'Follow 20-20-20 rule (every 20 min, look 20 feet away for 20 sec)',
        'Eye exercises and palming',
        'Reduce screen time before bed',
        'Use rose water eye drops (natural)'
      ]
    });
  }

  if (lifestyle.sleepHours < 6) {
    predictions.push({
      disease: 'Sleep Deprivation Syndrome',
      probability: 0.75,
      severity: lifestyle.sleepHours < 5 ? 'high' : 'moderate',
      ayushSystem: 'Ayurveda & Yoga',
      recommendations: [
        'Establish consistent sleep schedule',
        'Practice Yoga Nidra before bed',
        'Avoid caffeine after 3 PM',
        'Create dark, cool sleeping environment',
        'Massage feet with warm oil before sleep'
      ]
    });
  }

  if (lifestyle.stressManagement === 'none' && params.stressLevel === 'high') {
    predictions.push({
      disease: 'Chronic Stress & Burnout Risk',
      probability: 0.68,
      severity: 'high',
      ayushSystem: 'Yoga & Ayurveda',
      recommendations: [
        'Start daily meditation practice (10-15 minutes)',
        'Practice pranayama (Anulom Vilom, Bhramari)',
        'Consider Ashwagandha supplementation (consult practitioner)',
        'Regular yoga practice',
        'Maintain work-life balance'
      ]
    });
  }

  // Homeopathic considerations for recurring issues
  if (params.energyLevel === 'variable' && doshaScores.vata > 35) {
    predictions.push({
      disease: 'Constitutional Weakness',
      probability: 0.50,
      severity: 'low',
      ayushSystem: 'Homeopathy & Ayurveda',
      recommendations: [
        'Constitutional homeopathic remedy (consult homeopath)',
        'Regular meal times',
        'Adequate rest and recovery',
        'Avoid over-exertion',
        'Consider Chyawanprash for immunity'
      ]
    });
  }

  return predictions.sort((a, b) => b.probability - a.probability);
}

// Calculate lifestyle risk score
export function calculateLifestyleRisk(
  lifestyle: LifestyleFactors,
  params: HealthParameters
): {
  overallRisk: number;
  riskFactors: Array<{ factor: string; impact: string; score: number }>;
} {
  const riskFactors: Array<{ factor: string; impact: string; score: number }> = [];
  let totalRisk = 0;

  // Sleep risk
  const sleepRisk = Math.max(0, (7 - lifestyle.sleepHours) * 10);
  if (sleepRisk > 0) {
    riskFactors.push({
      factor: 'Inadequate Sleep',
      impact: sleepRisk > 20 ? 'High impact on health' : 'Moderate impact',
      score: sleepRisk
    });
    totalRisk += sleepRisk;
  }

  // Exercise risk
  const exerciseRisk = lifestyle.exerciseFrequency === 'daily' ? 0 :
                        lifestyle.exerciseFrequency === 'weekly' ? 15 : 30;
  if (exerciseRisk > 0) {
    riskFactors.push({
      factor: 'Low Physical Activity',
      impact: exerciseRisk > 20 ? 'High impact on metabolism' : 'Moderate impact',
      score: exerciseRisk
    });
    totalRisk += exerciseRisk;
  }

  // Stress management risk
  const stressRisk = lifestyle.stressManagement === 'none' && params.stressLevel === 'high' ? 25 :
                     lifestyle.stressManagement === 'none' ? 15 : 0;
  if (stressRisk > 0) {
    riskFactors.push({
      factor: 'Poor Stress Management',
      impact: 'High impact on mental health',
      score: stressRisk
    });
    totalRisk += stressRisk;
  }

  // Screen time risk
  const screenRisk = Math.min(30, Math.max(0, (lifestyle.screenTime - 8) * 3));
  if (screenRisk > 0) {
    riskFactors.push({
      factor: 'Excessive Screen Time',
      impact: 'Impact on eyes and posture',
      score: screenRisk
    });
    totalRisk += screenRisk;
  }

  // Water intake risk
  const waterRisk = lifestyle.waterIntake === 'low' ? 15 : 0;
  if (waterRisk > 0) {
    riskFactors.push({
      factor: 'Low Water Intake',
      impact: 'Impact on digestion and detoxification',
      score: waterRisk
    });
    totalRisk += waterRisk;
  }

  // Meal timing risk
  const mealRisk = lifestyle.mealTiming === 'irregular' ? 20 : 0;
  if (mealRisk > 0) {
    riskFactors.push({
      factor: 'Irregular Meal Times',
      impact: 'Impact on digestion and metabolism',
      score: mealRisk
    });
    totalRisk += mealRisk;
  }

  return {
    overallRisk: Math.min(100, totalRisk),
    riskFactors: riskFactors.sort((a, b) => b.score - a.score)
  };
}

// Get dominant dosha
export function getDominantDosha(scores: DoshaScores): string {
  const max = Math.max(scores.vata, scores.pitta, scores.kapha);
  if (scores.vata === max) return 'Vata';
  if (scores.pitta === max) return 'Pitta';
  return 'Kapha';
}

// Get dosha description
export function getDoshaDescription(dosha: string): string {
  const descriptions: Record<string, string> = {
    Vata: 'Vata governs movement, creativity, and communication. When balanced: energetic, creative, adaptable. When imbalanced: anxious, restless, irregular digestion.',
    Pitta: 'Pitta governs metabolism, digestion, and transformation. When balanced: intelligent, focused, warm. When imbalanced: irritable, inflammatory conditions, hyperacidity.',
    Kapha: 'Kapha governs structure, stability, and lubrication. When balanced: calm, strong, nurturing. When imbalanced: sluggish, weight gain, congestion.'
  };
  return descriptions[dosha] || '';
}
