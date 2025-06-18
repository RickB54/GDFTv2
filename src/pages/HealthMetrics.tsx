
import React, { useState, useEffect } from "react";
import { Heart, Plus, Trash, Edit, ArrowLeft, Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkout } from "@/contexts/WorkoutContext";
import { HealthMetric } from "@/contexts/WorkoutContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import ExerciseNotesModal from "@/components/ui/ExerciseNotesModal";

const HealthMetrics = () => {
  const navigate = useNavigate();
  const { addHealthMetric, getHealthMetrics, updateHealthMetric, deleteHealthMetric, workouts } = useWorkout();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeNotes, setActiveNotes] = useState("");
  
  const [formData, setFormData] = useState<Omit<HealthMetric, "id">>({
    date: new Date().toISOString().split("T")[0],
    heartRate: undefined,
    caloriesBurned: undefined,
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
    glucose: undefined,
    notes: "",
    workoutId: undefined
  });
  
  const [bodyMeasurements, setBodyMeasurements] = useState(() => {
    const saved = localStorage.getItem('bodyMeasurements');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    setMetrics(getHealthMetrics());
  }, [getHealthMetrics]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : value === "" ? undefined : Number(value)
    }));
  };
  
  const handleSubmit = () => {
    if (!formData.date) {
      toast.error("Date is required");
      return;
    }
    
    if (editingMetric) {
      updateHealthMetric(editingMetric, formData);
      setEditingMetric(null);
    } else {
      addHealthMetric(formData);
    }
    
    setFormData({
      date: new Date().toISOString().split("T")[0],
      heartRate: undefined,
      caloriesBurned: undefined,
      bloodPressureSystolic: undefined,
      bloodPressureDiastolic: undefined,
      glucose: undefined,
      notes: "",
      workoutId: undefined
    });
    
    setShowForm(false);
  };
  
  const handleEdit = (metric: HealthMetric) => {
    setFormData({
      date: metric.date,
      heartRate: metric.heartRate,
      caloriesBurned: metric.caloriesBurned,
      bloodPressureSystolic: metric.bloodPressureSystolic,
      bloodPressureDiastolic: metric.bloodPressureDiastolic,
      glucose: metric.glucose,
      notes: metric.notes || "",
      workoutId: metric.workoutId
    });
    
    setEditingMetric(metric.id);
    setShowForm(true);
  };
  
  const handleViewNotes = (notes: string) => {
    setActiveNotes(notes);
    setShowNotesModal(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this metric?")) {
      deleteHealthMetric(id);
      setMetrics(getHealthMetrics());
    }
  };
  
  // Get workout name by ID
  const getWorkoutName = (workoutId: string | undefined) => {
    if (!workoutId) return "";
    const workout = workouts.find(w => w.id === workoutId);
    return workout ? workout.name : "";
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="page-container page-transition pb-24">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Health Metrics</h1>
      </div>

      <ExerciseNotesModal 
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        notes={activeNotes}
      />
      
      {/* Add Metric Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Health Metric
        </Button>
      </div>
      
      {/* Metrics Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Health Metrics</h2>
        
        {metrics.length === 0 && !showForm ? (
          <div className="card-glass p-8 flex flex-col items-center justify-center">
            <Activity className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No health metrics recorded yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record First Health Metric
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(metric => (
                <div key={metric.id} className="card-glass p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <Activity className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium">{formatDate(metric.date)}</h3>
                      </div>
                      {metric.workoutId && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Workout: {getWorkoutName(metric.workoutId)}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {metric.notes && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewNotes(metric.notes || "")}
                          title="View Notes"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(metric)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(metric.id)}
                      >
                        <Trash className="h-4 w-4 text-gym-red" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {metric.heartRate !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground">Heart Rate</p>
                        <p>{metric.heartRate} bpm</p>
                      </div>
                    )}
                    
                    {metric.caloriesBurned !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground">Calories Burned</p>
                        <p>{metric.caloriesBurned} kcal</p>
                      </div>
                    )}
                    
                    {(metric.bloodPressureSystolic !== undefined && metric.bloodPressureDiastolic !== undefined) && (
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Pressure</p>
                        <p>{metric.bloodPressureSystolic}/{metric.bloodPressureDiastolic} mmHg</p>
                      </div>
                    )}
                    
                    {metric.glucose !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Glucose</p>
                        <p>{metric.glucose} mg/dL</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      
      {/* Body Measurements Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Body Measurements</h2>
        
        {bodyMeasurements.length === 0 ? (
          <div className="card-glass p-8 flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-2">No body measurements recorded</p>
            <Button 
              onClick={() => navigate('/stats')}
              variant="outline"
            >
              Add Body Measurement
            </Button>
          </div>
        ) : (
          <div className="card-glass p-4 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Weight</th>
                  <th className="text-left p-2">Height</th>
                  <th className="text-left p-2">Chest</th>
                  <th className="text-left p-2">Waist</th>
                  <th className="text-left p-2">Hips</th>
                  <th className="text-left p-2">Biceps</th>
                  <th className="text-left p-2">Thighs</th>
                </tr>
              </thead>
              <tbody>
                {bodyMeasurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m) => (
                  <tr key={m.id} className="border-b border-gray-700">
                    <td className="p-2">{m.date}</td>
                    <td className="p-2">{m.weight ? `${m.weight} lbs` : '-'}</td>
                    <td className="p-2">{m.height ? `${m.height} in` : '-'}</td>
                    <td className="p-2">{m.chest ? `${m.chest} in` : '-'}</td>
                    <td className="p-2">{m.waist ? `${m.waist} in` : '-'}</td>
                    <td className="p-2">{m.hips ? `${m.hips} in` : '-'}</td>
                    <td className="p-2">{m.biceps ? `${m.biceps} in` : '-'}</td>
                    <td className="p-2">{m.thighs ? `${m.thighs} in` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add/Edit Metric Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {editingMetric ? "Edit Health Metric" : "Add Health Metric"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label>Associated Workout (Optional)</Label>
                <select
                  name="workoutId"
                  value={formData.workoutId || ""}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">None</option>
                  {workouts.map(workout => (
                    <option key={workout.id} value={workout.id}>
                      {workout.name} ({new Date(workout.startTime).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Heart Rate (bpm)</Label>
                <Input 
                  type="number" 
                  name="heartRate"
                  placeholder="Heart rate in beats per minute"
                  value={formData.heartRate || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label>Calories Burned</Label>
                <Input 
                  type="number" 
                  name="caloriesBurned"
                  placeholder="Calories burned in kcal"
                  value={formData.caloriesBurned || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Pressure (Systolic)</Label>
                  <Input 
                    type="number" 
                    name="bloodPressureSystolic"
                    placeholder="Systolic (top number)"
                    value={formData.bloodPressureSystolic || ""}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label>Blood Pressure (Diastolic)</Label>
                  <Input 
                    type="number" 
                    name="bloodPressureDiastolic"
                    placeholder="Diastolic (bottom number)"
                    value={formData.bloodPressureDiastolic || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <Label>Blood Glucose (mg/dL)</Label>
                <Input 
                  type="number" 
                  name="glucose"
                  placeholder="Blood glucose level"
                  value={formData.glucose || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea 
                  name="notes"
                  placeholder="Additional notes about your health metrics"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setEditingMetric(null);
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    heartRate: undefined,
                    caloriesBurned: undefined,
                    bloodPressureSystolic: undefined,
                    bloodPressureDiastolic: undefined,
                    glucose: undefined,
                    notes: "",
                    workoutId: undefined
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmit}
              >
                {editingMetric ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMetrics;
