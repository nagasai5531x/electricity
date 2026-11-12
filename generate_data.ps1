$outPath = "d:\miniprojecr\electricity_consumption_data.csv"
$sectors = @("Residential", "Commercial", "Industrial", "Campus")
$zones = @("Zone 1 - North", "Zone 2 - South", "Zone 3 - East", "Zone 4 - West")
$appliances = @("HVAC / Air Conditioning", "Refrigeration", "Lighting & Fixtures", "Water Heating", "EV Charging", "IT & Electronics", "Heavy Machinery")

$rows = [System.Collections.Generic.List[string]]::new()
$rows.Add("Record_ID,Timestamp,Date,Hour,DayOfWeek,Month,Season,Sector,Zone,Appliance,Voltage_V,Current_A,Power_Factor,Active_Power_kW,Reactive_Power_kVAR,Energy_Consumed_kWh,Tariff_Rate_per_kWh,Cost_USD,Peak_Status,CO2_Emissions_kg,Anomaly_Flag")

$baseDate = (Get-Date "2024-01-01 00:00:00")
$rand = [System.Random]::new(42)

$recordId = 10001

for ($day = 0; $day -lt 365; $day += 1) {
    $currentDate = $baseDate.AddDays($day)
    $monthName = $currentDate.ToString("MMMM")
    $monthNum = $currentDate.Month
    $dayOfWeek = $currentDate.DayOfWeek.ToString()
    
    $season = "Autumn"
    if ($monthNum -in @(12, 1, 2)) { $season = "Winter" }
    elseif ($monthNum -in @(3, 4, 5)) { $season = "Spring" }
    elseif ($monthNum -in @(6, 7, 8)) { $season = "Summer" }

    $sampleHours = @(2, 8, 14, 19)
    foreach ($hour in $sampleHours) {
        $timestamp = $currentDate.AddHours($hour).ToString("yyyy-MM-dd HH:mm:ss")
        $dateStr = $currentDate.ToString("yyyy-MM-dd")
        $isPeak = "Off-Peak"
        $tariff = 0.12
        if ($hour -ge 14 -and $hour -le 21) {
            $isPeak = "Peak"
            $tariff = 0.24
        }

        foreach ($sector in $sectors) {
            $zone = $zones[$rand.Next($zones.Length)]
            $appliance = $appliances[$rand.Next($appliances.Length)]

            $baseLoad = 10.0
            switch ($sector) {
                "Industrial"  { $baseLoad = $rand.NextDouble() * 50 + 40 }
                "Commercial"  { $baseLoad = $rand.NextDouble() * 30 + 20 }
                "Campus"      { $baseLoad = $rand.NextDouble() * 25 + 15 }
                "Residential" { $baseLoad = $rand.NextDouble() * 10 + 2 }
            }

            if ($season -eq "Summer" -and $appliance -match "Air Conditioning") { $baseLoad *= 1.8 }
            if ($season -eq "Winter" -and $appliance -match "Heating") { $baseLoad *= 1.6 }
            if ($isPeak -eq "Peak") { $baseLoad *= 1.35 }

            $isAnomaly = "No"
            if ($rand.NextDouble() -lt 0.02) {
                $isAnomaly = "Yes"
                $baseLoad *= ($rand.NextDouble() * 2.5 + 2.0)
            }

            $voltage = [Math]::Round(225 + ($rand.NextDouble() * 15 - 7.5), 1)
            $pf = [Math]::Round(0.88 + ($rand.NextDouble() * 0.1 - 0.05), 2)
            $activePowerKW = [Math]::Round($baseLoad, 2)
            $currentA = [Math]::Round(($activePowerKW * 1000) / ($voltage * $pf), 2)
            $reactivePower = [Math]::Round($activePowerKW * [Math]::Tan([Math]::Acos($pf)), 2)
            $energyKWh = [Math]::Round($activePowerKW * 1.0, 3)
            $cost = [Math]::Round($energyKWh * $tariff, 2)
            $co2 = [Math]::Round($energyKWh * 0.475, 3)

            $rows.Add("$recordId,$timestamp,$dateStr,$hour,$dayOfWeek,$monthName,$season,$sector,$zone,$appliance,$voltage,$currentA,$pf,$activePowerKW,$reactivePower,$energyKWh,$tariff,$cost,$isPeak,$co2,$isAnomaly")
            $recordId++
        }
    }
}

[System.IO.File]::WriteAllLines($outPath, $rows)
Write-Output "Dataset written to $outPath with $($rows.Count) rows."
