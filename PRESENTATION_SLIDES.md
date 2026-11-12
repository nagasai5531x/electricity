# Mini Project Presentation Slides & Speaker Notes

---

## Slide 1: Title Slide
**MINI PROJECT PRESENTATION**  
### **Electricity Consumption Dashboard Using Tableau**  
*Visualising energy usage to support smarter decisions*

- **Presented by:** [Your Name / Roll No]
- **Department:** Computer Science & Engineering
- **College:** [Your College Name]
- **Keywords:** Tableau | Data Analytics | Business Intelligence | Smart Grid

> **Speaker Notes:**  
> "Good morning respected professors and evaluators. Today, I am presenting my mini-project titled **'Electricity Consumption Dashboard Using Tableau'** with the subtitle *'Visualising energy usage to support smarter decisions'*. This project addresses the challenge of analyzing granular electricity usage to promote efficiency, reduce bills, and detect power anomalies."

---

## Slide 2: Introduction
- Electricity is an indispensable resource powering homes, commercial offices, and industrial complexes.
- With modern smart meters, massive quantities of electrical data are captured every hour.
- However, consumption data is predominantly archived in tabular spreadsheets and relational databases, making long-term patterns, unexpected spikes, and high-tariff intervals difficult to detect.
- **The Solution:** Leveraging Tableau's visual analytics and web-based interactive dashboards to transform raw numerical readings into actionable intelligence.

---

## Slide 3: Problem Statement
- **Retrospective Billing:** Consumers only see high electricity bills after the billing cycle ends, without understanding which appliances caused the surge.
- **Hidden Peak Demand Charges:** Commercial and residential tariffs penalize usage during peak hours ($14:00 - 21:00$), but consumers lack real-time visibility into these windows.
- **Undetected Equipment Faults & Leaks:** Malfunctioning HVAC units, insulation leaks, and power surges go unnoticed until catastrophic breakdown.
- **Power Quality Ignorance:** Low power factor ($\cos \phi < 0.85$) leads to utility surcharges and grid inefficiencies.

---

## Slide 4: Project Objectives
1. Collect and preprocess high-resolution smart meter telemetry covering active power, reactive power, voltage, current, and power factor.
2. Build an interactive, production-ready **Tableau Dashboard** featuring calculated fields, dynamic parameters, and filter actions.
3. Complement the Tableau workbook with **VoltPulse**, a standalone interactive web application featuring real-time telemetry simulation.
4. Formulate automated **Anomaly Detection** algorithms to catch electrical surges.
5. Implement **Predictive Load Forecasting** (7 to 30 days ahead) using statistical trend models.
6. Provide a **Time-of-Use Tariff Simulator** to demonstrate monetary savings through load shifting.

---

## Slide 5: Dataset Schema & Parameters
The project dataset (`electricity_consumption_data.csv`) encompasses **5,840 records** spanning 1 full calendar year with 21 attributes:
- **Temporal Dimensions:** `Timestamp`, `Date`, `Hour`, `DayOfWeek`, `Month`, `Season`
- **Spatial & Categorical:** `Sector` (Residential, Commercial, Industrial, Campus), `Zone` (North, South, East, West), `Appliance`
- **Electrical Metrics:** `Voltage_V` (nominal 220V), `Current_A`, `Power_Factor` ($\cos \phi$), `Active_Power_kW`, `Reactive_Power_kVAR`
- **Financial & Environmental:** `Energy_Consumed_kWh`, `Tariff_Rate_per_kWh`, `Cost_USD`, `Peak_Status`, `CO2_Emissions_kg`, `Anomaly_Flag`

---

## Slide 6: System Architecture & Workflow
```
[ Smart Meter Readings ]
          │
          ▼
[ Data Preprocessing & Feature Engineering ]
   ├── Energy (kWh) = Active Power (kW) × Hours
   ├── Cost ($) = Energy × Time-of-Use Tariff
   └── CO2 (kg) = Energy × 0.475 kg/kWh
          │
          ├────────────────────────┐
          ▼                        ▼
[ Tableau Desktop / Public ]   [ VoltPulse Web Dashboard ]
   • Interactive Worksheets       • 6 Dynamic KPI Scorecards
   • Filter & Highlight Actions   • 24-Hr Weekly Heatmap
   • Story Points                 • Tariff & ROI Simulator
   • Parameter Controls           • Real-Time Telemetry Feed
          │                        │
          └───────────┬────────────┘
                      ▼
       [ Energy Conservation & Cost Savings ]
```

