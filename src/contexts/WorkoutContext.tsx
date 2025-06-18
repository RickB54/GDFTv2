import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Workout,
  WorkoutSet,
  getWorkouts,
  saveWorkouts,
  generateId,
  ExerciseCategory,
  getSavedWorkoutTemplates,
  saveSavedWorkoutTemplates
} from "@/lib/data";
import { toast } from "sonner";

export interface SavedWorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  type: ExerciseCategory | "Custom";
  createdAt: number;
  workoutPlanOverrides?: WorkoutPlanOverride[];
}

export interface HealthMetric {
  id: string;
  workoutId?: string;
  date: string;
  heartRate?: number;
  caloriesBurned?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  glucose?: number;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  lats?: number;
  upperBack?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  triceps?: number;
  forearms?: number;
  thighs?: number;
  calves?: number;
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  name: string;
  category?: string;
  // Weights
  sets?: string;
  reps?: string;
  weight?: string;
  // Cardio
  distance?: string;
  time?: string;
  incline?: string;
}

export interface PlanDay {
  id: string;
  name: string;
  exercises: PlanExercise[];
}

export interface CustomPlan {
  id: string;
  name: string;
  days: PlanDay[];
  createdAt: number;
}

export interface WorkoutPlanOverride {
  exerciseId: string;
  sets?: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  incline?: string;
}

