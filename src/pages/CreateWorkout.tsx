
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Check, Filter, Trash, Clock, Save, HelpCircle } from "lucide-react";
import { useExercise } from "@/contexts/ExerciseContext";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Exercise, ExerciseCategory, MuscleGroup } from "@/lib/data";
import { SavedWorkoutTemplate } from "@/contexts/WorkoutContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getExerciseImageUrl } from "@/lib/utils";
import { convertGoogleDriveUrl } from "@/lib/formatters";
import ExerciseFilters from "@/components/ui/ExerciseFilters";
import CreateWorkoutHelpPopup from "@/components/ui/CreateWorkoutHelpPopup";

const CreateWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exercises, filterExercises } = useExercise();
  const { startWorkout, savedWorkoutTemplates, startSavedWorkout, deleteSavedWorkout, saveWorkoutTemplate, currentWorkout } = useWorkout();

  const searchParams = new URLSearchParams(location.search);
  const workoutType = searchParams.get("type") || "Custom";
  const initialExercises = searchParams.get("exercises")?.split(',') || [];

  const [selectedExercises, setSelectedExercises] = useState<string[]>(initialExercises);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedWorkouts, setShowSavedWorkouts] = useState(workoutType === "Custom");

  const [equipmentFilter, setEquipmentFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>(workoutType !== "Custom" ? workoutType : "All");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const categories: ("All" | ExerciseCategory)[] = ["All", "Weights", "Cardio", "Slide Board", "No Equipment"];
  const muscleGroups: ("All" | MuscleGroup)[] = [
    "All", "Abs", "Biceps", "Triceps", "Shoulders", "Chest", "Back", 
    "Legs", "Cardiovascular", "Full Body", "Core", "Glutes", 
    "Hamstrings", "Quadriceps", "Calves", "Forearms", "Inner Thigh", "Outer Thigh"
  ];

  const getExerciseImage = (exercise: Exercise) => {
    const imageUrl = getExerciseImageUrl(exercise);
    
    if (imageUrl) {
      const displayUrl = imageUrl.includes('drive.google.com') 
        ? convertGoogleDriveUrl(imageUrl) 
        : imageUrl;
        
      return (
        <img
          src={displayUrl}
          alt={exercise.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
            const placeholder = document.createElement('span');
            placeholder.className = 'text-xs text-muted-foreground';
            placeholder.textContent = 'No image';
            e.currentTarget.parentElement?.appendChild(placeholder);
          }}
        />
      );
    } else {
      // Simple text placeholder for exercises without images
      return (
        <span className="text-xs text-muted-foreground">No image</span>
      );
    }
  };

  useEffect(() => {
    const filtered = filterExercises(
      equipmentFilter === "All" ? undefined : equipmentFilter,
      categoryFilter === "All" ? undefined : categoryFilter,
      muscleGroupFilter === "All" ? undefined : muscleGroupFilter,
      searchQuery
    );
    setAvailableExercises(filtered);
  }, [exercises, equipmentFilter, categoryFilter, muscleGroupFilter, searchQuery, filterExercises]);

  useEffect(() => {
    if (workoutType !== "Custom" && workoutType !== "All") {
      setCategoryFilter(workoutType);
    }
  }, [workoutType]);

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises((prevSelected) => {
      if (prevSelected.includes(exerciseId)) {
        return prevSelected.filter((id) => id !== exerciseId);
      } else {
        return [...prevSelected, exerciseId];
      }
    });
  };

  const handleStartWorkout = () => {
    if (selectedExercises.length === 0) {
      toast.error("Please select at least one exercise");
      return;
    }

    try {
      startWorkout(workoutType, selectedExercises);
      navigate("/workout");
    } catch (error) {
      console.error("Error starting workout:", error);
      toast.error("Failed to start workout: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleStartSavedWorkout = (template: SavedWorkoutTemplate) => {
    try {
      startSavedWorkout(template.id);
      navigate("/workout");
    } catch (error) {
      console.error("Error starting saved workout:", error);
      toast.error("Failed to start saved workout: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleContinueCurrentWorkout = () => {
    if (currentWorkout) {
      navigate("/workout");
    } else {
      toast.error("No active workout to continue");
    }
  };

  const handleDeleteSavedWorkout = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved workout?")) {
      deleteSavedWorkout(templateId);
    }
  };

  const handleSaveWorkout = () => {
    if (selectedExercises.length === 0) {
      toast.error("Please select at least one exercise");
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    if (!workoutName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }
    
    // Save the template directly without starting a workout
    saveWorkoutTemplate(workoutName, selectedExercises, workoutType as ExerciseCategory | "Custom");
    setShowSaveDialog(false);
    setWorkoutName("");
    setSelectedExercises([]); // Clear selections after saving
    toast.success(`Workout "${workoutName}" saved successfully`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="page-container page-transition pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            className="mr-2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">
            {workoutType === "Custom" ? "Create Custom Workout" : `${workoutType} Workout`}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {workoutType === "Custom" && (
            <>
              <button
                className={`p-2 rounded-md transition-colors ${
                  showSavedWorkouts ? "bg-primary text-white" : "bg-gym-card hover:bg-gym-card-hover"
                }`}
                onClick={() => setShowSavedWorkouts(!showSavedWorkouts)}
              >
                <Save className="h-5 w-5" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveWorkout}
                disabled={selectedExercises.length === 0}
              >
                Save Workout
              </Button>
            </>
          )}
          <button
            className="p-2 bg-gym-card rounded-md hover:bg-gym-card-hover transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </button>
          <Button variant="ghost" size="icon" onClick={() => setShowHelp(true)}>
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <CreateWorkoutHelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="workoutName" className="block text-sm font-medium mb-2">
              Workout Name
            </label>
            <input
              id="workoutName"
              type="text"
              className="w-full p-2 bg-gym-dark border border-border rounded-md"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Enter workout name..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {workoutType === "Custom" && showSavedWorkouts && savedWorkoutTemplates.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Saved Workouts</h2>
          <div className="space-y-3">
            {savedWorkoutTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg border border-gray-700 bg-gym-card hover:bg-gym-card-hover cursor-pointer transition-colors"
                onClick={() => handleStartSavedWorkout(template)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <div className="flex text-xs text-muted-foreground space-x-3 mt-1">
                      <span>{template.exercises.length} exercises</span>
                      <span>•</span>
                      <span>Created {formatDate(template.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 hover:bg-gym-dark rounded-full transition-colors"
                      onClick={(e) => handleDeleteSavedWorkout(e, template.id)}
                    >
                      <Trash className="h-4 w-4 text-gym-red" />
                    </button>
                    <button
                      className="p-2 bg-gym-green rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSavedWorkout(template);
                      }}
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="my-6 border-t border-gray-700"></div>
        </div>
      )}

      {showFilters && (
        <div className="card-glass p-4 mb-6 animate-fadeIn">
          <h2 className="text-sm font-medium mb-3">Filter Exercises</h2>
          <ExerciseFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            equipmentFilter={equipmentFilter}
            onEquipmentFilterChange={setEquipmentFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={(category) => {
              if (workoutType === "Custom" || workoutType === "All") {
                setCategoryFilter(category);
              }
            }}
            muscleGroupFilter={muscleGroupFilter}
            onMuscleGroupFilterChange={setMuscleGroupFilter}
          />
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
        </p>
        
        <div className="flex items-center space-x-4">
          <button
            className="text-sm text-primary hover:text-blue-400 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
            onClick={() => setSelectedExercises(availableExercises.map(ex => ex.id))}
            disabled={availableExercises.length === 0 || selectedExercises.length === availableExercises.length}
          >
            Select All
          </button>
          <button
            className="text-sm text-primary hover:text-blue-400 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
            onClick={() => setSelectedExercises([])}
            disabled={selectedExercises.length === 0}
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-20">
        {availableExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 mb-4">No exercises found</p>
            <button
              onClick={() => navigate("/create-exercise")}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              Create a new exercise
            </button>
          </div>
        ) : (
          availableExercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.id);
            return (
              <div
                key={exercise.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/20 border-primary/50"
                    : "bg-gym-card border-transparent hover:bg-gym-card-hover"
                }`}
                onClick={() => toggleExerciseSelection(exercise.id)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-gym-dark flex items-center justify-center mr-3 overflow-hidden">
                    {getExerciseImage(exercise)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{exercise.name}</h3>
                    <div className="flex text-xs text-muted-foreground space-x-2">
                      <span>{exercise.category}</span>
                      <span>•</span>
                      <span>{exercise.muscleGroups.slice(0, 2).join(", ")}{exercise.muscleGroups.length > 2 ? "..." : ""}</span>
                    </div>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-gray-500"
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gym-dark border-t border-white/5">
        {currentWorkout ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleContinueCurrentWorkout}
              className="py-3 rounded-lg font-medium bg-gym-green text-white hover:bg-gym-green/80"
            >
              Continue Current Workout
            </Button>
            <Button
              onClick={handleStartWorkout}
              disabled={selectedExercises.length === 0}
              className={`py-3 rounded-lg font-medium transition-colors ${
                selectedExercises.length > 0
                  ? "bg-primary text-white hover:bg-blue-600"
                  : "bg-gym-card text-gray-400 cursor-not-allowed"
              }`}
            >
              Start New Workout
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleStartWorkout}
            disabled={selectedExercises.length === 0}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              selectedExercises.length > 0
                ? "bg-primary text-white hover:bg-blue-600"
                : "bg-gym-card text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Workout
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateWorkout;
