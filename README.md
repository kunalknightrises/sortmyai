# SortMyAI

A platform for AI content creators to track tools and showcase their portfolio.

## Prerequisites

- Node.js 18+ and npm (Install from [nodejs.org](https://nodejs.org))
- Firebase CLI (`npm install -g firebase-tools`)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyCSSBKFkrnBoK0b1Y3RmA97WdwcY9YLKcA
   VITE_FIREBASE_AUTH_DOMAIN=smai-og.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=smai-og
   VITE_FIREBASE_STORAGE_BUCKET=smai-og.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=220186510992
   VITE_FIREBASE_APP_ID=1:220186510992:web:3d9e07c3df55d1f4ea7a15
   VITE_FIREBASE_MEASUREMENT_ID=G-4MR0WK595H
   ```

4. Initialize Firebase:
   ```bash
   firebase login
   firebase init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/src` - Source code
  - `/components` - Reusable React components
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and configurations
  - `/pages` - Page components
  - `/types` - TypeScript type definitions

## Key Features

- Authentication with email/password, Google, GitHub, and Twitter
- AI tool tracking and management
- Portfolio showcase with Instagram-style view
- Premium features including Claude 3.5 Sonnet integration

## Development

The project uses:
- React 18 with TypeScript
- Vite for build tooling
- Firebase for backend services
- TailwindCSS for styling
- Radix UI for accessible components

## Firebase Configuration

The application uses the following Firebase services:
- Authentication
- Firestore Database
- Storage
- Analytics
- Performance Monitoring

Make sure to configure security rules in:
- `firebase.rules.json` for Firestore rules
- `storage.rules` for Storage rules

## Type Checking

Run type checks with:
```bash
npm run typecheck
```

## Building for Production

Build the project with:
```bash
npm run build
```

Deploy to Firebase Hosting:
```bash
firebase deploy
```