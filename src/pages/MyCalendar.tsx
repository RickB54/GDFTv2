import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarUI, 
  CalendarProps 
} from "@/components/ui/calendar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, isBefore, isAfter, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfToday, isFuture } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Play, HelpCircle, ChevronDown, Dumbbell, Flame, SlidersHorizontal, PersonStanding, Sparkles, ClipboardList, History, Edit, Trash2, Info, X } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CalendarHelpPopup from "@/components/ui/CalendarHelpPopup";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getExercises, Exercise } from "@/lib/data";
import ExerciseFilters from "@/components/ui/ExerciseFilters";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkoutTypeCard from "@/components/ui/WorkoutTypeCard";
import { cn } from "@/lib/utils";
import { formatTimeString } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the ScheduledWorkout interface
interface ScheduledWorkout {
  id: string;
  date: Date;
  workoutType: string;
  templateId?: string;
  planId?: string;
  existingWorkoutId?: string;
  time?: string;
  completed?: boolean;
  missed?: boolean;
  exercises?: string[];
}

type PendingWorkout = Omit<ScheduledWorkout, "id"> & { id?: string };

const MyCalendar = () => {
  const [view, setView] = useState<"week" | "month" | "year">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schedulingDate, setSchedulingDate] = useState<Date | null>(null);
  const [workoutType, setWorkoutType] = useState("Weights");
  const [workoutTime, setWorkoutTime] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedExistingWorkoutId, setSelectedExistingWorkoutId] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [dayDetailData, setDayDetailData] = useState<{ date: Date; scheduled: ScheduledWorkout[]; completed: ReturnType<typeof useWorkout>['workouts'] } | null>(null);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>(() => {
    const saved = localStorage.getItem('scheduledWorkouts');
    return saved ? JSON.parse(saved).map((workout: any) => ({
      ...workout,
      date: new Date(workout.date)
    })) : [];
  });
  const [notifiedWorkoutIds, setNotifiedWorkoutIds] = useState<string[]>([]);
  const [deletingWorkout, setDeletingWorkout] = useState<ScheduledWorkout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<ScheduledWorkout | null>(null);
  const [showEditComingSoon, setShowEditComingSoon] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const { workouts, savedWorkoutTemplates, customPlans, startWorkout, startSavedWorkout } = useWorkout();
  const navigate = useNavigate();
  const allExercises = getExercises();

  // State for filters must be declared before useMemo that uses them
  const [searchQuery, setSearchQuery] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("All");

  // Filtered exercises for the new dialog
  const filteredExercises = useMemo(() => {
    return allExercises.filter(exercise => {
      const searchLower = searchQuery.toLowerCase();
      if (searchQuery && !exercise.name.toLowerCase().includes(searchLower)) {
        return false;
      }

      if (equipmentFilter !== "All") {
        const equipment = exercise.equipment as string;
        // Exact match or handle plural variants
        if (equipment !== equipmentFilter &&
            !(equipmentFilter === 'Dumbbell' && (equipment === 'Dumbbells' || equipment === 'Dumbbell')) &&
            !(equipmentFilter === 'Kettlebell' && (equipment === 'Kettlebells' || equipment === 'Kettlebell')) &&
            !(equipmentFilter === 'Resistance Band' && (equipment === 'Resistance Bands' || equipment === 'Resistance Band'))) {
          return false;
        }
      }
      
      if (categoryFilter !== "All" && categoryFilter !== "Favorites" && exercise.category !== categoryFilter) {
        return false;
      }
      if (muscleGroupFilter !== "All" && (!exercise.muscleGroups || !exercise.muscleGroups.includes(muscleGroupFilter as any))) {
        return false;
      }
      return true;
    });
  }, [allExercises, searchQuery, equipmentFilter, categoryFilter, muscleGroupFilter]);

  // State for new exercise selector
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState<PendingWorkout | null>(null);
  
  // Save scheduled workouts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scheduledWorkouts', JSON.stringify(scheduledWorkouts));
  }, [scheduledWorkouts]);

  useEffect(() => {
    if (editingWorkout) {
        setSchedulingDate(editingWorkout.date);
        let type = editingWorkout.workoutType;
        if (editingWorkout.templateId) {
            type = "Custom";
        } else if (editingWorkout.planId) {
            type = "Plan";
        } else if (editingWorkout.existingWorkoutId) {
            type = "Existing";
        }
        setWorkoutType(type);
        setWorkoutTime(editingWorkout.time || "");
        setSelectedTemplateId(editingWorkout.templateId || "");
        setSelectedPlanId(editingWorkout.planId || "");
        setSelectedExistingWorkoutId(editingWorkout.existingWorkoutId || "");
    }
  }, [editingWorkout]);

  // Notify user when a workout is due
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      scheduledWorkouts.forEach(workout => {
        if (workout.time && !workout.completed && !workout.missed && !notifiedWorkoutIds.includes(workout.id)) {
          const [hours, minutes] = workout.time.split(':');
          const workoutDateTime = new Date(workout.date);
          workoutDateTime.setHours(parseInt(hours, 10));
          workoutDateTime.setMinutes(parseInt(minutes, 10));
          workoutDateTime.setSeconds(0);
          workoutDateTime.setMilliseconds(0);

          const timeDiff = now.getTime() - workoutDateTime.getTime();

          if (timeDiff >= 0 && timeDiff < 60000) { // If due in the last minute
            toast.info(`Time for your workout: ${workout.workoutType}`);
            setNotifiedWorkoutIds(prev => [...prev, workout.id]);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [scheduledWorkouts, notifiedWorkoutIds]);

  // Update missed workouts
  useEffect(() => {
    const today = startOfToday();
    const needsUpdate = scheduledWorkouts.some(w => !w.completed && !w.missed && isBefore(new Date(w.date), today));
    
    if (needsUpdate) {
      setScheduledWorkouts(prev => 
        prev.map(w => 
          !w.completed && !w.missed && isBefore(new Date(w.date), today)
            ? { ...w, missed: true } 
            : w
        )
      );
    }
  }, [scheduledWorkouts]);

  // Function to navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
    setCurrentMonth(new Date());
  };

  // Function to go to previous period
  const goToPrevious = () => {
    if (view === "week") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      });
    } else if (view === "month") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      });
    } else if (view === "year") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
      });
    }
  };

  // Function to go to next period
  const goToNext = () => {
    if (view === "week") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      });
    } else if (view === "month") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      });
    } else if (view === "year") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() + 1);
        return newDate;
      });
    }
  };

  // Helper function to check workout statuses for a given day
  const getWorkoutStatusesForDay = (date: Date): ("completed" | "scheduled" | "missed")[] => {
    const statuses = new Set<"completed" | "scheduled" | "missed">();
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check completed workouts from history
    workouts.forEach(workout => {
      if (workout.endTime && format(new Date(workout.startTime), 'yyyy-MM-dd') === dateString) {
        statuses.add("completed");
      }
    });

    // Check scheduled workouts
    scheduledWorkouts.forEach(workout => {
      if (format(new Date(workout.date), 'yyyy-MM-dd') === dateString) {
        if (workout.completed) {
          statuses.add("completed");
        } else if (workout.missed) {
          statuses.add("missed");
        } else {
          statuses.add("scheduled");
        }
      }
    });

    return Array.from(statuses);
  };

  // Function to get workouts for a given day
  const getWorkoutsForDay = (date: Date) => {
    const scheduled = scheduledWorkouts.filter(w => isSameDay(new Date(w.date), date));
    // Also include completed workouts from history
    const completed = workouts.filter(w => w.endTime && isSameDay(new Date(w.startTime), date));
    return { scheduled, completed };
  };

  // Function to open scheduling dialog
  const openScheduleDialog = (date: Date) => {
    setSchedulingDate(date);
    setIsDialogOpen(true);
  };

  const handlePerformWorkout = (workout: ScheduledWorkout) => {
    if (isFuture(new Date(workout.date))) {
      toast.error("You cannot start a workout scheduled for a future date.");
      return;
    }

    if (workout.templateId && savedWorkoutTemplates) {
      const template = savedWorkoutTemplates.find(t => t.id === workout.templateId);
      if (template) {
        startSavedWorkout(workout.templateId);
        navigate('/workout');
      } else {
        toast.error("Saved workout template not found.");
      }
    } else if (workout.existingWorkoutId && workouts) {
      const existing = workouts.find(w => w.id === workout.existingWorkoutId);
      if (existing) {
        startWorkout(existing.type, existing.exercises);
        navigate('/workout');
      } else {
        toast.error("Existing workout not found.");
      }
    } else if (workout.planId && customPlans) {
      toast.info("Starting workouts from a plan is not yet supported from the calendar.");
    } else {
      startWorkout(workout.workoutType, workout.exercises || []);
      navigate('/workout');
    }
  };

  // Custom day rendering function for the Calendar in Month view
  const renderDay = (day: Date) => {
    const statuses = getWorkoutStatusesForDay(day);
    const isToday = isSameDay(day, new Date());
    
    return (
      <div 
        className={`relative h-full w-full p-1 flex flex-col items-center justify-between cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          const { scheduled, completed } = getWorkoutsForDay(day);

          if (scheduled.length > 0 || completed.length > 0) {
            // Always open a detail view if there are any workouts
            setDayDetailData({ date: day, scheduled, completed });
            setIsDayDetailOpen(true);
          } else {
            // If no workouts, open scheduling dialog
            if (isBefore(day, startOfToday()) && !isSameDay(day, startOfToday())) {
              toast.error("You cannot schedule workouts for a past date.");
              return;
            }
            setSchedulingDate(day);
            setIsDialogOpen(true);
          }
        }}
      >
        <span className={`flex items-center justify-center rounded-full h-6 w-6 ${
          isToday ? 'border-2 border-gym-blue' : ''
        }`}>{format(day, 'd')}</span>
        {statuses.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-1">
            {statuses.map((status, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  status === 'completed' ? 'bg-green-500' : 
                  status === 'missed' ? 'bg-red-500' : 
                  'bg-blue-500'
                }`} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Function to render the week view with today highlighted
  const renderWeekView = () => {
    const start = startOfWeek(currentMonth, { weekStartsOn: 0 });
    const end = endOfWeek(currentMonth, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });
    
    return (
      <div className="space-y-2">
        {days.map((day) => {
          const dayWorkouts = scheduledWorkouts.filter(w => isSameDay(new Date(w.date), day));
          const completedHistWorkouts = workouts.filter(w => w.endTime && isSameDay(new Date(w.startTime), day));
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toString()} className={`p-2 rounded-lg card-glass ${isToday ? 'border-2 border-gym-blue' : 'border border-transparent'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{format(day, 'EEEE')}</h3>
                <span className="text-gray-400">{format(day, 'MMMM d')}</span>
              </div>
              
              <div className="space-y-2">
                {dayWorkouts.length === 0 && completedHistWorkouts.length === 0 && (
                  <p className="text-gray-500">No workouts for this day.</p>
                )}
                {dayWorkouts.map(workout => {
                  let exerciseList: Exercise[] = [];
                  if (workout.templateId) {
                    const template = savedWorkoutTemplates.find(t => t.id === workout.templateId);
                    if (template) {
                      exerciseList = template.exercises
                        .map(id => allExercises.find(e => e.id === id))
                        .filter((e): e is Exercise => !!e);
                    }
                  } else if (workout.existingWorkoutId) {
                    const existing = workouts.find(w => w.id === workout.existingWorkoutId);
                    if (existing) {
                      exerciseList = existing.exercises
                        .map(id => allExercises.find(e => e.id === id))
                        .filter((e): e is Exercise => !!e);
                    }
                  } else if (workout.exercises && workout.exercises.length > 0) {
                    exerciseList = workout.exercises
                      .map(id => allExercises.find(e => e.id === id))
                      .filter((e): e is Exercise => !!e);
                  }
                  
                  return (
                    <Collapsible key={workout.id} className="space-y-1">
                      <div className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                          <div className="flex flex-col items-start">
                              <p className="font-semibold">{workout.workoutType}</p>
                              {workout.time && <p className="text-sm text-muted-foreground">{formatTimeString(workout.time)}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                              {workout.missed && <span className="text-xs text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Missed</span>}
                              {workout.completed && <span className="text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded-full">Completed</span>}
                              {!workout.completed && !workout.missed && (
                                  <Button onClick={() => handlePerformWorkout(workout)} variant="ghost" size="icon" className="h-8 w-8" title="Perform workout">
                                      <Play className="h-5 w-5 text-gym-green" />
                                  </Button>
                              )}
                              <Button onClick={() => {
                                  setEditingWorkout(workout);
                                  setIsDialogOpen(true);
                              }} variant="ghost" size="icon" className="h-8 w-8" title="Edit workout">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => setDeletingWorkout(workout)} variant="ghost" size="icon" className="h-8 w-8" title="Delete workout">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                              {exerciseList.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                          </div>
                      </div>
                      <CollapsibleContent className="pl-4 pr-2 pb-2">
                          {exerciseList.length > 0 ? (
                              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 text-left">
                                  {exerciseList.map(ex => <li key={ex.id}>{ex.name}</li>)}
                              </ul>
                          ) : (
                              <p className="text-xs text-gray-500 text-left">No specific exercises for this scheduled workout.</p>
                          )}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
                {completedHistWorkouts.map(workout => {
                    const exerciseList: Exercise[] = workout.exercises
                        .map(id => allExercises.find(ex => ex.id === id))
                        .filter((ex): ex is Exercise => !!ex);
                    
                    return (
                        <Collapsible key={workout.id} className="space-y-1">
                            <div className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                                <div className="flex flex-col items-start">
                                    <p className="font-semibold">{workout.name}</p>
                                    <p className="text-sm text-gray-400">Completed at {format(new Date(workout.startTime), 'p')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button onClick={() => {
                                        startWorkout(workout.type, workout.exercises);
                                        navigate('/workout');
                                    }} variant="ghost" size="icon" className="h-8 w-8">
                                       <Play className="h-5 w-5 text-gym-green" />
                                    </Button>
                                    {exerciseList.length > 0 && (
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                        </Button>
                                      </CollapsibleTrigger>
                                    )}
                                </div>
                            </div>
                            <CollapsibleContent className="pl-4 pr-2 pb-2">
                                {exerciseList.length > 0 && (
                                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 text-left">
                                        {exerciseList.map(ex => <li key={ex.id}>{ex.name}</li>)}
                                    </ul>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    )
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render the year view with today highlighted
  const renderYearView = () => {
    const months = [];
    const year = currentMonth.getFullYear();
    const today = new Date();
    
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const date = new Date(year, monthIndex, 1);
      months.push(date);
    }
    
    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((date) => (
          <div 
            key={date.toString()} 
            className="border p-2 cursor-pointer"
            onClick={() => {
              setView("month");
              setCurrentMonth(date);
            }}
          >
            <div className="text-lg font-medium mb-2">{format(date, 'MMMM')}</div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center font-medium">{day}</div>
              ))}
              {Array(new Date(year, date.getMonth() + 1, 0).getDate()).fill(null).map((_, i) => {
                const day = new Date(year, date.getMonth(), i + 1);
                const dayOfWeek = day.getDay();
                const statuses = getWorkoutStatusesForDay(day);
                const isToday = isSameDay(day, today);
                
                // Add empty cells for proper alignment
                if (i === 0) {
                  const emptyBeforeCells = [];
                  for (let j = 0; j < dayOfWeek; j++) {
                    emptyBeforeCells.push(<div key={`empty-before-${j}`} />);
                  }
                  return [
                    ...emptyBeforeCells,
                    <div 
                      key={day.toString()} 
                      className={`text-center relative ${
                        isToday ? 'border border-gym-blue rounded-full' : ''
                      }`}
                    >
                      {i + 1}
                      {statuses.length > 0 && (
                        <div 
                          className={`w-1 h-1 rounded-full inline-block ml-1 ${
                            statuses.includes('completed') ? 'bg-green-500' : 
                            statuses.includes('missed') ? 'bg-red-500' : 
                            'bg-blue-500'
                          }`} 
                        />
                      )}
                    </div>
                  ];
                }
                
                return (
                  <div 
                    key={day.toString()} 
                    className={`text-center relative ${
                      isToday ? 'border border-gym-blue rounded-full' : ''
                    }`}
                  >
                    {i + 1}
                    {statuses.length > 0 && (
                       <div 
                          className={`w-1 h-1 rounded-full inline-block ml-1 ${
                            statuses.includes('completed') ? 'bg-green-500' : 
                            statuses.includes('missed') ? 'bg-red-500' : 
                            'bg-blue-500'
                          }`} 
                        />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to schedule a workout
  const handleScheduleDialogSubmit = () => {
    if (!schedulingDate) return;

    const typesWithPredefinedExercises = ["Custom", "Plan", "Existing"];
    if (typesWithPredefinedExercises.includes(workoutType)) {
        const workoutData: Omit<ScheduledWorkout, 'id'> = {
            date: schedulingDate,
            workoutType,
            time: workoutTime,
            templateId: workoutType === "Custom" ? selectedTemplateId : undefined,
            planId: workoutType === "Plan" ? selectedPlanId : undefined,
            existingWorkoutId: workoutType === "Existing" ? selectedExistingWorkoutId : undefined,
        };

        if (workoutType === "Existing" && selectedExistingWorkoutId) {
            const selected = workouts.find(w => w.id === selectedExistingWorkoutId);
            if (selected) {
                (workoutData as ScheduledWorkout).workoutType = `Existing: ${selected.name}`;
            }
        }
        
        if (editingWorkout) {
            const updatedWorkout: ScheduledWorkout = { ...editingWorkout, ...workoutData, date: schedulingDate, time: workoutTime };
            if (workoutType === "Existing" && selectedExistingWorkoutId) {
                const selected = workouts.find(w => w.id === selectedExistingWorkoutId);
                if (selected) updatedWorkout.workoutType = `Existing: ${selected.name}`;
            } else {
                updatedWorkout.workoutType = workoutType;
            }

            setScheduledWorkouts(prev => prev.map(w => w.id === editingWorkout.id ? updatedWorkout : w));
            toast.success(`Workout updated for ${format(schedulingDate, 'MMMM do')}`);
        } else {
            const newWorkout: ScheduledWorkout = { ...workoutData, id: Math.random().toString(36).substring(2, 15), date: schedulingDate };
            setScheduledWorkouts(prev => [...prev, newWorkout]);
            toast.success(`Workout scheduled for ${format(schedulingDate, 'MMMM do')}`);
        }

        setIsDialogOpen(false);
        return;
    }
    
    const workoutToSchedule: PendingWorkout = {
      id: editingWorkout ? editingWorkout.id : undefined,
      date: schedulingDate,
      workoutType,
      time: workoutTime,
      exercises: editingWorkout ? editingWorkout.exercises : []
    };
    
    setPendingWorkout(workoutToSchedule);
    setSelectedExercises(editingWorkout?.exercises || []); 
    setSearchQuery("");
    
    if (workoutType === "No Equipment") {
      setEquipmentFilter("None");
      setCategoryFilter("No Equipment");
    } else if (workoutType === "Slide Board") {
      setEquipmentFilter("Slide Board");
      setCategoryFilter("Slide Board");
    } else if (workoutType === "Weights") {
      setEquipmentFilter("All");
      setCategoryFilter("Weights");
    } else if (workoutType === "Cardio") {
      setEquipmentFilter("All");
      setCategoryFilter("Cardio");
    } else {
      setEquipmentFilter("All");
      setCategoryFilter("All");
    }

    setMuscleGroupFilter("All");
    setIsDialogOpen(false);
    setIsExerciseSelectorOpen(true);
  };

  const handleAddExercisesToScheduledWorkout = () => {
    if (!pendingWorkout) return;

    if (pendingWorkout.id) {
        setScheduledWorkouts(prev => prev.map(w => 
            w.id === pendingWorkout.id 
            ? { ...w, exercises: selectedExercises, workoutType: pendingWorkout.workoutType, time: pendingWorkout.time, date: pendingWorkout.date } 
            : w
        ));
        toast.success(`Workout updated for ${format(pendingWorkout.date, 'MMMM do')}`);
    } else {
        const newWorkout: ScheduledWorkout = {
          ...pendingWorkout,
          id: Math.random().toString(36).substring(2, 15),
          exercises: selectedExercises,
        };
        setScheduledWorkouts(prev => [...prev, newWorkout]);
        toast.success(`Workout scheduled for ${format(newWorkout.date, 'MMMM do')}`);
    }

    setIsExerciseSelectorOpen(false);
    setPendingWorkout(null);
  }

  const handleDeleteWorkout = () => {
    if (!deletingWorkout) return;
    setScheduledWorkouts(prev => prev.filter(w => w.id !== deletingWorkout.id));
    setDeletingWorkout(null);
    setIsDayDetailOpen(false); // Close day detail dialog after delete
    toast.success("Scheduled workout deleted.");
  };

  return (
    <div className="page-container p-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center flex-wrap gap-2">
          <Button onClick={goToPrevious} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={goToNext} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={goToToday} variant="outline">
            Today
          </Button>
          <Button 
            onClick={() => {
              setSchedulingDate(new Date());
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Schedule A Workout For Today
          </Button>
        </div>
        
        <h2 className="text-base sm:text-xl font-medium">
          {view === "week" 
            ? `Week of ${format(startOfWeek(currentMonth), 'MMM d')} - ${format(endOfWeek(currentMonth), 'MMM d, yyyy')}`
            : view === "month" 
            ? format(currentMonth, 'MMMM yyyy')
            : format(currentMonth, 'yyyy')
          }
        </h2>
      </div>
      
      <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month" | "year")} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week" className="mt-4">
          {renderWeekView()}
        </TabsContent>
        
        <TabsContent value="month" className="mt-4">
          <CalendarUI
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border w-full"
            components={{
              Day: ({ date }: { date: Date }) => renderDay(date)
            }}
          />
        </TabsContent>
        
        <TabsContent value="year" className="mt-4 overflow-x-auto">
          {renderYearView()}
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 flex items-center flex-wrap gap-3 sm:gap-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <span className="text-sm">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
          <span className="text-sm">Scheduled</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <span className="text-sm">Missed</span>
        </div>
      </div>
      
      {/* Scheduling Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
              setEditingWorkout(null);
              setWorkoutType("Weights");
              setWorkoutTime("");
              setSelectedTemplateId("");
              setSelectedPlanId("");
              setSelectedExistingWorkoutId("");
          }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWorkout ? 'Edit Scheduled Workout' : 'Schedule a Workout'}</DialogTitle>
            <DialogDescription>
              {schedulingDate && `For ${format(schedulingDate, 'EEEE, MMMM do, yyyy')}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-3 block text-center">Select Workout Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <WorkoutTypeCard icon={Dumbbell} title="Weights" color="blue" onClick={() => setWorkoutType("Weights")} className={cn("h-32", workoutType === 'Weights' ? 'ring-2 ring-offset-2 ring-offset-background ring-gym-blue' : '')} />
              <WorkoutTypeCard icon={Flame} title="Cardio" color="green" onClick={() => setWorkoutType("Cardio")} className={cn("h-32", workoutType === 'Cardio' ? 'ring-2 ring-offset-2 ring-offset-background ring-gym-green' : '')} />
              <WorkoutTypeCard icon={SlidersHorizontal} title="Slide Board" color="red" onClick={() => setWorkoutType("Slide Board")} className={cn("h-32", workoutType === 'Slide Board' ? 'ring-2 ring-offset-2 ring-offset-background ring-gym-red' : '')}/>
              <WorkoutTypeCard icon={PersonStanding} title="No Equipment" color="orange" onClick={() => setWorkoutType("No Equipment")} className={cn("h-32", workoutType === 'No Equipment' ? 'ring-2 ring-offset-2 ring-offset-background ring-gym-orange' : '')}/>
              <WorkoutTypeCard icon={Sparkles} title="Custom" color="purple" onClick={() => setWorkoutType("Custom")} className={cn("h-32", workoutType === 'Custom' ? 'ring-2 ring-offset-2 ring-offset-background ring-gym-purple' : '')}/>
              <WorkoutTypeCard icon={ClipboardList} title="From Plan" color="blue" onClick={() => setWorkoutType("Plan")} className={cn("h-32", workoutType === 'Plan' ? 'ring-2 ring-offset-2 ring-offset-background ring-gym-blue' : '')} />
              <WorkoutTypeCard icon={History} title="From History" color="green" onClick={() => setWorkoutType("Existing")} className={cn("h-32", workoutType === 'Existing' ? 'ring-2 ring-offset-2 ring-offset-background ring-gym-green' : '')} />
            </div>

            {/* Conditional inputs based on workout type */}
            <div className="mt-6 space-y-4">
              {workoutType === "Custom" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Template</label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a workout template" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedWorkoutTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {workoutType === "Plan" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Plan</label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a custom plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {customPlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {workoutType === "Existing" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Workout</label>
                  <Select value={selectedExistingWorkoutId} onValueChange={setSelectedExistingWorkoutId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an existing workout" />
                    </SelectTrigger>
                    <SelectContent>
                      {workouts.filter(w => w.endTime).map(workout => (
                        <SelectItem key={workout.id} value={workout.id}>
                          {workout.name} ({format(new Date(workout.startTime), 'MMM d')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="workoutTime" className="text-right">Time (optional)</label>
                <div className="col-span-3 relative">
                  <Input 
                    id="workoutTime" 
                    type="time" 
                    value={workoutTime} 
                    onChange={(e) => setWorkoutTime(e.target.value)} 
                    className="bg-background pr-10" 
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-full" 
                    onClick={() => setWorkoutTime(format(new Date(), 'HH:mm'))}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleDialogSubmit}>
              {editingWorkout ? 'Update' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Day Detail Dialog */}
      <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          {showEditComingSoon && (
            <Alert variant="default" className="flex items-center justify-between">
                <div className="flex items-center">
                    <Info className="h-5 w-5 mr-3 text-blue-500" />
                    <AlertDescription>
                        Editing scheduled workouts is coming soon!
                    </AlertDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowEditComingSoon(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </Alert>
          )}
          <DialogHeader>
            <DialogTitle>
              Workouts for {dayDetailData && format(dayDetailData.date, 'EEEE, MMMM do')}
            </DialogTitle>
            <DialogDescription>
              Perform a scheduled workout or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {dayDetailData && dayDetailData.scheduled.length === 0 && dayDetailData.completed.length === 0 && (
              <p className="text-muted-foreground text-center">No workouts for this day.</p>
            )}
            {dayDetailData?.scheduled.map(workout => {
              let exerciseList: Exercise[] = [];
              if (workout.templateId) {
                const template = savedWorkoutTemplates.find(t => t.id === workout.templateId);
                if (template) {
                  exerciseList = template.exercises
                    .map(id => allExercises.find(e => e.id === id))
                    .filter((e): e is Exercise => !!e);
                }
              } else if (workout.existingWorkoutId) {
                const existing = workouts.find(w => w.id === workout.existingWorkoutId);
                if (existing) {
                  exerciseList = existing.exercises
                    .map(id => allExercises.find(e => e.id === id))
                    .filter((e): e is Exercise => !!e);
                }
              } else if (workout.exercises && workout.exercises.length > 0) {
                exerciseList = workout.exercises
                  .map(id => allExercises.find(e => e.id === id))
                  .filter((e): e is Exercise => !!e);
              }

              return (
                <Collapsible key={workout.id} className="space-y-1">
                  <div className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                    <div className="flex flex-col items-start">
                      <p className="font-semibold">{workout.workoutType}</p>
                      {workout.time && <p className="text-sm text-muted-foreground">{formatTimeString(workout.time)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {workout.missed && <span className="text-xs text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Missed</span>}
                      {workout.completed && <span className="text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded-full">Completed</span>}
                      {!workout.completed && !workout.missed && (
                        <Button onClick={() => { handlePerformWorkout(workout); setIsDayDetailOpen(false); }} variant="ghost" size="icon" className="h-8 w-8" title="Perform workout">
                          <Play className="h-5 w-5 text-gym-green" />
                        </Button>
                      )}
                      <Button onClick={() => {
                          setEditingWorkout(workout);
                          setIsDayDetailOpen(false);
                          setIsDialogOpen(true);
                      }} variant="ghost" size="icon" className="h-8 w-8" title="Edit workout">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setDeletingWorkout(workout)} variant="ghost" size="icon" className="h-8 w-8" title="Delete workout">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      {exerciseList.length > 0 && (
                        <CollapsibleTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                  </div>
                   <CollapsibleContent className="pl-4 pr-2 pb-2">
                      {exerciseList.length > 0 ? (
                          <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 text-left">
                              {exerciseList.map(ex => <li key={ex.id}>{ex.name}</li>)}
                          </ul>
                      ) : (
                          <p className="text-xs text-gray-500 text-left">No specific exercises for this scheduled workout.</p>
                      )}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
            {dayDetailData?.completed.map(workout => (
              <div key={workout.id} className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                <div className="flex flex-col items-start">
                  <p className="font-semibold">{workout.name}</p>
                  <p className="text-sm text-muted-foreground">Completed at {format(new Date(workout.startTime), 'p')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => {
                    startWorkout(workout.type, workout.exercises);
                    navigate('/workout');
                    setIsDayDetailOpen(false);
                  }} variant="ghost" size="icon" className="h-8 w-8" title="Perform again">
                    <Play className="h-5 w-5 text-gym-green" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDayDetailOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDayDetailOpen(false);
              const date = dayDetailData!.date;
              if (isBefore(date, startOfToday()) && !isSameDay(date, startOfToday())) {
                  toast.error("You cannot schedule workouts for a past date.");
                  return;
              }
              setSchedulingDate(date);
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Schedule New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: Exercise Selector Dialog */}
      <Dialog open={isExerciseSelectorOpen} onOpenChange={setIsExerciseSelectorOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Exercises</DialogTitle>
            <DialogDescription>
              Choose exercises for your '{pendingWorkout?.workoutType}' workout on {pendingWorkout && format(pendingWorkout.date, 'MMMM do')}
              {pendingWorkout?.time && ` at ${formatTimeString(pendingWorkout.time)}`}.
            </DialogDescription>
          </DialogHeader>
          <ExerciseFilters
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              equipmentFilter={equipmentFilter}
              onEquipmentFilterChange={setEquipmentFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              muscleGroupFilter={muscleGroupFilter}
              onMuscleGroupFilterChange={setMuscleGroupFilter}
          />
          <ScrollArea className="flex-grow my-4 border rounded-md">
              <div className="space-y-1 p-2">
                  {filteredExercises.map(exercise => (
                      <div key={exercise.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted">
                          <Checkbox
                              id={`ex-${exercise.id}`}
                              checked={selectedExercises.includes(exercise.id)}
                              onCheckedChange={(checked) => {
                                  setSelectedExercises(prev => 
                                    checked 
                                      ? [...prev, exercise.id] 
                                      : prev.filter(id => id !== exercise.id)
                                  );
                              }}
                          />
                          <label htmlFor={`ex-${exercise.id}`} className="flex-1 cursor-pointer text-sm">
                              <p className="font-medium">{exercise.name}</p>
                              <p className="text-xs text-muted-foreground">{Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.join(', ') : exercise.muscleGroups} - {exercise.equipment}</p>
                          </label>
                      </div>
                  ))}
                  {filteredExercises.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                      No exercises match your filters.
                    </div>
                  )}
              </div>
          </ScrollArea>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsExerciseSelectorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExercisesToScheduledWorkout}>
                  Add {selectedExercises.length > 0 ? `${selectedExercises.length} ` : ''}Exercises To Scheduled Workout
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingWorkout} onOpenChange={(open) => !open && setDeletingWorkout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the scheduled workout. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingWorkout(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CalendarHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default MyCalendar;
