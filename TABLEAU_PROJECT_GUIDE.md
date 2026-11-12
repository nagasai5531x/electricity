# Tableau Project Implementation Guide
## Project: Electricity Consumption Dashboard Using Tableau
**Department:** Computer Science & Engineering &bull; Mini Project

---

## 1. Overview & Dataset Connection
This guide provides step-by-step instructions for importing and building the **Electricity Consumption Dashboard** in **Tableau Desktop** or **Tableau Public** using the provided `electricity_consumption_data.csv`.

### Step 1.1: Connect Data Source in Tableau
1. Open **Tableau Desktop** or **Tableau Public**.
2. Under **Connect** &rarr; **To a File**, select **Text file**.
3. Choose `electricity_consumption_data.csv` located in the project directory.
4. Verify the data preview in the Data Source pane. Tableau will detect 5,840 records across 21 columns.

### Step 1.2: Verify Field Data Types
Ensure each column is mapped to its appropriate data type:
- `Timestamp`: **Date & Time**
- `Date`: **Date**
- `Hour`: **Number (whole)** &rarr; Drag to Dimension
- `Sector`: **String (Dimension)**
- `Zone`: **String (Dimension)**
- `Appliance`: **String (Dimension)**
- `Active_Power_kW`: **Number (decimal) &rarr; Measure**
- `Energy_Consumed_kWh`: **Number (decimal) &rarr; Measure**
- `Cost_USD`: **Number (decimal) &rarr; Currency ($)**
- `Power_Factor`: **Number (decimal) &rarr; Measure**
- `CO2_Emissions_kg`: **Number (decimal) &rarr; Measure**
- `Peak_Status`: **String (Dimension)**
- `Anomaly_Flag`: **String (Dimension)**

---

## 2. Tableau Calculated Fields (Formulas)
Create the following calculated fields in Tableau (Right-click in Data Pane &rarr; **Create Calculated Field**):

### 1. Total Consumption (MWh)
```tableau
// Converts sum of kWh to Megawatt-hours for high-level KPI cards
SUM([Energy_Consumed_kWh]) / 1000
```

### 2. Peak vs. Off-Peak Indicator (Dynamic)
```tableau
// Identifies high-tariff time window (14:00 to 21:00)
IF DATEPART('hour', [Timestamp]) >= 14 AND DATEPART('hour', [Timestamp]) <= 21 
THEN 'Peak Hours' 
ELSE 'Off-Peak Hours' 
END
```

### 3. Dynamic Cost Calculation ($)
```tableau
// Computes tariff cost based on peak vs off-peak rates
SUM([Energy_Consumed_kWh]) * 
IF [Peak_Status] = 'Peak' THEN 0.24 ELSE 0.12 END
```

### 4. Power Factor Quality Rating
```tableau
// Categorizes power factor health
IF AVG([Power_Factor]) >= 0.90 THEN 'Optimal (cos φ)'
ELSEIF AVG([Power_Factor]) >= 0.82 THEN 'Sub-Optimal (Warning)'
ELSE 'Critical (Utility Penalty Risk)'
END
```

### 5. Carbon Offset Tree Equivalent
```tableau
// Number of mature trees required to absorb CO2 emissions
ROUND(SUM([CO2_Emissions_kg]) / 21.77, 0)
```

### 6. Anomaly Filter Flag
```tableau
// Boolean indicator for power surges
[Anomaly_Flag] = 'Yes'
```

---

## 3. Creating Visualizations (Worksheets)

### Worksheet 1: Energy Usage Trend Over Time (Line Chart)
- **Columns:** `Timestamp` (Continuous, set to Month or Day).
- **Rows:** `SUM([Energy_Consumed_kWh])`.
- **Marks:** Line (Color: Teal/Cyan `#06b6d4`).
- **Trendline:** Right-click canvas &rarr; **Show Trend Lines** (Polynomial or Linear).
- **Tooltip:** Include Date, kWh, and Cost.

### Worksheet 2: Peak vs. Off-Peak Distribution (Donut Chart)
- **Rows:** Create two placeholder rows: `MIN(0)` and `MIN(0)` (Dual Axis).
- **Marks (First Axis):** 
  - Mark Type: **Pie**
  - Color: `Peak_Status`
  - Angle: `SUM([Energy_Consumed_kWh])`
- **Marks (Second Axis):**
  - Mark Type: **Circle** (White/Background color) to create hollow donut hole.
  - Label: `SUM([Energy_Consumed_kWh])` (Percent of Total).

### Worksheet 3: Consumption by Sector (Horizontal Bar Chart)
- **Columns:** `SUM([Energy_Consumed_kWh])`.
- **Rows:** `Sector` (Sorted Descending).
- **Color:** `Sector` (Discrete palette: Blue, Teal, Amber, Purple).
- **Labels:** Show `SUM([Energy_Consumed_kWh])` in kWh.

### Worksheet 4: 24-Hour Weekly Load Heatmap
- **Columns:** `Hour` (Discrete Dimension 0 to 23).
- **Rows:** `DayOfWeek` (Monday to Sunday).
- **Marks:** Square.
- **Color:** `AVG([Active_Power_kW])` using **Orange-Blue Diverging** or **Red-Cyan** palette.
- **Purpose:** Reveals high-load energy spikes during peak afternoon slots.

### Worksheet 5: Appliance Disaggregation (Treemap / Bar)
- **Columns:** `SUM([Energy_Consumed_kWh])`.
- **Rows:** `Appliance`.
- **Marks:** Bar (Sorted descending).
- **Color:** `AVG([Active_Power_kW])`.

---

## 4. Dashboard Assembly & Interactivity

### Dashboard Layout Structure:
- **Canvas Size:** Fixed `1366 x 768` or `Automatic`.
- **Top Header Banner:** Title, Subtitle, and Live Filter Controls (Sector, Season, Peak).
- **Row 1 (KPI Cards):** 4 Cards: Total Energy (MWh), Total Cost ($), Peak Demand (kW), Trees Offset.
- **Row 2 (Main Visuals):** 
  - Left (60% width): Energy Usage Trendline.
  - Right (40% width): Peak vs Off-Peak Donut.
- **Row 3 (Detailed Breakdown):**
  - Left (50% width): 24-Hour Weekly Heatmap.
  - Right (50% width): Appliance & Sector Comparison.

### Dashboard Actions (Interactivity):
1. **Filter Action (Cross-Filtering):**
   - Source: `Sector Bar Chart`
   - Target: `All other sheets`
   - Run action on: `Select`
   - Clearing selection will: `Show all values`
2. **Highlight Action:**
   - Source: `Heatmap`
   - Target: `Trendline`
   - Highlight on: `Hour`

---

## 5. Publishing to Tableau Public
1. In Tableau, navigate to **Server** &rarr; **Tableau Public** &rarr; **Save to Tableau Public As...**
2. Sign in with your free Tableau Public account.
3. Set the workbook title: `Electricity Consumption Dashboard - Mini Project`.
4. Add tags: `#EnergyAnalytics #SmartGrid #TableauMiniProject #DataVisualization`.
5. Embed or paste the published link in your project report and presentation!