interface WorkoutContextType {
  workouts: Workout[];
  currentWorkout: Workout | null;
  savedWorkoutTemplates: SavedWorkoutTemplate[];
  customPlans: CustomPlan[];
  bodyMeasurements: BodyMeasurement[];
  healthMetrics: HealthMetric[];
  startWorkout: (type: string, exerciseIds: string[], planOverrides?: WorkoutPlanOverride[]) => void;
  startSavedWorkout: (templateId: string) => void;
  endWorkout: () => void;
  cancelWorkout: () => void;
  addSet: (exerciseId: string, previousSet?: WorkoutSet | null, exerciseSettings?: any) => string | null | undefined;
  completeSet: (setId: string) => void;
  skipSet: (setId: string) => void;
  updateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  updateWorkout: (updatedWorkout: any) => void;
  getWorkoutStats: () => {
    totalWorkouts: number;
    totalTime: number;
    totalSets: number;
    totalReps: number;
  };
  navigateToExercise: (exerciseId: string) => void;
  currentExerciseIndex: number;
  navigateToNextExercise: () => void;
  navigateToPreviousExercise: () => void;
  saveCustomWorkout: (name: string) => void;
  saveWorkoutTemplate: (name: string, exerciseIds: string[], type: ExerciseCategory | "Custom") => void;
  deleteSavedWorkout: (templateId: string) => void;
  deleteWorkout: (workoutId: string) => void;
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, "id">) => void;
  updateBodyMeasurement: (id: string, updates: Partial<BodyMeasurement>) => void;
  deleteBodyMeasurement: (id: string) => void;
  getBodyMeasurements: () => BodyMeasurement[];
  addHealthMetric: (metric: Omit<HealthMetric, "id">) => void;
  updateHealthMetric: (id: string, updates: Partial<HealthMetric>) => void;
  deleteHealthMetric: (id: string) => void;
  getHealthMetrics: () => HealthMetric[];
  saveCustomPlan: (plan: Omit<CustomPlan, "id" | "createdAt">) => void;
  updateCustomPlan: (planId: string, updates: Partial<CustomPlan>) => void;
  deleteCustomPlan: (planId: string) => void;
  getCustomPlans: () => CustomPlan[];
  deleteStatsData: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [savedWorkoutTemplates, setSavedWorkoutTemplates] = useState<SavedWorkoutTemplate[]>([]);
  const [workoutPlanOverrides, setWorkoutPlanOverrides] = useState<WorkoutPlanOverride[] | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(() => {
    const saved = localStorage.getItem('bodyMeasurements');
    return saved ? JSON.parse(saved) : [];
  });
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(() => {
    const saved = localStorage.getItem('healthMetrics');
    return saved ? JSON.parse(saved) : [];
  });
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>(() => {
    const saved = localStorage.getItem('customPlans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadedWorkouts = getWorkouts();
    setWorkouts(loadedWorkouts);
    
    const loadedTemplates = getSavedWorkoutTemplates();
    setSavedWorkoutTemplates(loadedTemplates);
  }, []);

  useEffect(() => {
    localStorage.setItem('bodyMeasurements', JSON.stringify(bodyMeasurements));
  }, [bodyMeasurements]);

  useEffect(() => {
    localStorage.setItem('healthMetrics', JSON.stringify(healthMetrics));
  }, [healthMetrics]);

  useEffect(() => {
    localStorage.setItem('customPlans', JSON.stringify(customPlans));
  }, [customPlans]);

  const startWorkout = (type: string, exerciseIds: string[], planOverrides?: WorkoutPlanOverride[]) => {
    // Filter out any empty exercise IDs
    const validExerciseIds = exerciseIds.filter(id => id && id.trim() !== '');
    
    if (validExerciseIds.length === 0) {
      toast.error("No valid exercises selected");
      return null;
    }

    // If there's a current workout, just replace it silently without triggering completion
    if (currentWorkout) {
      setCurrentWorkout(null);
    }

    const workout: Workout = {
      id: generateId(),
      name: type === "Custom" ? "Custom Workout" : `${type} Workout`,
      exercises: validExerciseIds,
      sets: [],
      startTime: Date.now(),
      type: type as ExerciseCategory | "Custom",
    };

    setCurrentWorkout(workout);
    setWorkoutPlanOverrides(planOverrides || null);
    setCurrentExerciseIndex(0);
    toast.success("Workout started");
    return workout;
  };

  const startSavedWorkout = (templateId: string) => {
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    if (template) {
      console.log("Starting saved workout template:", template);
      const validExercises = template.exercises.filter(id => id && id.trim() !== '');
      
      if (validExercises.length === 0) {
        toast.error("This saved workout has no valid exercises");
        return;
      }
      
      const workout = startWorkout(template.type, validExercises, template.workoutPlanOverrides);
      if (workout) {
        // Update the workout name to match the template
        setCurrentWorkout(prev => prev ? { ...prev, name: template.name } : null);
        toast.success(`Started ${template.name}`);
      }
    } else {
      toast.error("Saved workout not found");
    }
  };

  const endWorkout = () => {
    if (currentWorkout) {
      const endedWorkout = {
        ...currentWorkout,
        endTime: Date.now(),
        totalTime: Math.floor((Date.now() - currentWorkout.startTime) / 1000),
      };

      setWorkouts((prev) => {
        const updated = [endedWorkout, ...prev];
        saveWorkouts(updated);
        return updated;
      });

      setCurrentWorkout(null);
      setWorkoutPlanOverrides(null);
      toast.success("Workout completed");
    }
  };

  const cancelWorkout = () => {
    if (currentWorkout) {
      setCurrentWorkout(null);
      setWorkoutPlanOverrides(null);
      toast.info("Workout cancelled");
    }
  };

  const addSet = (exerciseId: string, previousSet: WorkoutSet | null = null, exerciseSettings: any = null): string | null | undefined => {
    if (currentWorkout) {
      const newSet: WorkoutSet = {
        id: generateId(),
        exerciseId,
        completed: false,
        timestamp: Date.now(),
      };
      
      const planOverride = workoutPlanOverrides?.find(p => p.exerciseId === exerciseId);

      // Priority order: previousSet values > plan overrides > exerciseSettings > defaults
      if (previousSet) {
        // Use previous set values (user has already made changes in this session)
        if (previousSet.weight !== undefined) newSet.weight = previousSet.weight;
        if (previousSet.reps !== undefined) newSet.reps = previousSet.reps;
        if (previousSet.time !== undefined) newSet.time = previousSet.time;
        if (previousSet.distance !== undefined) newSet.distance = previousSet.distance;
        if (previousSet.incline !== undefined) newSet.incline = previousSet.incline;
        if (previousSet.duration !== undefined) newSet.duration = previousSet.duration;
      } else if (planOverride) {
        // Use plan override values from Custom Plan
        if (planOverride.weight) newSet.weight = Number(planOverride.weight);
        if (planOverride.reps) newSet.reps = Number(planOverride.reps);
        if (planOverride.time) newSet.time = Number(planOverride.time);
        if (planOverride.distance) newSet.distance = Number(planOverride.distance);
        if (planOverride.incline) newSet.incline = Number(planOverride.incline);
      } else if (exerciseSettings) {
        // Use exercise settings for first set
        if (exerciseSettings.weight !== undefined) newSet.weight = exerciseSettings.weight;
        if (exerciseSettings.reps !== undefined) newSet.reps = exerciseSettings.reps;
        if (exerciseSettings.time !== undefined) newSet.time = exerciseSettings.time;
        if (exerciseSettings.distance !== undefined) newSet.distance = exerciseSettings.distance;
        if (exerciseSettings.incline !== undefined) newSet.incline = exerciseSettings.incline;
        if (exerciseSettings.duration !== undefined) newSet.duration = exerciseSettings.duration;
      }

      setCurrentWorkout((prev) => {
        if (!prev) return null;
        
        const updatedWorkout = {
          ...prev,
          sets: [...prev.sets, newSet],
        };
        
        console.log("Added new set:", newSet);
        console.log("Updated workout sets:", updatedWorkout.sets);
        return updatedWorkout;
      });
      
      return newSet.id;
    } else {
      console.error("Cannot add set: No current workout");
      return null;
    }
  };

  const completeSet = (setId: string) => {
    if (currentWorkout) {
      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.map((set) =>
            set.id === setId ? { ...set, completed: true } : set
          ),
        };
      });
      toast.success("Set completed!");
    }
  };

  const skipSet = (setId: string) => {
    if (currentWorkout) {
      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.filter((set) => set.id !== setId),
        };
      });
      toast.info("Set skipped");
    }
  };

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    if (currentWorkout) {
      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.map((set) =>
            set.id === setId ? { ...set, ...updates } : set
          ),
        };
      });
    }
  };

  const updateWorkout = (updatedWorkout: any) => {
    setWorkouts(prev => {
      const updated = prev.map(workout => 
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      );
      saveWorkouts(updated);
      return updated;
    });
  };

  const navigateToExercise = (exerciseId: string) => {
    if (currentWorkout) {
      const index = currentWorkout.exercises.findIndex(id => id === exerciseId);
      if (index !== -1) {
        setCurrentExerciseIndex(index);
      }
    }
  };

  const navigateToNextExercise = () => {
    if (currentWorkout && currentExerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
    }
  };

  const navigateToPreviousExercise = () => {
    if (currentWorkout && currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prevIndex => prevIndex - 1);
    }
  };

  const saveCustomWorkout = (name: string) => {
    if (!currentWorkout) {
      toast.error("No active workout to save. Please start a workout first.");
      return;
    }

    // Only save if there are valid exercises
    if (currentWorkout.exercises.length === 0) {
      toast.error("Cannot save workout with no exercises");
      return;
    }

    const template: SavedWorkoutTemplate = {
      id: generateId(),
      name: name.trim(),
      exercises: [...currentWorkout.exercises],
      type: currentWorkout.type,
      createdAt: Date.now(),
      workoutPlanOverrides: workoutPlanOverrides || undefined
    };

    console.log("Saving workout template:", template);

    setSavedWorkoutTemplates(prev => {
      const updated = [template, ...prev];
      saveSavedWorkoutTemplates(updated);
      return updated;
    });
    
    // Cancel the current workout after saving
    setCurrentWorkout(null);
    
    toast.success(`Workout "${name}" saved successfully`);
  };

  const saveWorkoutTemplate = (name: string, exerciseIds: string[], type: ExerciseCategory | "Custom") => {
    const template: SavedWorkoutTemplate = {
      id: generateId(),
      name: name.trim(),
      exercises: exerciseIds,
      type: type,
      createdAt: Date.now()
    };

    console.log("Saving workout template:", template);

    setSavedWorkoutTemplates(prev => {
      const updated = [template, ...prev];
      saveSavedWorkoutTemplates(updated);
      return updated;
    });
  };

  const deleteSavedWorkout = (templateId: string) => {
    setSavedWorkoutTemplates(prev => {
      const updated = prev.filter(t => t.id !== templateId);
      saveSavedWorkoutTemplates(updated);
      return updated;
    });
    toast.success("Workout template deleted");
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== workoutId);
      saveWorkouts(updated);
      return updated;
    });
    toast.success("Workout deleted");
  };

  const getWorkoutStats = () => {
    return workouts.reduce(
      (stats, workout) => {
        stats.totalWorkouts += 1;
        stats.totalTime += workout.totalTime || 0;
        stats.totalSets += workout.sets.filter((set) => set.completed).length;
        stats.totalReps += workout.sets
          .filter((set) => set.completed && set.reps)
          .reduce((sum, set) => sum + (set.reps || 0), 0);
        return stats;
      },
      { totalWorkouts: 0, totalTime: 0, totalSets: 0, totalReps: 0 }
    );
  };

  const addBodyMeasurement = (measurement: Omit<BodyMeasurement, "id">) => {
    const newMeasurement: BodyMeasurement = {
      ...measurement,
      id: generateId()
    };
    
    setBodyMeasurements(prev => [newMeasurement, ...prev]);
    toast.success("Body measurement added");
  };

  const updateBodyMeasurement = (id: string, updates: Partial<BodyMeasurement>) => {
    setBodyMeasurements(prev => 
      prev.map(measurement => 
        measurement.id === id ? { ...measurement, ...updates } : measurement
      )
    );
    toast.success("Body measurement updated");
  };

  const deleteBodyMeasurement = (id: string) => {
    setBodyMeasurements(prev => prev.filter(measurement => measurement.id !== id));
    toast.success("Body measurement deleted");
  };

  const getBodyMeasurements = () => {
    return bodyMeasurements;
  };

  const addHealthMetric = (metric: Omit<HealthMetric, "id">) => {
    const newMetric: HealthMetric = {
      ...metric,
      id: generateId()
    };
    
    setHealthMetrics(prev => [newMetric, ...prev]);
    toast.success("Health metric added");
  };

  const updateHealthMetric = (id: string, updates: Partial<HealthMetric>) => {
    setHealthMetrics(prev => 
      prev.map(metric => 
        metric.id === id ? { ...metric, ...updates } : metric
      )
    );
    toast.success("Health metric updated");
  };

  const deleteHealthMetric = (id: string) => {
    setHealthMetrics(prev => prev.filter(metric => metric.id !== id));
    toast.success("Health metric deleted");
  };

  const getHealthMetrics = () => {
    return healthMetrics;
  };

  const saveCustomPlan = (plan: Omit<CustomPlan, "id" | "createdAt">) => {
    const newPlan: CustomPlan = {
      ...plan,
      id: generateId(),
      createdAt: Date.now()
    };
    
    setCustomPlans(prev => [newPlan, ...prev]);
    toast.success("Custom plan saved");
    return newPlan.id;
  };

  const updateCustomPlan = (planId: string, updates: Partial<CustomPlan>) => {
    setCustomPlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    );
    toast.success("Custom plan updated");
  };

  const deleteCustomPlan = (planId: string) => {
    setCustomPlans(prev => prev.filter(plan => plan.id !== planId));
    toast.success("Custom plan deleted");
  };

  const getCustomPlans = () => {
    return customPlans;
  };

  const deleteStatsData = () => {
    setWorkouts([]);
    saveWorkouts([]);
    setSavedWorkoutTemplates([]);
    saveSavedWorkoutTemplates([]);
    toast.success("Workout stats data deleted");
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        currentWorkout,
        savedWorkoutTemplates,
        customPlans,
        bodyMeasurements,
        healthMetrics,
        startWorkout,
        startSavedWorkout,
        endWorkout,
        cancelWorkout,
        addSet,
        completeSet,
        skipSet,
        updateSet,
        updateWorkout,
        getWorkoutStats,
        navigateToExercise,
        currentExerciseIndex,
        navigateToNextExercise,
        navigateToPreviousExercise,
        saveCustomWorkout,
        saveWorkoutTemplate,
        deleteSavedWorkout,
        deleteWorkout,
        addBodyMeasurement,
        updateBodyMeasurement,
        deleteBodyMeasurement,
        getBodyMeasurements,
        addHealthMetric,
        updateHealthMetric,
        deleteHealthMetric,
        getHealthMetrics,
        saveCustomPlan,
        updateCustomPlan,
        deleteCustomPlan,
        getCustomPlans,
        deleteStatsData
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
