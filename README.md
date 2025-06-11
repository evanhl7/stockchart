# Stock Visualizer

This project is a browser-based stock visualizer that renders interactive technical charts from historical stock data on an HTML5 canvas. The main visualizations include:

* **Candlestick charts** for daily open, high, low, and close prices.
* **Simple Moving Averages** for 5, 10, and 30-day periods.
* **MACD (Moving Average Convergence Divergence)** and Signal lines.
* **Crosshair tracking** to inspect values under the mouse.

## Features

* **Interactive chart:** Move your mouse over the canvas to view precise price and indicator values.
* **Zoom control:** Use the mouse scroll wheel to zoom in and out on the time axis.
* **Responsive design:** The canvas resizes with the browser window.

## File Structure

* `index.html`: Main HTML file that loads the canvas
* `index.js`: Javascript file that contains the logic and develops the canvas.
* `style.css`: (Optional) CSS file for styling (not required for basic functionality).

## How It Works

1. On page load, the app fetches and parses stock data from a server.
2. It computes moving averages (5, 10, 30-day) and MACD indicators.
3. The canvas is drawn with dynamic gridlines, candlesticks, and average lines.
4. Crosshair interactivity enables real-time tracking of specific data points.

## Technical Indicators Implemented

### Moving Averages (A5, A10, A30)

* Calculated using a sliding window technique for efficient performance.

### MACD and Signal Line

* Uses exponential moving averages for periods of 12 and 26.
* Signal line is the 9-period EMA of the MACD line.
* MACD histogram (MACD - Signal) is also computed.

## License

This project is open-source and free to use for educational or personal analysis purposes.

---

**Note:** This is a client-side-only application. It does not perform any server-side data processing or storage.
