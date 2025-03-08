# GTuner - Guitar Tuner App

A modern guitar tuner web application built with Vue.js and Tailwind CSS, featuring a sleek dark theme.

## Features

- Real-time pitch detection
- Visual tuning meter
- Frequency visualization
- Customizable A4 reference frequency
- Dark theme with Tailwind CSS
- Modern, responsive UI

## Technologies Used

- Vue.js 3 (Composition API)
- Tailwind CSS
- Vite for fast development
- Aubio.js for audio processing
- SweetAlert2 for notifications

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## GitHub Pages Deployment

This project is set up with GitHub Actions for automatic deployment to GitHub Pages.

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy your app
3. Your app will be available at `https://[your-username].github.io/gtuner/`

To manually deploy:

```bash
# Build for production
npm run build

# Deploy to GitHub Pages (if you're using gh-pages package)
npm run deploy
```

## Usage

1. Allow microphone access when prompted
2. Play a note on your guitar
3. The app will detect the note and show how close it is to being in tune
4. Adjust your guitar strings until the meter is centered

## Development

This project was migrated from vanilla JavaScript to Vue.js with Tailwind CSS. The code is organized as follows:

- `src/App.vue` - Main Vue component
- `src/utils/` - Utility functions for tuner, notes, and frequency bars
- `src/style.css` - Tailwind CSS styles

The online tuner based on web audio api: [https://qiuxiang.github.io/tuner/app](https://qiuxiang.github.io/tuner/app/).

![](https://user-images.githubusercontent.com/1709072/30374834-e23d0bc2-98b8-11e7-91ae-8ac37bfd24b2.png)
