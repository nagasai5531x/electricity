# ⚡ VoltPulse - Electricity Consumption Dashboard
## Computer Science & Engineering Mini Project

> **Topic:** *Electricity Consumption Dashboard Using Tableau*  
> **Tagline:** *Visualising energy usage to support smarter decisions*  
> **Department:** Computer Science & Engineering  

---

## 🚀 Quick Start Guide

### 1. Launch the Interactive Web Dashboard
You can run the web application directly in any browser without needing to install Node.js, Python, or local web servers:
- **Direct Launch:** Double-click [`index.html`](file:///d:/miniprojecr/index.html) in your file manager, or open Microsoft Edge / Chrome and press `Ctrl + O` to open `d:\miniprojecr\index.html`.
- **Command Line Launch:**
  ```powershell
  Start-Process msedge "d:\miniprojecr\index.html"
  ```

### 2. Connect to Tableau Desktop / Tableau Public
1. Open Tableau Desktop or [Tableau Public (Free)](https://public.tableau.com/).
2. Click **Connect** &rarr; **Text file** &rarr; select [`electricity_consumption_data.csv`](file:///d:/miniprojecr/electricity_consumption_data.csv).
3. Follow the step-by-step instructions in [`TABLEAU_PROJECT_GUIDE.md`](file:///d:/miniprojecr/TABLEAU_PROJECT_GUIDE.md) to build the worksheets, calculated fields, and dashboard.

---

## 📁 Repository Structure & Deliverables

| File / Folder | Description |
| :--- | :--- |
| [`index.html`](file:///d:/miniprojecr/index.html) | **Main Web Dashboard**: Interactive, single-page application with 6 analytics tabs. |
| [`app.js`](file:///d:/miniprojecr/app.js) | Core analytics engine: calculations, Chart.js renderers, forecasting math, and telemetry simulator. |
| [`data.js`](file:///d:/miniprojecr/data.js) | Pre-packaged JSON dataset (5,840 records) for instantaneous zero-latency loading. |
| [`electricity_consumption_data.csv`](file:///d:/miniprojecr/electricity_consumption_data.csv) | Full 1-year smart meter dataset (5,840 rows, 21 columns) for Tableau and data science. |
| [`generate_data.ps1`](file:///d:/miniprojecr/generate_data.ps1) | PowerShell generator script to re-generate or customize synthetic dataset records. |
| [`styles.css`](file:///d:/miniprojecr/styles.css) | Custom styling, glassmorphism UI, dark theme, and print-ready CSS rules. |
| [`TABLEAU_PROJECT_GUIDE.md`](file:///d:/miniprojecr/TABLEAU_PROJECT_GUIDE.md) | Step-by-step manual for building the workbook and calculated fields in Tableau. |
| [`PROJECT_REPORT.md`](file:///d:/miniprojecr/PROJECT_REPORT.md) | Comprehensive academic report formatted for CSE mini-project evaluation. |
| [`PRESENTATION_SLIDES.md`](file:///d:/miniprojecr/PRESENTATION_SLIDES.md) | Slide-by-slide presentation notes and viva defense Q&A matching your PowerPoint template. |

---

## ✨ Features of the Application

1. **Executive KPI Scorecards:**
   - Total Energy Consumption (kWh & MWh)
   - Estimated Electricity Bill ($)
   - Peak Demand Active Power (kW)
   - System Power Factor ($\cos \phi$) with efficiency health indicators
   - Carbon Footprint ($tCO_2$) and mature tree offset requirement
   - Anomaly Spike Incident counter

2. **Interactive Visualizations:**
   - **Timeline Trend (Area/Line):** Monthly & daily aggregation with 5-point moving average trendlines.
   - **Peak vs. Off-Peak Donut:** Visualizes high-tariff ($14:00 - 21:00$) vs off-peak consumption.
   - **Sector Comparison (Bar Chart):** Residential, Commercial, Industrial, and Educational Campus.
   - **Regional Zone Loading:** Sub-station distribution (North, South, East, West).
   - **Appliance Disaggregation:** Horizontal bar and radar profile for HVAC, EV Charging, Water Heating, etc.
   - **24-Hour Weekly Heatmap:** $7 \times 24$ load density matrix (Monday to Sunday vs Hours 00 to 23).
   - **Power Quality Analysis:** Voltage stability ($220V \pm 10\%$) vs current draw, power factor distribution, and real vs reactive power scatter.

3. **Advanced Intelligence Modules:**
   - **Predictive Load Forecasting:** Statistical trend extrapolation for 7, 14, or 30 days ahead with 95% confidence intervals.
   - **Anomaly Detection Center:** Flags sudden power surges ($>2.5\sigma$) with diagnostic analysis and severity levels.
   - **Time-of-Use Tariff Simulator:** Interactive sliders to test custom utility rates and calculate cost savings from peak-load shifting.
   - **Live Smart Meter Simulator:** Toggles simulated live smart meter pings every 2.2 seconds to demonstrate real-time telemetry streaming!
   - **Custom CSV Upload:** Upload a CSV to see row and column counts, missing-cell totals, numeric statistics, and common categorical values. Files containing an `Energy_Consumed_kWh` or `Energy_kWh` column also update the electricity dashboard; other CSVs (such as battery datasets) get their own descriptive analysis without replacing the electricity data.
