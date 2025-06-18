
interface AndroidBridge {
  createBackupFile(jsonString: string, filename: string, requestCode: number): Promise<boolean>;
  openRestoreFile(requestCode: number): Promise<void>;
  onFileSelected?: (content: string) => void;
}

declare interface Window {
  Android?: AndroidBridge;
}
