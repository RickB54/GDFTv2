
import React, { useState, useEffect } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { HealthMetric } from '@/contexts/WorkoutContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// TODO: Verify the correct path for DatePicker or implement/install it
// import { DatePicker } from '@/components/ui/date-picker'; 
import { v4 as uuidv4 } from 'uuid'; // uuid is used by addHealthMetric in context, not directly here if context handles it
import { format } from 'date-fns';

// A simple DatePicker placeholder if the actual component is missing
const DatePickerPlaceholder = ({ date, onDateChange }: { date: Date, onDateChange: (date: Date) => void }) => (
  <Input 
    type="date" 
    value={format(date, 'yyyy-MM-dd')} 
    onChange={(e) => onDateChange(new Date(e.target.value))} 
  />
);

const HealthMetricsPage: React.FC = () => {
  const { healthMetrics, addHealthMetric, updateHealthMetric } = useWorkout();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMetric, setCurrentMetric] = useState<HealthMetric | null>(null);

  // State names updated to match HealthMetric interface in WorkoutContext.tsx
  const [sleepDurationHours, setSleepDurationHours] = useState<number | string>('');
  const [sleepQualityRating, setSleepQualityRating] = useState<number | string>(''); // Assuming rating is numeric e.g. 1-5
  const [waterIntakeMl, setWaterIntakeMl] = useState<number | string>('');
  const [stressLevelRating, setStressLevelRating] = useState<number | string>(''); // Assuming rating is numeric e.g. 1-5
  const [stepsTaken, setStepsTaken] = useState<number | string>('');
  const [notes, setNotes] = useState<string>('');
  // Removed sleepNotes and stressNotes for simplicity, can be added back if needed

  useEffect(() => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const existingMetric = healthMetrics.find(hm => hm.date === formattedDate);
    if (existingMetric) {
      setCurrentMetric(existingMetric);
      setSleepDurationHours(existingMetric.sleepDurationHours || '');
      setSleepQualityRating(existingMetric.sleepQualityRating || '');
      setWaterIntakeMl(existingMetric.waterIntakeMl || '');
      setStressLevelRating(existingMetric.stressLevelRating || '');
      setStepsTaken(existingMetric.stepsTaken || '');
      setNotes(existingMetric.notes || '');
    } else {
      setCurrentMetric(null);
      setSleepDurationHours('');
      setSleepQualityRating('');
      setWaterIntakeMl('');
      setStressLevelRating('');
      setStepsTaken('');
      setNotes('');
    }
  }, [selectedDate, healthMetrics]);

  const handleSave = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    // Ensure property names match HealthMetric interface
    const metricData: Omit<HealthMetric, 'id' | 'workoutId'> = { // workoutId is also optional and not handled here
      date: formattedDate,
      sleepDurationHours: Number(sleepDurationHours) || undefined,
      sleepQualityRating: Number(sleepQualityRating) || undefined,
      waterIntakeMl: Number(waterIntakeMl) || undefined,
      stressLevelRating: Number(stressLevelRating) || undefined,
      stepsTaken: Number(stepsTaken) || undefined,
      notes: notes || undefined,
    };

    if (currentMetric && currentMetric.id) {
      // Pass id and the metricData separately
      updateHealthMetric(currentMetric.id, metricData as Partial<HealthMetric>); 
    } else {
      // addHealthMetric in context should handle ID generation
      addHealthMetric(metricData as Omit<HealthMetric, 'id'>);
    }
    // Optionally, provide user feedback (e.g., toast notification)
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Health Metrics</h1>
      <div className="mb-4">
        <label htmlFor="metric-date" className="block text-sm font-medium mb-1">Date</label>
        {/* Using placeholder, replace with your actual DatePicker if available */}
        <DatePickerPlaceholder date={selectedDate} onDateChange={setSelectedDate} /> 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="sleep-duration" className="block text-sm font-medium mb-1">Sleep Duration (hours)</label>
          <Input id="sleep-duration" type="number" value={sleepDurationHours} onChange={(e) => setSleepDurationHours(e.target.value)} placeholder="e.g., 7.5" />
        </div>
        <div>
          <label htmlFor="sleep-quality" className="block text-sm font-medium mb-1">Sleep Quality (1-5)</label>
          <Input id="sleep-quality" type="number" value={sleepQualityRating} onChange={(e) => setSleepQualityRating(e.target.value)} placeholder="e.g., 4" />
        </div>
        <div>
          <label htmlFor="water-intake" className="block text-sm font-medium mb-1">Water Intake (ml)</label>
          <Input id="water-intake" type="number" value={waterIntakeMl} onChange={(e) => setWaterIntakeMl(e.target.value)} placeholder="e.g., 2000" />
        </div>
        <div>
          <label htmlFor="stress-level" className="block text-sm font-medium mb-1">Stress Level (1-5)</label>
          <Input id="stress-level" type="number" value={stressLevelRating} onChange={(e) => setStressLevelRating(e.target.value)} placeholder="e.g., 2" />
        </div>
        <div>
          <label htmlFor="daily-steps" className="block text-sm font-medium mb-1">Daily Steps</label>
          <Input id="daily-steps" type="number" value={stepsTaken} onChange={(e) => setStepsTaken(e.target.value)} placeholder="e.g., 10000" />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." />
      </div>

      <Button onClick={handleSave}>Save Metrics</Button>
    </div>
  );
};

export default HealthMetricsPage; 
// In App.tsx, ensure you are importing 'HealthMetrics' if the filename is HealthMetrics.tsx
// e.g., import HealthMetrics from './pages/HealthMetrics';
// And the route is: <Route path="/health-metrics" element={<HealthMetrics />} />