---

## Slide 7: Core Visualizations in Tableau
1. **Executive KPI Cards:** Total Energy (MWh), Estimated Cost ($), Peak Demand (kW), Power Factor Health, Trees Offset.
2. **Timeline Trend (Area/Line Chart):** Multi-scale continuous trend displaying seasonal demand peaks (summer AC vs winter heating) with rolling moving average.
3. **Peak vs. Off-Peak Donut:** Visualizes proportion of energy consumed during premium peak tariff slots ($14:00 - 21:00$).
4. **Sector Comparative Bar Chart:** Compares load distribution between Industrial, Commercial, Residential, and Educational Campus sectors.

---

## Slide 8: 24-Hour Weekly Heatmap & Appliance Disaggregation
- **$7 \times 24$ Weekly Heatmap Matrix:** 
  - Columns: Hours $00:00$ to $23:00$; Rows: Monday through Sunday.
  - Color gradient instantly exposes uncharacteristic weekend baseline loads and peak afternoon thermal surges.
- **Appliance Disaggregation:** 
  - Identifies that HVAC / Air Conditioning and Industrial Machinery account for over **58%** of total energy demand.

---

## Slide 9: Power Quality & Anomaly Detection
- **Voltage Stability Tracking:** Ensures voltage stays within nominal grid safety thresholds ($220V \pm 10\%$).
- **Power Factor ($\cos \phi$) Gauge:** Flags inductive loads causing reactive power waste.
- **Automated Anomaly Detection Engine:**
  - Evaluates deviation: Flagged if Active Load $> 2.5 \times$ baseline mean.
  - Severity classification: `CRITICAL` ($>70 \text{ kW}$) vs `HIGH`.
  - Diagnoses possible causes: Sudden motor surges, insulation failure, or phase imbalance.

---

## Slide 10: Interactive Tariff & Cost Simulator
- Allows consumers to input their utility's Time-of-Use rates (Base Rate, Peak Rate, Peak Hours window).
- **What-If Load Shifting Simulation:**
  - Shifting **15%** of non-critical appliance usage (EV charging, water heaters) from peak to off-peak slots saves **$730.00 / month (15.1% reduction)** on electricity bills without sacrificing operational productivity.

---

## Slide 11: Predictive Load Forecasting & Sustainability
- **AI Trend & Exponential Smoothing:**
  - Generates 7-day, 14-day, and 30-day forward demand projections with upper and lower 95% confidence intervals.
  - Enables facility managers to procure energy contracts at optimal forward market rates.
- **Environmental Carbon Accounting:**
  - Converts every $\text{kWh}$ into greenhouse gas equivalents ($0.475 \text{ kg } CO_2/\text{kWh}$).
  - Displays equivalent tree planting quotas required for net-zero carbon neutrality.

---

## Slide 12: Results & Impact
| Metric | Before Dashboard Insights | After Optimization (15% Shift) | Improvement |
| :--- | :--- | :--- | :--- |
| **Peak Demand Draw** | 92.4 kW | 76.1 kW | **17.6% Peak Shaving** |
| **Monthly Cost** | \$4,850.00 | \$4,120.00 | **15.1% Cost Savings** |
| **Power Factor Penalty** | \$185.00/mo | \$0.00 (Capacitor tuning) | **100% Surcharge Elimination** |
| **Carbon Output** | 82.4 tCO2 | 75.8 tCO2 | **6.6 Tons CO2 Saved** |

---

## Slide 13: Conclusion & Future Scope
### Conclusion
- Successfully built an end-to-end data analytics and visualization system for electricity consumption using **Tableau** and **VoltPulse Web Suite**.
- Proved that visual feedback enables actionable peak-load shifting, anomaly detection, and substantial cost reduction.

### Future Work
- Integration with live IoT smart meters (ESP32/Zigbee) via WebSockets.
- Deep learning load forecasting using LSTM neural networks.
- Automated IoT demand response triggers to switch off flexible loads during peak tariff spikes.

---

## Slide 14: Questions & Answers (Viva Defense)
- *Thank you for your time and guidance!*
- Ready for questions from the evaluation committee.
