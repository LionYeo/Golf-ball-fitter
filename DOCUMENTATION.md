# FitMyBall: Technical & Logic Documentation

## 1. System Architecture
FitMyBall is a Single Page Application (SPA) built without heavy frontend frameworks. It utilizes a **Separation of Concerns** architecture:
*   **Presentation Layer:** `index.html` & `style.css` (Tailwind + Custom CSS).
*   **Data Layer:** `database.json` (A flat-file JSON repository of 93 golf balls).
*   **Logic/Controller Layer:** `app.js` (Handles data fetching, algorithm execution, and DOM manipulation).

---

## 2. The Fitting Engine (Algorithm)
The core of the application relies on a weighted algorithm that assigns a mathematical `_score` to every ball in the database. The algorithm assesses balls across 6 key metrics.

### 2.1 Swing Speed Estimation & Matching
Because amateur golfers rarely know their exact swing speed in MPH, the system estimates it by averaging their Driver and 7-Iron distances:
*   **< 200m Driver / < 130m Iron:** `Slow` (~80 mph)
*   **240-275m Driver / 150-170m Iron:** `Fast` (~102 mph)
*   **275+m Driver / 170+m Iron:** `Tour` (~112 mph)

**Scoring:** 
If a ball's target swing speed perfectly matches the player's bracket, it receives **+15 points**. If it falls slightly outside the optimal range (within 5 mph), it receives **+8 points**. Severe mismatches are penalized with **-10 points**.

### 2.2 Skill Level (Average Score) Profiling
The system checks compression and greenside spin against the user's average score:
*   **Beginners (100+):** Rewarded (+8 pts) for very low compression (<= 70) which helps get the ball airborne.
*   **Low Handicaps (< 80):** Rewarded (+8 pts) for high greenside spin (>= 8000 RPM) for elite short-game control.

### 2.3 The Weighted Priority System
Users select their top 3 performance priorities. The engine applies a multiplier based on the rank:
*   **Priority 1:** Multiplier x3
*   **Priority 2:** Multiplier x2
*   **Priority 3:** Multiplier x1

**Example Calculations:**
*   *Distance Priority:* Evaluates `driver_spin_rpm`. Lower spin yields higher scores `((3200 - ball.driver_spin) / 100) * weight`.
*   *Feel Priority:* Evaluates `compression_rating`. Lower compression yields higher scores `((110 - ball.compression) / 5) * weight`.
*   *Workability Priority:* Evaluates both driver and greenside spin, rewarding higher spin across the board to allow for intentional shot shaping.

### 2.4 Miss Correction (Dispersion)
If a player struggles with a slice or hook ("Big Curve"), the algorithm heavily favors low driver spin. Balls with Driver RPMs over 3000 are penalized, while sub-2450 RPM balls are rewarded.

### 2.5 Budget Asymmetry
Golfers generally treat budgets as a ceiling rather than a strict range. Therefore, the algorithm uses an asymmetric penalty system:
*   If the ball matches the budget tier: **+8 points**
*   If the ball is *more expensive* than the budget: **Heavy Penalty** (`difference * 15`)
*   If the ball is *cheaper* than the budget: **Light Penalty** (`difference * 2`)

---

## 3. Dynamic Visualizations
Instead of displaying raw numbers, `app.js` generates mathematical visualizations on the fly to help users intuitively understand the data.

### 3.1 Spec Spectrums
A function maps raw integer data onto a 0-100% scale and generates a custom HTML gradient bar.
*   **Compression:** Mapped from 35 (Soft) to 110 (Firm).
*   **Spin:** Mapped from 6000 RPM (Low) to 9000 RPM (High).
*   **Current Ball Tracking:** If the user inputs their current ball, a secondary grey marker is drawn on the same axis, showing the exact delta between their current setup and the recommended one.

### 3.2 Trajectory Visualizer (SVG)
The app generates an inline `<svg>` using a Quadratic Bezier Curve (`Q`) to simulate ball flight.
*   **Peak Height:** Inversely correlated to Driver Spin RPM (Lower spin = lower, more penetrating flight).
*   **Roll Out:** Correlated to carry and spin.
*   **Animation:** Uses CSS `@keyframes stroke-dashoffset` to smoothly "draw" the trajectory path when the card enters the viewport.

---

## 4. UI/UX Details
*   **Error Handling & Fallbacks:** If a high-resolution ball image fails to load via the Bing query, an inline `onerror` attribute cleanly removes the `<img />` tag and swaps in a dynamically generated pure-SVG golf ball with the correct brand logo colors.
*   **Responsive State Handling:** Toggle buttons dynamically swap out DOM visibility classes (`.hidden`) to transition between the Grid Card layout and the Comparison Table layout without reloading the page.
*   **Persistence:** `saveToStorage()` and `restoreFromStorage()` utilize the browser's `localStorage` API. Upon every `change` event in the form, the current state is stringified and saved, preventing data loss on accidental refreshes.