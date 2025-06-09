// Global type declarations

// Google Analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      ...args: any[]
    ) => void;
  }
}

// Timer types fix
declare global {
  type TimerId = ReturnType<typeof setTimeout>;
}

export {};