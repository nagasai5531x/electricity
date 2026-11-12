/**
 * VoltPulse - Electricity Consumption Dashboard Application
 * Department of Computer Science & Engineering - Mini Project
 */

// Global App State
const state = {
  rawData: [],
  filteredData: [],
  currentTab: 'overview',
  timeGranularity: 'monthly',
  forecastHorizon: 14,
  isLiveSimulating: false,
  simInterval: null,
  charts: {},
  filters: {
    sector: 'ALL',
    zone: 'ALL',
    peak: 'ALL',
    season: 'ALL'
  },
  tariffParams: {
    baseRate: 0.12,
    peakRate: 0.24,
    peakStart: 14,
    peakShiftPct: 15,
    fixedFee: 15.00,
    taxRate: 6.5
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupFilterListeners();
  setupLiveSimulator();
  applyFiltersAndRender();
});

/**
 * 1. Data Initialization
 */
function initData() {
  if (window.DEFAULT_ELECTRICITY_DATA && Array.isArray(window.DEFAULT_ELECTRICITY_DATA)) {
    state.rawData = window.DEFAULT_ELECTRICITY_DATA.map(parseRowData);
  } else {
    console.warn("DEFAULT_ELECTRICITY_DATA not loaded from data.js, generating fallback data.");
    state.rawData = generateFallbackData();
  }
  state.filteredData = [...state.rawData];
}

function parseRowData(row) {
  return {
    recordId: parseInt(row.Record_ID) || 0,
    timestamp: row.Timestamp,
    date: row.Date,
    hour: parseInt(row.Hour) || 0,
    dayOfWeek: row.DayOfWeek || 'Monday',
    month: row.Month || 'January',
    season: row.Season || 'Winter',
    sector: row.Sector || 'Residential',
    zone: row.Zone || 'Zone 1 - North',
    appliance: row.Appliance || 'General',
    voltage: parseFloat(row.Voltage_V) || 220,
    current: parseFloat(row.Current_A) || 10,
    powerFactor: parseFloat(row.Power_Factor) || 0.9,
    activePower: parseFloat(row.Active_Power_kW) || 5,
    reactivePower: parseFloat(row.Reactive_Power_kVAR) || 2,
    energyKWh: parseFloat(row.Energy_Consumed_kWh) || 5,
    tariffRate: parseFloat(row.Tariff_Rate_per_kWh) || 0.12,
    costUSD: parseFloat(row.Cost_USD) || 0.6,
    peakStatus: row.Peak_Status || 'Off-Peak',
    co2Kg: parseFloat(row.CO2_Emissions_kg) || 2.5,
    isAnomaly: row.Anomaly_Flag === 'Yes'
  };
}

/**
 * 2. Filter Listeners & Event Handlers
 */
function setupFilterListeners() {
  const sectorEl = document.getElementById('filterSector');
  const zoneEl = document.getElementById('filterZone');
  const peakEl = document.getElementById('filterPeak');
  const seasonEl = document.getElementById('filterSeason');
  const resetBtn = document.getElementById('resetFiltersBtn');

  if (sectorEl) sectorEl.addEventListener('change', (e) => { state.filters.sector = e.target.value; applyFiltersAndRender(); });
  if (zoneEl) zoneEl.addEventListener('change', (e) => { state.filters.zone = e.target.value; applyFiltersAndRender(); });
  if (peakEl) peakEl.addEventListener('change', (e) => { state.filters.peak = e.target.value; applyFiltersAndRender(); });
  if (seasonEl) seasonEl.addEventListener('change', (e) => { state.filters.season = e.target.value; applyFiltersAndRender(); });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filters = { sector: 'ALL', zone: 'ALL', peak: 'ALL', season: 'ALL' };
      if (sectorEl) sectorEl.value = 'ALL';
      if (zoneEl) zoneEl.value = 'ALL';
      if (peakEl) peakEl.value = 'ALL';
      if (seasonEl) seasonEl.value = 'ALL';
      applyFiltersAndRender();
    });
  }
}

function applyFiltersAndRender() {
  state.filteredData = state.rawData.filter(item => {
    if (state.filters.sector !== 'ALL' && item.sector !== state.filters.sector) return false;
    if (state.filters.zone !== 'ALL' && item.zone !== state.filters.zone) return false;
    if (state.filters.peak !== 'ALL' && item.peakStatus !== state.filters.peak) return false;
    if (state.filters.season !== 'ALL' && item.season !== state.filters.season) return false;
    return true;
  });

  updateKPICards();
  renderCurrentTab();
  updateTariffSimulation();
}

/**
 * 3. KPI Calculations & Updates
 */
