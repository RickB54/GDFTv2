
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Exercise } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidImageUrl(exercise: Exercise): string | undefined {
  // Return the pictureUrl or thumbnailUrl if either exists
  return exercise.pictureUrl || exercise.thumbnailUrl;
}

/**
 * Gets the appropriate image URL for an exercise
 * Returns the exercise image if available, or empty string if no image
 */
export function getExerciseImageUrl(exercise: Exercise): string {
  // If the exercise has a valid image URL, use it
  if (exercise.pictureUrl || exercise.thumbnailUrl) {
    return exercise.pictureUrl || exercise.thumbnailUrl || "";
  }
  
  // Return empty string if no image available
  return "";
}
