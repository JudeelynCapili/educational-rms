# 🚀 Capacity Analyzer - Quick Start Guide

## System Ready! ✅

Your educational RMS now has a complete **Capacity & Utilization Analysis** module with all 7 interactive features fully implemented.

---

## Starting the System

### 1. Start the Backend
```bash
cd backend
python manage.py runserver 8000
```
Expected output: `Starting development server at http://127.0.0.1:8000/`

### 2. Start the Frontend (in new terminal)
```bash
cd frontend
npm run dev
```
Expected output: `VITE v... ready in ... ms`

### 3. Access the Application
Open browser: `http://localhost:3000`

---

## Testing the Capacity Analyzer

### Current Tab (Live Monitoring)
1. Click **📈 Current** tab in top navigation
2. You should see:
   - Overall utilization % (color-coded: green <70%, yellow 70-90%, red ≥90%)
   - Room-by-room breakdown (Lab A101, Lab B202, Conference C303, etc.)
   - Equipment usage (Projector, Whiteboard, Computers, Microphone, Camera)
   - Peak hours (last 7 days busiest time slots)
   - Underutilized hours (slowest time slots)
3. **Test date picker**: Select different dates to see historical utilization
4. **Test export**: Click "📥 Export CSV" to download utilization data

### Trends Tab (Historical Analysis)
1. Click **📊 Trends** tab
2. Select time window: 7 days, 30 days, or 90 days
3. View:
   - Average utilization over period
   - Peak utilization reached
   - Minimum utilization recorded
   - Trend chart (visual column chart with hover details)
4. **Test different periods** to see trend variations

### Scenarios Tab (What-If Planning)
1. Click **⚙️ Scenarios** tab
2. Adjust **Demand Multiplier** slider (1.0x to 3.0x) to simulate demand growth
   - 1.5x = demand increases by 50%
   - 2.0x = demand doubles
   - 3.0x = demand triples
3. Click **Run Scenario** button
4. View results:
   - Current vs. Projected bookings
   - Current vs. Projected utilization %
   - Smart recommendations (✓ OK, ⚠️ Add rooms, ℹ️ Optimize)
5. **Test saving**: Click "💾 Save Scenario" and enter a name (e.g., "50% Growth")

### Comparison Tab (Multi-Scenario Analysis)
1. Click **🔄 Compare** tab
2. **Create multiple scenarios**:
   - Set Scenarios tab to 1.5x, run, save as "Growth 50%"
   - Set Scenarios tab to 2.0x, run, save as "Growth 100%"
   - Set Scenarios tab to 2.5x, run, save as "Growth 150%"
3. **Back in Comparison tab**:
   - Check the boxes for scenarios you want to compare
   - View side-by-side metrics table
   - Compare which scenario has best utilization

---

## Expected Data

### Sample Data Created Automatically
The system includes pre-populated:
- **5 Rooms**: Lab A101, Lab B202, Conference C303, Classroom D101, Study E201
- **5 Equipment Types**: Projector, Whiteboard, Computers, Microphone, Camera
- **Sample Bookings**: Created for last 30 days (varies by usage)
- **Time Slots**: 8:00 AM - 6:00 PM (10 slots per day)

### Current Utilization Calculation
```
Utilization % = (Total Booked Slots / Total Available Slots) × 100
```

Example:
- Total available: 50 rooms × 10 time slots = 500 slots/day
- If 250 slots booked today = 50% utilization ✓

---

## API Endpoints (Backend)

All endpoints at: `http://localhost:8000/api/v1/capacity/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/current_utilization/` | GET | Get today's utilization |
| `/peak_hours/` | GET | Find busiest/slowest hours |
| `/trend_analysis/` | GET | Historical trends (7/30/90 days) |
| `/scenario_analysis/` | POST | Run what-if scenario |
| `/save_scenario/` | POST | Save scenario to database |
| `/saved_scenarios/` | GET | Load user's scenarios |
| `/scenario_detail/` | GET | Get specific scenario |
| `/custom_allocation/` | GET | Test equipment reallocation |
| `/export_csv/` | GET | Download data as CSV |

---

## Troubleshooting

### "Failed to load utilization data"
- ✅ Check backend is running: `http://localhost:8000/api/v1/capacity/current_utilization/`
- ✅ Check CORS is enabled in Django settings
- ✅ Verify sample data exists: `python manage.py populate_sample_data`

### No data showing in Current tab
```bash
cd backend
python manage.py populate_sample_data
```
This creates sample rooms, equipment, and bookings.

### CSV export not working
- ✅ Check backend is running
- ✅ Verify CSV endpoint: `http://localhost:8000/api/v1/capacity/export_csv/`

### Scenarios not saving
- ✅ Ensure you're logged in (check Sidebar shows username)
- ✅ Check auth token in localStorage
- ✅ Verify SavedScenario table exists: `python manage.py migrate`

---

## Color Coding

### Utilization Status
- 🟢 **Green**: 0-70% (Healthy, room to grow)
- 🟡 **Yellow**: 70-90% (Approaching capacity)
- 🔴 **Red**: 90-100% (At/Over capacity, expansion needed)

### Scenario Recommendations
- ✓ **OK**: System can handle the demand
- ⚠️ **Add Rooms**: Need more classroom/lab space
- ℹ️ **Optimize**: Consider equipment reallocation

---

## Key Features Checklist

- [x] Real-time utilization monitoring
- [x] Room-by-room breakdown
- [x] Equipment tracking
- [x] Peak hour identification
- [x] 30 & 90-day trend analysis
- [x] Demand simulation (1.0x - 3.0x)
- [x] Scenario saving & loading
- [x] Multi-scenario comparison
- [x] CSV export
- [x] Color-coded status indicators
- [x] Smart recommendations
- [x] User authentication (scenarios per user)

---

## Next Steps

### Optional Enhancements
1. **Add real bookings**: Create bookings through admin or API
2. **Test with your data**: Import actual room/equipment schedules
3. **Monitor trends**: Run daily and track growth patterns
4. **Plan expansion**: Use scenarios to justify new resources
5. **Share reports**: Export CSV for stakeholders

### Advanced Usage
- Combine multiple scenarios for multi-year planning
- Use trend analysis to identify seasonal peaks
- Test equipment allocation changes before implementing
- Generate historical capacity reports (90-day view)

---

## Quick Links

- 📊 **Capacity Analyzer**: http://localhost:3000/capacity
- 🔧 **Admin Dashboard**: http://localhost:3000/admin
- 📅 **Scheduling**: http://localhost:3000/scheduling
- ⚙️ **Equipment Config**: http://localhost:3000/equipment-config

---

## Support

If you encounter issues:
1. Check backend logs: `python manage.py runserver 8000`
2. Check frontend console: F12 → Console tab
3. Verify migrations ran: `python manage.py showmigrations`
4. Check sample data: `python manage.py populate_sample_data`

---

**Ready to analyze your institution's capacity! 🎓**