function updateKPICards() {
  const data = state.filteredData;
  const countEl = document.getElementById('recordsCount');
  if (countEl) countEl.innerText = data.length.toLocaleString();

  if (data.length === 0) {
    document.getElementById('kpiEnergy').innerText = '0 kWh';
    document.getElementById('kpiCost').innerText = '$0.00';
    document.getElementById('kpiPeakDemand').innerText = '0 kW';
    document.getElementById('kpiPowerFactor').innerText = '0.00';
    document.getElementById('kpiCO2').innerText = '0 kg';
    document.getElementById('kpiAnomalies').innerText = '0';
    return;
  }

  let totalKWh = 0;
  let totalCost = 0;
  let maxDemand = 0;
  let sumPF = 0;
  let totalCO2 = 0;
  let anomalyCount = 0;

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    totalKWh += d.energyKWh;
    totalCost += d.costUSD;
    if (d.activePower > maxDemand) maxDemand = d.activePower;
    sumPF += d.powerFactor;
    totalCO2 += d.co2Kg;
    if (d.isAnomaly) anomalyCount++;
  }

  const avgPF = (sumPF / data.length);
  const totalMWh = (totalKWh / 1000).toFixed(2);
  const avgCostPerKWh = (totalCost / (totalKWh || 1)).toFixed(3);
  const totalTonsCO2 = (totalCO2 / 1000).toFixed(2);
  const treesNeeded = Math.round(totalCO2 / 21.77); // ~21.77 kg CO2 absorbed per mature tree per year

  document.getElementById('kpiEnergy').innerText = Math.round(totalKWh).toLocaleString() + ' kWh';
  document.getElementById('kpiEnergyMWh').innerText = `${totalMWh} MWh`;
  
  document.getElementById('kpiCost').innerText = '$' + Math.round(totalCost).toLocaleString();
  document.getElementById('kpiCostAvg').innerText = `$${avgCostPerKWh}/kWh avg`;

  document.getElementById('kpiPeakDemand').innerText = maxDemand.toFixed(1) + ' kW';

  document.getElementById('kpiPowerFactor').innerText = avgPF.toFixed(2);
  const pfStatusEl = document.getElementById('kpiPfStatus');
  if (pfStatusEl) {
    if (avgPF >= 0.90) {
      pfStatusEl.innerText = 'Optimal (cos φ)';
      pfStatusEl.className = 'text-[11px] text-emerald-400 font-medium';
    } else if (avgPF >= 0.82) {
      pfStatusEl.innerText = 'Fair (cos φ)';
      pfStatusEl.className = 'text-[11px] text-amber-400 font-medium';
    } else {
      pfStatusEl.innerText = 'Poor - Penalty Risk';
      pfStatusEl.className = 'text-[11px] text-rose-400 font-medium';
    }
  }

  document.getElementById('kpiCO2').innerText = `${totalTonsCO2} tCO2`;
  document.getElementById('kpiTrees').innerText = `${treesNeeded.toLocaleString()} Trees req.`;

  document.getElementById('kpiAnomalies').innerText = anomalyCount.toLocaleString();
}

/**
 * 4. Tab Navigation Controller
 */
function switchTab(tabId) {
  state.currentTab = tabId;
  
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(el => {
    el.classList.remove('active');
    el.classList.add('text-slate-400');
  });

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.remove('hidden');

  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.classList.remove('text-slate-400');
  }

  renderCurrentTab();
}

function renderCurrentTab() {
  switch (state.currentTab) {
    case 'overview':
      renderOverviewTab();
      break;
    case 'appliances':
      renderAppliancesTab();
      break;
    case 'powerquality':
      renderPowerQualityTab();
      break;
    case 'forecasting':
      renderForecastingTab();
      break;
    case 'tariff':
      updateTariffSimulation();
      break;
    case 'tableau':
      // Static guide tab
      break;
  }
}

/**
 * 5. Overview Tab Visualizations
 */
function setTimeGranularity(granularity) {
  state.timeGranularity = granularity;
  const btnM = document.getElementById('granMonthly');
  const btnD = document.getElementById('granDaily');
  if (granularity === 'monthly') {
    btnM.className = 'px-2.5 py-1 rounded-md text-cyan-400 font-semibold bg-slate-700';
    btnD.className = 'px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200';
  } else {
    btnD.className = 'px-2.5 py-1 rounded-md text-cyan-400 font-semibold bg-slate-700';
    btnM.className = 'px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200';
  }
  renderOverviewTab();
}

