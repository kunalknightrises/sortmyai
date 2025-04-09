/// <reference types="@firebase/app-types" />
/// <reference types="@firebase/auth-types" />
/// <reference types="@firebase/firestore-types" />
/// <reference types="@firebase/storage-types" />

declare module 'firebase/app' {
  export * from '@firebase/app';
}

declare module 'firebase/auth' {
  export * from '@firebase/auth';
}

declare module 'firebase/firestore' {
  export * from '@firebase/firestore';
}

declare module 'firebase/storage' {
  export * from '@firebase/storage';
}

declare module 'firebase/analytics' {
  export * from '@firebase/analytics';
}

declare module 'firebase/performance' {
  export * from '@firebase/performance';
}

// Add explicit type exports
declare module 'firebase' {
  export * from '@firebase/app-types';
  export * from '@firebase/auth-types';
  export * from '@firebase/firestore-types';
  export * from '@firebase/storage-types';
}