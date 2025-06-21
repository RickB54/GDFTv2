import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWorkout, HealthMetric } from '@/contexts/WorkoutContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming you have a Select component

// Helper function for BMI Calculation (example)
const calculateBmi = (weightKg?: number, heightM?: number): number | null => {
  if (weightKg && heightM && heightM > 0) {
    return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  }
  return null;
};

const NewHealthMetricsPage: React.FC = () => {
  const { healthMetrics, addHealthMetric, updateHealthMetric } = useWorkout();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMetricId, setCurrentMetricId] = useState<string | null>(null);

  // BMI Calculator States
  const [bmiAge, setBmiAge] = useState<string>(''); // Age might not be directly used in standard BMI, but often collected
  const [bmiHeight, setBmiHeight] = useState<string>('');
  const [bmiWeight, setBmiWeight] = useState<string>('');
  const [bmiHeightUnit, setBmiHeightUnit] = useState<'cm' | 'in'>('cm');
  const [bmiWeightUnit, setBmiWeightUnit] = useState<'kg' | 'lb'>('kg');

  // Existing states
  const [sleepDurationHours, setSleepDurationHours] = useState<string>('');
  const [sleepQualityRating, setSleepQualityRating] = useState<string>('');
  const [waterIntakeMl, setWaterIntakeMl] = useState<string>('');
  const [waterIntakeUnit, setWaterIntakeUnit] = useState<'ml' | 'fl oz'>('ml');
  const [stressLevelRating, setStressLevelRating] = useState<string>('');
  const [stepsTaken, setStepsTaken] = useState<string>('');
  
  // New states for additional metrics
  const [heartRate, setHeartRate] = useState<string>('');
  const [caloriesBurned, setCaloriesBurned] = useState<string>('');
  const [calorieIntake, setCalorieIntake] = useState<string>(''); // New
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  const [glucoseUnit, setGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  
  const [notes, setNotes] = useState<string>('');

  const calculatedBmi = useMemo(() => {
    const weightNum = parseFloat(bmiWeight);
    const heightNum = parseFloat(bmiHeight);
    let weightInKg: number | undefined = weightNum;
    let heightInM: number | undefined = heightNum;

    if (isNaN(weightNum) || isNaN(heightNum)) return null;

    if (bmiWeightUnit === 'lb') {
      weightInKg = weightNum * 0.453592;
    }
    if (bmiHeightUnit === 'cm') {
      heightInM = heightNum / 100;
    } else if (bmiHeightUnit === 'in') {
      heightInM = heightNum * 0.0254;
    }
    return calculateBmi(weightInKg, heightInM);
  }, [bmiWeight, bmiHeight, bmiWeightUnit, bmiHeightUnit]);

  const resetForm = useCallback(() => {
    setSleepDurationHours('');
    setSleepQualityRating('');
    setWaterIntakeMl('');
    setStressLevelRating('');
    setStepsTaken('');
    setHeartRate('');
    setCaloriesBurned('');
    setCalorieIntake('');
    setBloodPressureSystolic('');
    setBloodPressureDiastolic('');
    setGlucose('');
    setNotes('');
    setCurrentMetricId(null);
    // Reset BMI fields too if desired, or keep them for continuous calculation
    // setBmiAge('');
    // setBmiHeight('');
    // setBmiWeight('');
  }, []);

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const existingMetric = healthMetrics.find(hm => hm.date === dateString);

    if (existingMetric) {
      setSleepDurationHours(existingMetric.sleepDurationHours?.toString() || '');
      setSleepQualityRating(existingMetric.sleepQualityRating?.toString() || '');
      setWaterIntakeMl(existingMetric.waterIntakeMl?.toString() || ''); // Assuming stored in ml
      setStressLevelRating(existingMetric.stressLevelRating?.toString() || '');
      setStepsTaken(existingMetric.stepsTaken?.toString() || '');
      setHeartRate(existingMetric.heartRate?.toString() || '');
      setCaloriesBurned(existingMetric.caloriesBurned?.toString() || '');
      setCalorieIntake(existingMetric.calorieIntake?.toString() || ''); // New
      setBloodPressureSystolic(existingMetric.bloodPressureSystolic?.toString() || '');
      setBloodPressureDiastolic(existingMetric.bloodPressureDiastolic?.toString() || '');
      setGlucose(existingMetric.glucose?.toString() || ''); // Assuming stored in mg/dL
      setNotes(existingMetric.notes || '');
      setCurrentMetricId(existingMetric.id);
      // Note: Unit preferences might need to be loaded if they are stored per metric entry
    } else {
      resetForm();
    }
  }, [selectedDate, healthMetrics, resetForm]);

  const handleSave = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    
    let waterIntakeFinal = waterIntakeMl ? parseInt(waterIntakeMl) : undefined;
    if (waterIntakeUnit === 'fl oz' && waterIntakeFinal) {
      waterIntakeFinal = Math.round(waterIntakeFinal * 29.5735); // to ml
    }

    let glucoseFinal = glucose ? parseFloat(glucose) : undefined;
    if (glucoseUnit === 'mmol/L' && glucoseFinal) {
        glucoseFinal = Math.round(glucoseFinal * 18.0182); // to mg/dL
    }

    const metricData: Omit<HealthMetric, 'id'> = {
      date: dateString,
      sleepDurationHours: sleepDurationHours ? parseFloat(sleepDurationHours) : undefined,
      sleepQualityRating: sleepQualityRating ? parseInt(sleepQualityRating) : undefined,
      waterIntakeMl: waterIntakeFinal,
      stressLevelRating: stressLevelRating ? parseInt(stressLevelRating) : undefined,
      stepsTaken: stepsTaken ? parseInt(stepsTaken) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
      calorieIntake: calorieIntake ? parseInt(calorieIntake) : undefined, // New
      bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : undefined,
      glucose: glucoseFinal, 
      notes: notes,
    };

    if (currentMetricId) {
      updateHealthMetric(currentMetricId, metricData);
    } else {
      addHealthMetric(metricData);
    }
    alert('Health metrics saved!');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Comprehensive Health Metrics</h1>
      
      {/* BMI Calculator Section */}
      <div className="bg-gym-card p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">BMI Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="bmi-age">Age (Years)</Label>
            <Input id="bmi-age" type="number" value={bmiAge} onChange={(e) => setBmiAge(e.target.value)} placeholder="e.g., 30" />
          </div>
          <div>
            <Label htmlFor="bmi-height">Height</Label>
            <div className="flex gap-2">
              <Input id="bmi-height" type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} placeholder="e.g., 170" className="flex-grow" />
              <Select value={bmiHeightUnit} onValueChange={(value: 'cm' | 'in') => setBmiHeightUnit(value)}>
                <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="bmi-weight">Weight</Label>
            <div className="flex gap-2">
              <Input id="bmi-weight" type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} placeholder="e.g., 70" className="flex-grow" />
              <Select value={bmiWeightUnit} onValueChange={(value: 'kg' | 'lb') => setBmiWeightUnit(value)}>
                <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {calculatedBmi !== null && (
          <div className="mt-3 text-lg font-semibold">
            Calculated BMI: <span className="text-blue-400">{calculatedBmi}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="metric-date">Date</Label>
        <Input 
          type="date" 
          id="metric-date"
          value={selectedDate.toISOString().split('T')[0]} 
          onChange={(e) => setSelectedDate(new Date(e.target.value))} 
          className="w-full p-2 border rounded bg-gym-input text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="sleep-duration">Sleep Duration (hours)</Label>
          <Input id="sleep-duration" type="number" value={sleepDurationHours} onChange={(e) => setSleepDurationHours(e.target.value)} placeholder="e.g., 7.5" />
        </div>
        <div>
          <Label htmlFor="sleep-quality">Sleep Quality (1-5)</Label>
          <Input id="sleep-quality" type="number" value={sleepQualityRating} onChange={(e) => setSleepQualityRating(e.target.value)} placeholder="1 (Poor) - 5 (Excellent)" min="1" max="5" />
        </div>
        <div>
          <Label htmlFor="water-intake">Water Intake</Label>
          <div className="flex gap-2">
            <Input id="water-intake" type="number" value={waterIntakeMl} onChange={(e) => setWaterIntakeMl(e.target.value)} placeholder="e.g., 2000" className="flex-grow" />
            <Select value={waterIntakeUnit} onValueChange={(value: 'ml' | 'fl oz') => setWaterIntakeUnit(value)}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="fl oz">fl oz</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="stress-level">Stress Level (1-5)</Label>
          <Input id="stress-level" type="number" value={stressLevelRating} onChange={(e) => setStressLevelRating(e.target.value)} placeholder="1 (Low) - 5 (High)" min="1" max="5" />
        </div>
        <div>
          <Label htmlFor="steps-taken">Daily Steps</Label>
          <Input id="steps-taken" type="number" value={stepsTaken} onChange={(e) => setStepsTaken(e.target.value)} placeholder="e.g., 10000" />
        </div>
        <div>
          <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
          <Input id="heart-rate" type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="e.g., 60" />
        </div>
        <div>
          <Label htmlFor="calories-burned">Calories Burned (kcal)</Label>
          <Input id="calories-burned" type="number" value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} placeholder="e.g., 500" />
        </div>
        <div>
          <Label htmlFor="calorie-intake">Calorie Intake (kcal)</Label>
          <Input id="calorie-intake" type="number" value={calorieIntake} onChange={(e) => setCalorieIntake(e.target.value)} placeholder="e.g., 2000" />
        </div>
        <div>
          <Label htmlFor="bp-systolic">Blood Pressure (Systolic mmHg)</Label>
          <Input id="bp-systolic" type="number" value={bloodPressureSystolic} onChange={(e) => setBloodPressureSystolic(e.target.value)} placeholder="e.g., 120" />
        </div>
        <div>
          <Label htmlFor="bp-diastolic">Blood Pressure (Diastolic mmHg)</Label>
          <Input id="bp-diastolic" type="number" value={bloodPressureDiastolic} onChange={(e) => setBloodPressureDiastolic(e.target.value)} placeholder="e.g., 80" />
        </div>
        <div>
          <Label htmlFor="glucose">Glucose</Label>
          <div className="flex gap-2">
            <Input id="glucose" type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} placeholder="e.g., 90" className="flex-grow" />
            <Select value={glucoseUnit} onValueChange={(value: 'mg/dL' | 'mmol/L') => setGlucoseUnit(value)}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg/dL">mg/dL</SelectItem>
                  <SelectItem value="mmol/L">mmol/L</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="notes">General Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional health notes for the day..." />
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto">Save Health Metrics</Button>
    </div>
  );
};

export default NewHealthMetricsPage;