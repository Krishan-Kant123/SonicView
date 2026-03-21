# SonicView Software Requirements Specification (SRS)

## 1. Introduction
**Project Name**: SonicView
**Purpose**: A highly optimized, audio-first music streaming hub built on top of the YouTube Data API. It curates trending and searchable music videos into a seamless, Spotify-like native mobile and desktop web experience.
**Key Objective**: Deliver premium, uninterrupted playback capable of surviving modern OS background execution limits while providing a visually stunning, glassmorphic UI.

---

## 2. Technical Stack
- **Framework & Routing**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (PostCSS), Framer Motion (Animations), Lucide React (Icons)
- **State Management**: Zustand (with Persist middleware for `localStorage`)
- **Media Engine**: React-YouTube (Iframe API wrapper) with custom native bridging ([playerBridge.ts](file:///c:/Users/krishan%20kant/Desktop/demoes/music/src/lib/playerBridge.ts))
- **Data Source**: YouTube Data API v3 (strictly filtered to Music Category `10`), Wikipedia API (Artist metadata)

---

## 3. Implemented Features (Current State)

### 3.1 Core Music Discovery
- **Trending Feed**: Fetches Top 50 trending music videos by region natively on the `/` route.
- **Search Engine**: Dedicated `/search` route strictly scoped to music queries for accurate discovery.
- **Artist Metadata**: Real-time fetching of artist portraits from Wikipedia to replace generic album art when browsing.

### 3.2 Advanced Playback Engine (The "Secret Sauce")
- **Headless Audio Execution**: Uses a $1 \times 1$ pixel invisible `<YouTube />` iframe.
- **Dynamic Quality Scaling**: Forces data savings (e.g., `small`, `medium`) since visual video data is ignored in the player mode.
- **Continuous Background Autoplay**: Solved strict iOS/Android web suspension via a silent, looping HTML5 `<audio>` track. Tricking the OS into maintaining an active CoreAudio lock.
- **Native Player Commands**: Direct `loadVideoById` dispatching across track boundaries to securely prevent iframe destruction during Queue transitions.

### 3.3 Seamless UI & Controls
- **Mobile Bottom Sheet**: A sleek, sticky mini-player that morphs fluidly into a full-screen, glassmorphic, immersive Spotify-style dashboard.
- **Smart Queue**: Features Up Next generation via 'Related Tracks', shuffling (Fisher-Yates algorithm), repeating individual tracks, and queue injection ([moveTrackToNext](file:///c:/Users/krishan%20kant/Desktop/demoes/music/src/store/player.store.ts#138-156)).
- **OS Media Sessions**: Deeply integrates with `navigator.mediaSession` displaying title, artist, 480p artwork, and a functional progress scrubber on device Lock Screens and Notification Centers.
- **Custom Playlists**: Dedicated `/playlists` route. Store curated tracks locally.
- **Aesthetic Polish**: Modern visualizers, rotating vinyl record animations, and completely hidden browser scrollbars globally.

---

## 4. Key Architectural Decisions (What is Important)
1. **Separation of Intent vs. Action**: Utilizing the custom [playerBridge.ts](file:///c:/Users/krishan%20kant/Desktop/demoes/music/src/lib/playerBridge.ts) module. By separating Zustand state (`isPlaying`) from the actual physical execution of the Iframe (`playerBridge.play()`), we bypass asynchronous React render delays that typically crash mobile media permissions.
2. **Offline-Tolerant State**: Using Zustand's `persist` middleware currently ensures Playlists, History, and Settings are instantly available via `localStorage` on page load, requiring zero network round-trip.
3. **Event-Driven Resilience**: Leveraging Document `visibilitychange` to explicitly force-resume backgrounded iframes that the OS may have throttled when opening the app again.

---

## 5. Future Roadmap & Additional Features

### 5.1 Authentication (OAuth 2.0 Integration)
- **Feature**: Implement Google, Apple, or GitHub single sign-on (SSO).
- **Implementation Strategy**: Integrate **NextAuth.js (Auth.js)** for secure, session-based JWT tokens storing user identities against a Cloud Database.

### 5.2 Cloud Database Migration (`PostgreSQL` / `MongoDB`)
- **Feature**: Sync playlists, favorites, and play history securely across multiple devices instantly instead of resting solely on a single browser's memory.
- **Implementation Strategy**: Build standard REST/GraphQL CRUD Next.js Route Handlers targeting a database layer (e.g., using Prisma ORM with Supabase/Neon).

### 5.3 Offline-First Architecture ("Optimistic UI")
- **Feature**: The app currently relies heavily on `localStorage`. When the cloud DB is added, we **will not drop `localStorage`**.
- **Implementation Strategy**: 
  - On launch, the UI will instantly hydrate the User's Playlists and Queue from the lightning-fast `localStorage`.
  - In the background, it will quietly synchronize data against the Cloud Database.
  - If the user sits on a slow 3G cellular connection, or is briefly offline, the app executes perfectly using the local cache, then pushes updates (like adding a song to a playlist) to the cloud automatically once signal is restored. 
  - *This guarantees the app always feels instant, exactly like Spotify's underlying architecture.* 