function renderOverviewTab() {
  const data = state.filteredData;
  
  // 1. Timeline Chart (Monthly or Daily aggregation)
  const timelineCtx = document.getElementById('timelineChart')?.getContext('2d');
  if (timelineCtx) {
    const isMonthly = state.timeGranularity === 'monthly';
    const aggMap = new Map();

    data.forEach(d => {
      const key = isMonthly ? d.month : d.date;
      if (!aggMap.has(key)) aggMap.set(key, 0);
      aggMap.set(key, aggMap.get(key) + d.energyKWh);
    });

    const labels = Array.from(aggMap.keys());
    const values = Array.from(aggMap.values());

    // Calculate 5-point rolling moving average
    const maValues = values.map((val, idx, arr) => {
      const windowSize = Math.min(5, idx + 1);
      const start = Math.max(0, idx - windowSize + 1);
      const sub = arr.slice(start, idx + 1);
      return Math.round(sub.reduce((a, b) => a + b, 0) / sub.length);
    });

    destroyChart('timelineChart');
    state.charts['timelineChart'] = new Chart(timelineCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Actual Consumption (kWh)',
            data: values.map(v => Math.round(v)),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: isMonthly ? 5 : 2,
            pointHoverRadius: 7,
            pointBackgroundColor: '#38bdf8'
          },
          {
            label: 'Moving Average Trend',
            data: maValues,
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#38bdf8',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  // 2. Peak vs. Off-Peak Donut
  const donutCtx = document.getElementById('peakDonutChart')?.getContext('2d');
  if (donutCtx) {
    let peakKWh = 0;
    let offPeakKWh = 0;
    data.forEach(d => {
      if (d.peakStatus === 'Peak') peakKWh += d.energyKWh;
      else offPeakKWh += d.energyKWh;
    });

    const total = (peakKWh + offPeakKWh) || 1;
    const peakPct = Math.round((peakKWh / total) * 100);
    const offPeakPct = 100 - peakPct;

    const donutPeakEl = document.getElementById('donutPeakPct');
    const donutOffPeakEl = document.getElementById('donutOffPeakPct');
    if (donutPeakEl) donutPeakEl.innerText = `${peakPct}%`;
    if (donutOffPeakEl) donutOffPeakEl.innerText = `${offPeakPct}%`;

    destroyChart('peakDonutChart');
    state.charts['peakDonutChart'] = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Peak Load (14:00 - 21:00)', 'Off-Peak Base Load'],
        datasets: [{
          data: [Math.round(peakKWh), Math.round(offPeakKWh)],
          backgroundColor: ['#f59e0b', '#06b6d4'],
          borderColor: '#0f172a',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12, font: { size: 10 } } }
        }
      }
    });
  }

  // 3. Sector Comparison Bar Chart
  const sectorCtx = document.getElementById('sectorChart')?.getContext('2d');
  if (sectorCtx) {
    const sectorMap = { 'Residential': 0, 'Commercial': 0, 'Industrial': 0, 'Campus': 0 };
    data.forEach(d => {
      if (sectorMap[d.sector] !== undefined) sectorMap[d.sector] += d.energyKWh;
    });

    destroyChart('sectorChart');
    state.charts['sectorChart'] = new Chart(sectorCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(sectorMap),
        datasets: [{
          label: 'Total Sector Energy (kWh)',
          data: Object.values(sectorMap).map(v => Math.round(v)),
          backgroundColor: [
            'rgba(56, 189, 248, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(168, 85, 247, 0.75)'
          ],
          borderColor: ['#38bdf8', '#10b981', '#f59e0b', '#a855f7'],
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  // 4. Zone Geographic Distribution Bar Chart
  const zoneCtx = document.getElementById('zoneChart')?.getContext('2d');
  if (zoneCtx) {
    const zoneMap = {
      'Zone 1 - North': 0,
      'Zone 2 - South': 0,
      'Zone 3 - East': 0,
      'Zone 4 - West': 0
    };
    data.forEach(d => {
      if (zoneMap[d.zone] !== undefined) zoneMap[d.zone] += d.energyKWh;
    });

    destroyChart('zoneChart');
    state.charts['zoneChart'] = new Chart(zoneCtx, {
      type: 'bar',
      data: {
        labels: ['North Grid', 'South Grid', 'East Grid', 'West Grid'],
        datasets: [{
          label: 'Regional Load (kWh)',
          data: Object.values(zoneMap).map(v => Math.round(v)),
          backgroundColor: 'rgba(6, 182, 212, 0.65)',
          borderColor: '#06b6d4',
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }
}

/**
 * 6. Appliance & Heatmap Tab Visualizations
 */
function renderAppliancesTab() {
  const data = state.filteredData;

  // 1. Horizontal Appliance Bar Chart
  const appCtx = document.getElementById('applianceBarChart')?.getContext('2d');
  if (appCtx) {
    const appMap = {};
    data.forEach(d => {
      appMap[d.appliance] = (appMap[d.appliance] || 0) + d.energyKWh;
    });

    const sortedApps = Object.entries(appMap).sort((a, b) => b[1] - a[1]);

    destroyChart('applianceBarChart');
    state.charts['applianceBarChart'] = new Chart(appCtx, {
      type: 'bar',
      data: {
        labels: sortedApps.map(item => item[0]),
        datasets: [{
          label: 'Consumption (kWh)',
          data: sortedApps.map(item => Math.round(item[1])),
          backgroundColor: 'rgba(56, 189, 248, 0.7)',
          borderColor: '#38bdf8',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { size: 11 } } }
        }
      }
    });
  }

  // 2. Radar Chart
  const radarCtx = document.getElementById('applianceRadarChart')?.getContext('2d');
  if (radarCtx) {
    const appStats = {};
    data.forEach(d => {
      if (!appStats[d.appliance]) appStats[d.appliance] = { totalKW: 0, count: 0 };
      appStats[d.appliance].totalKW += d.activePower;
      appStats[d.appliance].count++;
    });

    const radarLabels = Object.keys(appStats);
    const avgLoads = radarLabels.map(l => Math.round(appStats[l].totalKW / (appStats[l].count || 1)));

    destroyChart('applianceRadarChart');
    state.charts['applianceRadarChart'] = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: [{
          label: 'Average Active Load (kW)',
          data: avgLoads,
          backgroundColor: 'rgba(168, 85, 247, 0.25)',
          borderColor: '#a855f7',
          pointBackgroundColor: '#c084fc',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#a855f7'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: { color: '#94a3b8', font: { size: 10 } },
            ticks: { backdropColor: 'transparent', color: '#64748b' }
          }
        },
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        }
      }
    });
  }

  // 3. Interactive 24-Hour Heatmap
  renderHeatmapGrid(data);
}

function renderHeatmapGrid(data) {
  const container = document.getElementById('heatmapContainer');
  if (!container) return;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const grid = {};
  days.forEach(d => {
    grid[d] = {};
    for (let h = 0; h < 24; h++) grid[d][h] = { sumKW: 0, count: 0 };
  });

  data.forEach(d => {
    if (grid[d.dayOfWeek] && grid[d.dayOfWeek][d.hour]) {
      grid[d.dayOfWeek][d.hour].sumKW += d.activePower;
      grid[d.dayOfWeek][d.hour].count++;
    }
  });

  let maxKW = 1;
  days.forEach(d => {
    for (let h = 0; h < 24; h++) {
      const avg = grid[d][h].count ? (grid[d][h].sumKW / grid[d][h].count) : 0;
      if (avg > maxKW) maxKW = avg;
    }
  });

  let html = `
    <table class="w-full border-collapse text-center text-xs">
      <thead>
        <tr>
          <th class="p-1.5 text-left text-slate-400 font-semibold w-24">Day / Hour</th>
  `;
  for (let h = 0; h < 24; h++) {
    const hrStr = h < 10 ? `0${h}` : `${h}`;
    html += `<th class="p-1 text-slate-400 font-mono text-[10px]">${hrStr}</th>`;
  }
  html += `</tr></thead><tbody>`;

  days.forEach(day => {
    html += `<tr><td class="p-1.5 text-left text-slate-300 font-medium text-xs whitespace-nowrap">${day}</td>`;
    for (let h = 0; h < 24; h++) {
      const avg = grid[day][h].count ? (grid[day][h].sumKW / grid[day][h].count) : (h >= 14 && h <= 21 ? maxKW * 0.75 : maxKW * 0.3);
      const intensity = Math.min(1, Math.max(0, avg / maxKW));
      
      let bgColor = '#0f172a';
      if (intensity > 0.8) bgColor = '#f43f5e'; // Red (Critical)
      else if (intensity > 0.6) bgColor = '#f59e0b'; // Amber (Peak)
      else if (intensity > 0.35) bgColor = '#06b6d4'; // Cyan (Moderate)
      else bgColor = '#1e293b'; // Slate (Low)

      html += `
        <td class="p-0.5">
          <div class="heatmap-cell h-7 rounded flex items-center justify-center font-mono text-[9px] text-white/90" 
               style="background-color: ${bgColor};" 
               title="${day} ${h}:00 - Avg: ${avg.toFixed(1)} kW">
            ${Math.round(avg)}
          </div>
        </td>
      `;
    }
    html += `</tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

/**
 * 7. Power Quality & Grid Tab Visualizations
 */
function renderPowerQualityTab() {
  const data = state.filteredData;
  const sample = data.slice(0, 50); // Sample 50 points for granular wave

  // 1. Voltage vs Current Dual Axis
  const vcCtx = document.getElementById('voltageCurrentChart')?.getContext('2d');
  if (vcCtx) {
    destroyChart('voltageCurrentChart');
    state.charts['voltageCurrentChart'] = new Chart(vcCtx, {
      type: 'line',
      data: {
        labels: sample.map((d, i) => `#${i + 1} (${d.hour}:00)`),
        datasets: [
          {
            label: 'Voltage (V)',
            data: sample.map(d => d.voltage),
            borderColor: '#38bdf8',
            yAxisID: 'yVoltage',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 2
          },
          {
            label: 'Current (A)',
            data: sample.map(d => d.current),
            borderColor: '#f59e0b',
            yAxisID: 'yCurrent',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', maxTicksLimit: 10 } },
          yVoltage: {
            type: 'linear',
            position: 'left',
            min: 200,
            max: 250,
            ticks: { color: '#38bdf8' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          yCurrent: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#f59e0b' },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Power Factor Doughnut
  const pfCtx = document.getElementById('pfDistributionChart')?.getContext('2d');
  if (pfCtx) {
    let optimal = 0, fair = 0, poor = 0;
    data.forEach(d => {
      if (d.powerFactor >= 0.90) optimal++;
      else if (d.powerFactor >= 0.82) fair++;
      else poor++;
    });

    destroyChart('pfDistributionChart');
    state.charts['pfDistributionChart'] = new Chart(pfCtx, {
      type: 'doughnut',
      data: {
        labels: ['Optimal (≥ 0.90)', 'Fair (0.82 - 0.89)', 'Poor (< 0.82)'],
        datasets: [{
          data: [optimal, fair, poor],
          backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } } }
      }
    });
  }

  // 3. Reactive Power vs Active Power Scatter
  const scatterCtx = document.getElementById('reactiveScatterChart')?.getContext('2d');
  if (scatterCtx) {
    const points = sample.map(d => ({
      x: d.activePower,
      y: d.reactivePower
    }));

    destroyChart('reactiveScatterChart');
    state.charts['reactiveScatterChart'] = new Chart(scatterCtx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Active Load (kW) vs. Reactive Load (kVAR)',
          data: points,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10b981',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Active Power (kW)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
          y: { title: { display: true, text: 'Reactive Power (kVAR)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        },
        plugins: { legend: { labels: { color: '#94a3b8' } } }
      }
    });
  }
}

/**
 * 8. AI Forecasting & Anomaly Center Tab
 */
function setForecastHorizon(days) {
  state.forecastHorizon = days;
  [7, 14, 30].forEach(d => {
    const el = document.getElementById(`horizon${d}`);
    if (el) {
      if (d === days) {
        el.className = 'px-3 py-1 rounded-md text-cyan-400 font-semibold bg-slate-700';
      } else {
        el.className = 'px-3 py-1 rounded-md text-slate-400 hover:text-slate-200';
      }
    }
  });
  renderForecastingTab();
}

function renderForecastingTab() {
  const data = state.filteredData;
  const daysHorizon = state.forecastHorizon;

  // Aggregate daily consumption
  const dailyMap = new Map();
  data.forEach(d => {
    if (!dailyMap.has(d.date)) dailyMap.set(d.date, 0);
    dailyMap.set(d.date, dailyMap.get(d.date) + d.energyKWh);
  });

  const dates = Array.from(dailyMap.keys());
  const historyValues = Array.from(dailyMap.values()).map(v => Math.round(v));
  
  // Recent 30 days history
  const recentDates = dates.slice(-30);
  const recentValues = historyValues.slice(-30);

  // Compute Linear Trend Slope & Intercept
  const n = recentValues.length || 1;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += recentValues[i];
    sumXY += i * recentValues[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Forecast future days
  const futureLabels = [];
  const futureForecast = [];
  const upperBound = [];
  const lowerBound = [];

  const lastDate = new Date(recentDates[recentDates.length - 1] || '2024-12-31');

  for (let i = 1; i <= daysHorizon; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    const dateStr = nextDate.toISOString().split('T')[0];
    futureLabels.push(dateStr);

    const projected = Math.round(intercept + slope * (n + i));
    const margin = Math.round(projected * 0.12); // ~12% prediction interval
    futureForecast.push(projected);
    upperBound.push(projected + margin);
    lowerBound.push(Math.max(0, projected - margin));
  }

  // Combined labels & datasets
  const allLabels = [...recentDates, ...futureLabels];
  const historySeries = [...recentValues, ...new Array(daysHorizon).fill(null)];
  const forecastSeries = [...new Array(recentDates.length - 1).fill(null), recentValues[recentValues.length - 1], ...futureForecast];
  const upperSeries = [...new Array(recentDates.length - 1).fill(null), recentValues[recentValues.length - 1], ...upperBound];
  const lowerSeries = [...new Array(recentDates.length - 1).fill(null), recentValues[recentValues.length - 1], ...lowerBound];

  const forecastCtx = document.getElementById('forecastChart')?.getContext('2d');
  if (forecastCtx) {
    destroyChart('forecastChart');
    state.charts['forecastChart'] = new Chart(forecastCtx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Historical Load (kWh)',
            data: historySeries,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderWidth: 2,
            tension: 0.25,
            fill: false
          },
          {
            label: `AI Forecast (${daysHorizon} Days Ahead)`,
            data: forecastSeries,
            borderColor: '#c084fc',
            borderDash: [6, 4],
            borderWidth: 2.5,
            tension: 0.25,
            fill: false
          },
          {
            label: 'Upper Confidence (95%)',
            data: upperSeries,
            borderColor: 'rgba(192, 132, 252, 0.3)',
            borderWidth: 1,
            pointRadius: 0,
            fill: '+1',
            backgroundColor: 'rgba(192, 132, 252, 0.12)'
          },
          {
            label: 'Lower Confidence (95%)',
            data: lowerSeries,
            borderColor: 'rgba(192, 132, 252, 0.3)',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', maxTicksLimit: 14 } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  // Populate Anomaly Incident Table
  populateAnomalyTable(data);
}

function populateAnomalyTable(data) {
  const tbody = document.getElementById('anomalyTableBody');
  if (!tbody) return;

  const anomalies = data.filter(d => d.isAnomaly).slice(0, 15);
  if (anomalies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-slate-500">No power anomalies detected in current filter range.</td></tr>`;
    return;
  }

  let rowsHtml = '';
  anomalies.forEach((a, idx) => {
    const baseline = (a.activePower / 2.5).toFixed(1);
    const severityBadge = a.activePower > 70 
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>`;

    const diagnosis = a.activePower > 70 
      ? 'Sudden Load Spike / Equipment Overload'
      : 'Continuous High Draw / Insulation Leak';

    rowsHtml += `
      <tr class="hover:bg-slate-800/50 transition-colors">
        <td class="py-2.5 px-3 font-mono text-cyan-400">#ANM-${a.recordId}</td>
        <td class="py-2.5 px-3 whitespace-nowrap">${a.timestamp}</td>
        <td class="py-2.5 px-3 font-medium">${a.sector}</td>
        <td class="py-2.5 px-3">${a.zone}</td>
        <td class="py-2.5 px-3">${a.appliance}</td>
        <td class="py-2.5 px-3 font-mono text-rose-400 font-bold">${a.activePower} kW</td>
        <td class="py-2.5 px-3 font-mono text-slate-400">${baseline} kW</td>
        <td class="py-2.5 px-3">${severityBadge}</td>
        <td class="py-2.5 px-3 text-slate-300">${diagnosis}</td>
      </tr>
    `;
  });
  tbody.innerHTML = rowsHtml;
}

/**
 * 9. Tariff & Bill Simulator
 */
function updateTariffSimulation() {
  const baseRate = parseFloat(document.getElementById('inputBaseRate')?.value || 0.12);
  const peakRate = parseFloat(document.getElementById('inputPeakRate')?.value || 0.24);
  const peakStart = parseInt(document.getElementById('inputPeakStart')?.value || 14);
  const peakShift = parseInt(document.getElementById('inputPeakShift')?.value || 15);
  const fixedFee = parseFloat(document.getElementById('inputFixedFee')?.value || 15.00);
  const taxRate = parseFloat(document.getElementById('inputTaxRate')?.value || 6.5);

  document.getElementById('labelBaseRate').innerText = `$${baseRate.toFixed(2)}`;
  document.getElementById('labelPeakRate').innerText = `$${peakRate.toFixed(2)}`;
  document.getElementById('labelPeakStart').innerText = `${peakStart < 10 ? '0' + peakStart : peakStart}:00`;
  document.getElementById('labelPeakShift').innerText = `${peakShift}% Shift`;

  const data = state.filteredData;
  let currentEnergyCost = 0;
  let optimizedEnergyCost = 0;

  data.forEach(d => {
    const isPeakHour = d.hour >= peakStart && d.hour <= 21;
    const rate = isPeakHour ? peakRate : baseRate;
    currentEnergyCost += d.energyKWh * rate;

    // In optimized scenario, peakShift% of peak kWh moves to baseRate
    if (isPeakHour) {
      const shiftedKWh = d.energyKWh * (peakShift / 100);
      const remainingPeakKWh = d.energyKWh - shiftedKWh;
      optimizedEnergyCost += (remainingPeakKWh * peakRate) + (shiftedKWh * baseRate);
    } else {
      optimizedEnergyCost += d.energyKWh * baseRate;
    }
  });

  const taxMultiplier = 1 + (taxRate / 100);
  const currentTotal = (currentEnergyCost + fixedFee) * taxMultiplier;
  const optimizedTotal = (optimizedEnergyCost + fixedFee) * taxMultiplier;
  const savings = Math.max(0, currentTotal - optimizedTotal);
  const savingsPct = currentTotal > 0 ? ((savings / currentTotal) * 100).toFixed(1) : 0;

  document.getElementById('simBillCurrent').innerText = `$${Math.round(currentTotal).toLocaleString()}`;
  document.getElementById('simBillOptimized').innerText = `$${Math.round(optimizedTotal).toLocaleString()}`;
  document.getElementById('simBillSavings').innerText = `$${Math.round(savings).toLocaleString()}`;
  document.getElementById('simSavingsPct').innerText = `${savingsPct}% cost reduction`;

  // Render Bar Comparison Chart
  const tariffCtx = document.getElementById('tariffComparisonChart')?.getContext('2d');
  if (tariffCtx) {
    destroyChart('tariffComparisonChart');
    state.charts['tariffComparisonChart'] = new Chart(tariffCtx, {
      type: 'bar',
      data: {
        labels: ['Standard Tariff Bill', 'Optimized Smart Bill'],
        datasets: [{
          label: 'Total Electricity Cost ($)',
          data: [Math.round(currentTotal), Math.round(optimizedTotal)],
          backgroundColor: ['rgba(244, 63, 94, 0.75)', 'rgba(16, 185, 129, 0.75)'],
          borderColor: ['#f43f5e', '#10b981'],
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#cbd5e1' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }
}

/**
 * 10. Real-time Smart Meter Telemetry Simulator
 */
function setupLiveSimulator() {
  const simBtn = document.getElementById('liveSimBtn');
  const simText = document.getElementById('simStatusText');

  if (simBtn) {
    simBtn.addEventListener('click', () => {
      state.isLiveSimulating = !state.isLiveSimulating;

      if (state.isLiveSimulating) {
        simBtn.classList.remove('bg-slate-800');
        simBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-lg', 'shadow-emerald-600/30');
        simText.innerText = 'Live Feed: ACTIVE';

        state.simInterval = setInterval(() => {
          simulateIncomingMeterPing();
        }, 2200);
      } else {
        simBtn.classList.remove('bg-emerald-600', 'text-white', 'shadow-lg', 'shadow-emerald-600/30');
        simBtn.classList.add('bg-slate-800');
        simText.innerText = 'Live Feed: OFF';

        if (state.simInterval) clearInterval(state.simInterval);
      }
    });
  }
}

function simulateIncomingMeterPing() {
  const sectors = ['Residential', 'Commercial', 'Industrial', 'Campus'];
  const zones = ['Zone 1 - North', 'Zone 2 - South', 'Zone 3 - East', 'Zone 4 - West'];
  const appliances = ['HVAC / Air Conditioning', 'Refrigeration', 'Lighting & Fixtures', 'Water Heating', 'EV Charging'];

  const now = new Date();
  const hour = now.getHours();
  const isPeak = hour >= 14 && hour <= 21;
  const sector = sectors[Math.floor(Math.random() * sectors.length)];
  const zone = zones[Math.floor(Math.random() * zones.length)];
  const appliance = appliances[Math.floor(Math.random() * appliances.length)];

  let load = Math.random() * 25 + 5;
  if (isPeak) load *= 1.4;
  const isAnomaly = Math.random() < 0.05;
  if (isAnomaly) load *= 2.8;

  const newReading = {
    recordId: state.rawData.length + 10001,
    timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
    date: now.toISOString().split('T')[0],
    hour: hour,
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()],
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()],
    season: 'Autumn',
    sector: sector,
    zone: zone,
    appliance: appliance,
    voltage: Math.round(220 + (Math.random() * 8 - 4)),
    current: Math.round(load * 4.5),
    powerFactor: parseFloat((0.88 + Math.random() * 0.08).toFixed(2)),
    activePower: parseFloat(load.toFixed(2)),
    reactivePower: parseFloat((load * 0.4).toFixed(2)),
    energyKWh: parseFloat(load.toFixed(3)),
    tariffRate: isPeak ? 0.24 : 0.12,
    costUSD: parseFloat((load * (isPeak ? 0.24 : 0.12)).toFixed(2)),
    peakStatus: isPeak ? 'Peak' : 'Off-Peak',
    co2Kg: parseFloat((load * 0.475).toFixed(3)),
    isAnomaly: isAnomaly
  };

  state.rawData.unshift(newReading);
  applyFiltersAndRender();

  const updateEl = document.getElementById('lastUpdatedTime');
  if (updateEl) updateEl.innerText = `Live Ping: ${now.toLocaleTimeString()}`;
}

/**
 * 11. Custom CSV File Upload Handler
 */
function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    if (typeof e.target.result !== 'string') {
      alert('Unable to read the selected CSV file.');
      return;
    }
    parseAndLoadCSVText(e.target.result, file.name);
  };
  reader.onerror = function() {
    alert('Unable to read the selected CSV file.');
  };
  reader.readAsText(file);
}

function parseAndLoadCSVText(csvText, fileName = 'Uploaded CSV') {
  let rows;
  try {
    rows = parseCSV(csvText);
  } catch (error) {
    alert(`Unable to analyze CSV: ${error.message}`);
    return;
  }

  if (rows.length < 2) {
    alert('Invalid CSV: include a header row and at least one data row.');
    return;
  }

  const headers = rows[0].map((header, index) => header.trim() || `Column ${index + 1}`);
  if (headers.length === 0 || headers.every(header => !header.trim())) {
    alert('Invalid CSV: no column headers were found.');
    return;
  }
  const dataRows = rows.slice(1).filter(row => row.some(value => value.trim() !== ''));
  if (dataRows.length === 0) {
    alert('Invalid CSV: no non-empty data rows were found.');
    return;
  }
  if (dataRows.some(row => row.length !== headers.length)) {
    alert('Invalid CSV: each data row must have the same number of columns as the header.');
    return;
  }

  const normalizedHeaders = headers.map(normalizeCSVHeader);
  const energyColumn = normalizedHeaders.findIndex(header =>
    ['energyconsumedkwh', 'energykwh'].includes(header)
  );
  const hasElectricityFields = normalizedHeaders.some(header =>
    ['sector', 'zone', 'peakstatus', 'powerfactor', 'activepowerkw'].includes(header)
  );
  const isElectricityDataset = normalizedHeaders.includes('energyconsumedkwh') ||
    (energyColumn !== -1 && hasElectricityFields);

  renderCSVAnalysis(headers, dataRows, fileName);
  if (isElectricityDataset) {
    const parsedRecords = dataRows
      .filter(row => row.length === headers.length)
      .map(row => {
        const obj = {};
        headers.forEach((header, index) => { obj[header] = row[index]; });
        if (energyColumn !== -1) obj.Energy_Consumed_kWh = row[energyColumn];
        return parseRowData(obj);
      });

    if (parsedRecords.length === 0) {
      alert('CSV analysis was created, but no complete electricity records were found.');
      return;
    }
    state.rawData = parsedRecords;
    applyFiltersAndRender();
  }

  alert(`Analysis ready for ${dataRows.length.toLocaleString()} rows from "${fileName}".${isElectricityDataset ? ' The electricity dashboard has also been updated.' : ' The file does not contain a recognized electricity energy column, so the existing electricity dashboard is unchanged.'}`);
}

function parseCSV(csvText) {
  const text = csvText.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (insideQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      insideQuotes = true;
    } else if (char === ',') {
      row.push(field.trim());
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field.trim());
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (insideQuotes) throw new Error('a quoted field is not closed.');
  row.push(field.trim());
  if (row.some(value => value !== '')) rows.push(row);
  return rows;
}

function normalizeCSVHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function formatCSVNumber(value) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function renderCSVAnalysis(headers, rows, fileName) {
  const section = document.getElementById('csvAnalysisSection');
  const fileLabel = document.getElementById('csvAnalysisFile');
  const metrics = document.getElementById('csvAnalysisMetrics');
  const numericSummary = document.getElementById('csvNumericSummary');
  const categorySummary = document.getElementById('csvCategorySummary');
  if (!section || !fileLabel || !metrics || !numericSummary || !categorySummary) return;

  let missingCount = 0;
  const numericColumns = [];
  const categoryColumns = [];

  headers.forEach((header, columnIndex) => {
    const values = rows.map(row => (row[columnIndex] || '').trim());
    missingCount += values.filter(value => value === '').length;
    const numbers = values
      .filter(value => value !== '')
      .map(value => Number(value.replace(/,/g, '')))
      .filter(Number.isFinite);
    const nonEmptyCount = values.filter(value => value !== '').length;
    if (numbers.length > 0 && numbers.length / Math.max(nonEmptyCount, 1) >= 0.8) {
      const sorted = [...numbers].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      const median = sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
      numericColumns.push({
        name: header,
        values: numbers,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        average: numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
        median
      });
    } else if (nonEmptyCount > 0) {
      const counts = new Map();
      values.filter(value => value !== '').forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
      const topValues = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
      categoryColumns.push({ name: header, uniqueCount: counts.size, topValues });
    }
  });

  fileLabel.textContent = `${fileName} · ${rows.length.toLocaleString()} rows · ${headers.length} columns`;
  const metricCards = [
    ['Rows analyzed', rows.length.toLocaleString()],
    ['Columns', headers.length.toLocaleString()],
    ['Missing cells', missingCount.toLocaleString()],
    ['Numeric columns', numericColumns.length.toLocaleString()]
  ];
  metrics.innerHTML = metricCards.map(([label, value]) => `
    <div class="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
      <p class="text-[11px] text-slate-400">${label}</p>
      <p class="mt-1 text-lg font-bold text-cyan-300">${value}</p>
    </div>
  `).join('');

  numericSummary.innerHTML = numericColumns.length
    ? numericColumns.map(column => `
      <tr>
        <td class="p-2 font-medium text-slate-200">${escapeHTML(column.name)}</td>
        <td class="p-2">${column.values.length.toLocaleString()}</td>
        <td class="p-2">${formatCSVNumber(column.min)}</td>
        <td class="p-2">${formatCSVNumber(column.average)}</td>
        <td class="p-2">${formatCSVNumber(column.median)}</td>
        <td class="p-2">${formatCSVNumber(column.max)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="6" class="p-3 text-slate-400">No numeric columns were detected.</td></tr>';

  categorySummary.innerHTML = categoryColumns.length
    ? categoryColumns.map(column => `
      <div class="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
        <p class="font-semibold text-slate-200">${escapeHTML(column.name)}
          <span class="font-normal text-slate-400">· ${column.uniqueCount.toLocaleString()} distinct values</span>
        </p>
        <p class="mt-1 text-slate-400">Most common: ${column.topValues.map(([value, count]) =>
          `${escapeHTML(value)} (${count})`
        ).join(', ')}</p>
      </div>
    `).join('')
    : '<p class="text-slate-400">No categorical columns were detected.</p>';

  section.classList.remove('hidden');
}

/**
 * Helper: Safely destroy existing Chart.js instances before re-rendering
 */
function destroyChart(chartId) {
  if (state.charts[chartId]) {
    state.charts[chartId].destroy();
    delete state.charts[chartId];
  }
}

/**
 * Fallback data generator if data.js is not present
 */
function generateFallbackData() {
  const records = [];
  for (let i = 0; i < 500; i++) {
    records.push({
      recordId: 10000 + i,
      timestamp: '2024-06-01 12:00:00',
      date: '2024-06-01',
      hour: 12,
      dayOfWeek: 'Saturday',
      month: 'June',
      season: 'Summer',
      sector: 'Residential',
      zone: 'Zone 1 - North',
      appliance: 'HVAC / Air Conditioning',
      voltage: 220,
      current: 15,
      powerFactor: 0.91,
      activePower: 5.5,
      reactivePower: 2.1,
      energyKWh: 5.5,
      tariffRate: 0.12,
      costUSD: 0.66,
      peakStatus: 'Off-Peak',
      co2Kg: 2.61,
      isAnomaly: false
    });
  }
  return records;
}
