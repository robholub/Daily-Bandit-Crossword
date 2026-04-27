🦝 Daily Bandit: Infinite 3D Crossword PWA

Daily Bandit is a fully offline-capable, procedurally generated 10x10 crossword puzzle Progressive Web App (PWA). It features a 1,000+ word dictionary, cross-device cloud syncing, and a real-time, procedurally generated 3D mascot (Bandit the Raccoon) built natively with Three.js.

✨ Key Features

Infinite Procedural Puzzles: A built-in algorithm dynamically generates a unique 10x10 interlocking grid on the fly using a robust 1000+ word dictionary.

Smart Session Memory: The game remembers which words you've played. You won't see a repeated word until you've exhausted the entire dictionary.

Procedural 3D Mascot: Bandit the Raccoon is rendered in real-time using Three.js with Physically Based Rendering (PBR) noise-mapped fur, glassy eyes, and a skeletal-rigged animated thumbs-up when you win. (Zero external .gltf or .obj files required).

True Offline PWA: Uses Service Workers (sw.js) to cache the app shell and localStorage paired with Firebase's IndexedDB persistence to ensure the game loads instantly and saves progress even on airplane mode.

Custom Mobile Keyboard: Features a built-in DOM keyboard to prevent native OS keyboards from jumping, shifting, or shrinking the viewport, providing a true native-app feel.

Player Tools: Includes a 2-charge Hint System, an Error Checker to highlight incorrect letters, and a Give Up option.

🛠️ Tech Stack

Frontend: React (via Vite)

Styling: Tailwind CSS

3D Graphics: Three.js

Backend & Sync: Firebase (Auth & Firestore)

Offline Storage: IndexedDB + LocalStorage

PWA: Vanilla Service Worker + Web App Manifest

🚀 Getting Started (Local Development)

Clone the repository:

git clone [https://github.com/yourusername/bandits-crossword.git](https://github.com/yourusername/bandits-crossword.git)
cd bandits-crossword


Install dependencies:

npm install


Run the development server:

npm run dev


The app will be available at http://localhost:5173.

📱 Publishing to App Stores (Vercel + PWABuilder)

This project is pre-configured to be deployed as a native mobile application.

Deploy to Vercel:

Push your code to a GitHub repository.

Log into Vercel and click Add New Project.

Import your GitHub repository. Vercel will automatically detect Vite and deploy your site securely.

Package for iOS & Android:

Once your Vercel URL is live (e.g., https://your-crossword.vercel.app), copy the link.

Go to PWABuilder.com.

Paste your Vercel URL into the prompt.

PWABuilder will read the provided manifest.json and Service Worker.

Click Package for Stores to download your Android .aab file and iOS wrapper, ready for submission to Google Play and the Apple App Store.

🗂️ Project Structure

bandits-crossword/
├── public/
│   ├── icon-192.png          # App icon (Standard)
│   ├── icon-512.png          # App icon (High-res)
│   ├── manifest.json         # PWA configuration
│   └── sw.js                 # Service worker for offline caching
├── src/
│   ├── App.jsx               # Main game engine, 3D renders, and UI
│   ├── index.css             # Tailwind imports & global styles
│   └── main.jsx              # React mount point
├── index.html                # HTML shell & Three.js CDN import
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
└── vite.config.js            # Vite bundler configuration


🎨 Icon Generation

Because the mascot is dynamically generated in 3D, standard image icons aren't included by default. To generate them:

Open the included icon-generator.html utility in any web browser.

It will render the 3D Raccoon scene.

Click the download buttons to get perfect icon-192.png and icon-512.png assets.

Place those files inside the /public directory before deploying.

Built with React, Three.js, and a lot of coffee.
