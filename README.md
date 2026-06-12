# FitMyBall — Data-Driven Golf Ball Fitting

My purpose for this:

Current online golf ball fitters are inherently biased. When you use a specific manufacturer's tool, you are locked into a closed ecosystem; they will only recommend balls from their own lineup. This forces golfers to visit multiple sites, compare completely different metrics, and manually piece together their options, leaving them blind to better-fitting alternatives from competing brands. I got tired of having to go through all the websites, so I consolidate all into one.

FitMyBall is a premium, interactive web application that recommends the perfect golf ball for a player based on their unique swing characteristics, skill level, and personal preferences. 

Unlike basic static charts, this tool acts as a "virtual fitter" using a weighted scoring algorithm to rank 93 balls across 20 top brands, visualizing the results with custom trajectory paths and spec spectrums.

## Features
- **Advanced Scoring Algorithm:** Matches players based on estimated swing speed, budget constraints, typical misses, and prioritized attributes (e.g., Distance vs. Greenside Spin).
- **Dynamic Trajectory Visualizer:** Generates mathematical SVG curves showing how the recommended ball's flight path compares to the user's current ball.
- **Spec Spectrums:** Visual gradient bars mapping compression (feel) and greenside spin relative to the rest of the market.
- **Smart Deduplication:** Prevents users from selecting conflicting priorities in the UI.
- **Local Storage Persistence:** Automatically saves your fitting profile so you don't lose your data on refresh.
- **Compare Mode:** A detailed data table highlighting the strengths of the top 3 recommended balls.

## Project Structure
- `index.html`: The markup, structure, and Tailwind CSS implementation.
- `style.css`: Custom design tokens, complex background textures, custom form elements, and UI animations.
- `app.js`: The core Vanilla JavaScript logic, state management, algorithm, and dynamic rendering.
- `database.json`: The database of 93 golf balls containing real-world spec data (compression, rpm, cover type, target swing speed, etc.).

## Installation & Setup

Because this project fetches data from a local `database.json` file, you cannot simply double-click `index.html` to open it in a browser (due to browser CORS restrictions for local files). You need to run a local web server.

### Option 1: VS Code (Recommended)
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` and select **"Open with Live Server"**.

### Option 2: Python
If you have Python installed, open your terminal, navigate to the project directory, and run:
```bash
# For Python 3
python -m http.server 8000
```
Then, open your browser and go to `http://localhost:8000`.

### Option 3: Node.js
If you have Node.js installed, you can use `http-server`:
```bash
npx http-server
```

## Technologies Used
- **HTML5** & **Vanilla JavaScript (ES6)**
- **Tailwind CSS** (via CDN for prototyping)
- **Bing Image Search API** (Dynamic, keyless thumbnail generation)

## Future Roadmap
- Implement "Blind Fit" mode to remove brand bias.
- Add course condition toggles (e.g., Windy, Firm Greens) to adjust spin requirements dynamically.
