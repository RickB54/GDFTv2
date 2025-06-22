import React, { useRef, useState } from "react";
import { Download, Upload, Info, Trash2, HelpCircle } from "lucide-react";
import { useExercise } from "@/contexts/ExerciseContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SettingsHelpPopup from "@/components/ui/SettingsHelpPopup";

const Settings = () => {
  const { exercises, exportToCSV, importFromCSV, deleteAllExercises, reinstallAllExercises } = useExercise();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    try {
      setIsLoading(true);
      const csv = exportToCSV();

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gymdayfittracker-exercises-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Exercises exported successfully");
    } catch (error) {
      console.error("Error exporting exercises:", error);
      toast.error("Failed to export exercises");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSVClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        importFromCSV(csvContent);
      } catch (error) {
        console.error("Error reading CSV file:", error);
        toast.error("Failed to read the CSV file");
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteAllExercises = async () => {
    toast("Are you sure you want to delete all exercises? This action cannot be undone.", {
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            await deleteAllExercises();
            toast.success("All exercises deleted successfully");
          } catch (error) {
            console.error("Error deleting all exercises:", error);
            toast.error("Failed to delete all exercises");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleReinstallAllExercises = () => {
    reinstallAllExercises();
  };

  const handleBackupAllData = () => {
    try {
      setIsLoading(true);
      const allData = { ...localStorage };
      const jsonString = JSON.stringify(allData, null, 2);

      // Use Android SAF if available, otherwise use web implementation
      if (window.Android) {
        const date = new Date().toISOString().split("T")[0];
        const filename = `gymdayfittracker-backup-${date}.json`;
        window.Android.createBackupFile(jsonString, filename, 1001)
          .then((success) => {
            if (success) {
              toast.success("Backup successful");
            } else {
              toast.error("Failed to backup data");
            }
          })
          .catch((error) => {
            console.error("Backup failed:", error);
            toast.error("Failed to backup data");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Existing web implementation
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split("T")[0];
        const link = document.createElement("a");
        link.href = url;
        link.download = `gymdayfittracker-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Backup successful");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Backup failed:", error);
      toast.error("Failed to backup data");
      setIsLoading(false);
    }
  };

  const handleRestoreAllDataClick = () => {
    if (window.Android) {
      window.Android.openRestoreFile(1002)
        .catch((error) => {
          console.error("Error opening file picker:", error);
          toast.error("Failed to open file picker");
        });
    } else {
      restoreFileInputRef.current?.click();
    }
  };

  // Add handler for Android file selection callback
  React.useEffect(() => {
    if (window.Android) {
      window.Android.onFileSelected = (content: string) => {
        try {
          const json = JSON.parse(content);
          // Define expected keys and their default values
          const expectedKeys = {
            exercises: "[]",
            savedWorkoutTemplates: "[]",
            workouts: "[]",
            customPlans: "[]",
          };
          // Ensure all expected keys exist, filling in defaults if missing
          const restoredData = { ...json };
          Object.keys(expectedKeys).forEach((key) => {
            if (!(key in restoredData)) {
              restoredData[key] = expectedKeys[key];
            }
          });
          // Clear localStorage and restore the data
          localStorage.clear();
          Object.keys(restoredData).forEach((key) => {
            localStorage.setItem(key, restoredData[key]);
          });
          toast.success("Data restored successfully");
          window.location.reload();
        } catch (error) {
          console.error("Restore failed:", error);
          toast.error(`Failed to restore data: ${error instanceof Error ? error.message : "Invalid file"}`);
        }
      };
    }
  }, []);

  const handleRestoreFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Define expected keys and their default values
        const expectedKeys = {
          exercises: "[]",
          savedWorkoutTemplates: "[]",
          workouts: "[]",
          customPlans: "[]",
        };
        // Ensure all expected keys exist, filling in defaults if missing
        const restoredData = { ...json };
        Object.keys(expectedKeys).forEach((key) => {
          if (!(key in restoredData)) {
            restoredData[key] = expectedKeys[key];
          }
        });
        // Clear localStorage and restore the data
        localStorage.clear();
        Object.keys(restoredData).forEach((key) => {
          localStorage.setItem(key, restoredData[key]);
        });
        toast.success("Data restored successfully");
        window.location.reload();
      } catch (error) {
        console.error("Restore failed:", error);
        toast.error(`Failed to restore data: ${error instanceof Error ? error.message : "Invalid file"}`);
      } finally {
        setIsLoading(false);
        if (restoreFileInputRef.current) {
          restoreFileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    toast("Are you sure you want to delete all data? This action cannot be undone.", {
      action: {
        label: "Confirm",
        onClick: () => {
          try {
            setIsLoading(true);
            localStorage.clear();
            toast.success("All data deleted successfully");
            window.location.reload();
          } catch (error) {
            console.error("Delete all data failed:", error);
            toast.error("Failed to delete all data");
          } finally {
            setIsLoading(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="page-container page-transition">
      <SettingsHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-heading">Settings</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Backup & Restore Section */}
        <div className="card-glass p-4">
          <h2 className="text-lg font-medium mb-4">Backup & Restore</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Backup All Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Export all your app data (exercises, workouts, plans, and settings) as a JSON file for backup or transfer to another device.
              </p>
              <Button
                variant="default"
                onClick={handleBackupAllData}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Backup All Data
              </Button>
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Restore All Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Restore all app data from a previously exported JSON file. This will overwrite your current data.
              </p>
              <Button
                variant="perform"
                onClick={handleRestoreAllDataClick}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Restore All Data
              </Button>
              <input
                type="file"
                ref={restoreFileInputRef}
                accept=".json"
                onChange={handleRestoreFileChange}
                className="hidden"
              />
            </div>

            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Delete All Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This will permanently delete all app data (exercises, workouts, plans, and settings). This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="bg-red-700 hover:bg-red-800"
                onClick={handleDeleteAllData}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </div>
          </div>
        </div>

        {/* Exercises Data Section */}
        <div className="card-glass p-4">
          <h2 className="text-lg font-medium mb-4">Exercises Data</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Export Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Export all your exercises as a CSV file that you can backup or share.
              </p>
              <Button
                variant="default"
                onClick={handleExportCSV}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Import Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Import exercises from a CSV file. The file should have the columns: Name, Category, Muscle Groups, Equipment, Notes, Description, Picture URL.
              </p>
              <Button
                variant="perform"
                onClick={handleImportCSVClick}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import from CSV
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Reinstall All Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Reinstall all default exercises in all categories (Weights, Cardio, Slide Board, No Equipment). 
                This is useful if you've deleted exercises and want to get them back.
              </p>
              <Button
                variant="default"
                className="bg-gym-purple hover:bg-gym-purple/80"
                onClick={handleReinstallAllExercises}
              >
                <Download className="mr-2 h-4 w-4" />
                Reinstall All Exercises
              </Button>
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Delete All Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This will permanently delete all exercises. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="bg-red-700 hover:bg-red-800"
                onClick={handleDeleteAllExercises}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Exercises
              </Button>
            </div>
          </div>
        </div>
        
        <div className="card-glass p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="flex items-center gap-4 text-gray-300">
            <Info className="h-8 w-8 text-primary" />
            <div>
              <p className="font-bold text-lg">GymDayFitTracker</p>
              <p className="text-sm">Version 2.1</p>
            </div>
          </div>
          <p className="mt-4 text-gray-400">
            Track your workouts, monitor your progress, and achieve your fitness goals with GymDayFitTracker.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
