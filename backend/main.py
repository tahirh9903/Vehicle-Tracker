from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CarQuery(BaseModel):
    vehicle_type: str | None = None
    vehicle_make: str | None = None
    vehicle_model: str | None = None
    vehicle_year: str | None = None
    driver_sex: str | None = None
    driver_license_status: str | None = None
    state_registration: str | None = None
    travel_direction: str | None = None
    date_from: str | None = None
    date_to: str | None = None
    limit: int = 1000

def get_severity(injured: str, killed: str) -> str:
    injured_count = int(injured or 0)
    killed_count = int(killed or 0)
    
    if killed_count > 0:
        return "Fatal"
    elif injured_count > 0:
        return "Injury"
    else:
        return "No Injury"

def parse_datetime(date_str: str, time_str: str) -> datetime:
    try:
        # Parse the date
        date_obj = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%f")
        
        # Parse the time if available
        if time_str and time_str != "Unknown":
            try:
                hours, minutes = map(int, time_str.split(':'))
                date_obj = date_obj.replace(hour=hours, minute=minutes)
            except:
                pass
                
        return date_obj
    except:
        # Return a very old date if parsing fails
        return datetime.min

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Car Accident API"}

@app.post("/api/accidents")
async def get_accidents(car: CarQuery):
    try:
        # Build the SoQL query based on provided filters
        query_params = {
            "$limit": car.limit,
            "$$app_token": os.getenv("SOCRATA_APP_TOKEN", "")  # You should set this in .env
        }

        # Add filters if they are provided
        where_conditions = []
        
        if car.vehicle_type:
            query_params["vehicle_type"] = car.vehicle_type
        if car.vehicle_make:
            where_conditions.append(f"vehicle_make like '%{car.vehicle_make}%'")
        if car.vehicle_model:
            where_conditions.append(f"vehicle_model like '%{car.vehicle_model}%'")
        if car.vehicle_year:
            query_params["vehicle_year"] = car.vehicle_year
        if car.driver_sex:
            query_params["driver_sex"] = car.driver_sex
        if car.driver_license_status:
            query_params["driver_license_status"] = car.driver_license_status
        if car.state_registration:
            query_params["state_registration"] = car.state_registration
        if car.travel_direction:
            query_params["travel_direction"] = car.travel_direction
        if car.date_from and car.date_to:
            where_conditions.append(f"crash_date between '{car.date_from}' and '{car.date_to}'")
        
        # Combine all WHERE conditions with AND
        if where_conditions:
            query_params["$where"] = " AND ".join(where_conditions)
        
        # Debug log the final query
        logger.info(f"Final query parameters: {query_params}")
        
        # NYC Open Data API endpoint for vehicle data
        url = "https://data.cityofnewyork.us/resource/bm4k-52h4.json"
        
        # Make the request to the NYC Open Data API
        logger.info(f"Fetching accidents with filters: {query_params}")
        response = requests.get(url, params=query_params)
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"Received {len(data)} records from API")
        
        # Transform the data
        accidents = []
        for vehicle in data:
            try:
                # Format the date
                crash_date = vehicle.get("crash_date", "")
                crash_time = vehicle.get("crash_time", "Unknown")
                
                if crash_date:
                    try:
                        date_obj = datetime.strptime(crash_date, "%Y-%m-%dT%H:%M:%S.%f")
                        formatted_date = date_obj.strftime("%Y-%m-%d")
                    except:
                        formatted_date = crash_date
                else:
                    formatted_date = "Unknown"
                
                # Get vehicle details
                vehicle_details = {
                    "type": vehicle.get("vehicle_type", "Unknown") or "Unknown",
                    "make": vehicle.get("vehicle_make", "Unknown") or "Unknown",
                    "model": vehicle.get("vehicle_model", "Unknown") or "Unknown",
                    "year": vehicle.get("vehicle_year", "Unknown") or "Unknown",
                    "state": vehicle.get("state_registration", "Unknown") or "Unknown",
                    "occupants": vehicle.get("vehicle_occupants", "Unknown") or "Unknown"
                }
                
                # Get driver details
                driver_details = {
                    "sex": vehicle.get("driver_sex", "Unknown") or "Unknown",
                    "license_status": vehicle.get("driver_license_status", "Unknown") or "Unknown",
                    "license_jurisdiction": vehicle.get("driver_license_jurisdiction", "Unknown") or "Unknown"
                }
                
                # Get crash details
                crash_details = {
                    "pre_crash": vehicle.get("pre_crash", "Unknown") or "Unknown",
                    "point_of_impact": vehicle.get("point_of_impact", "Unknown") or "Unknown",
                    "travel_direction": vehicle.get("travel_direction", "Unknown") or "Unknown"
                }
                
                # Get damage details
                damage_locations = [
                    vehicle.get("vehicle_damage", ""),
                    vehicle.get("vehicle_damage_1", ""),
                    vehicle.get("vehicle_damage_2", ""),
                    vehicle.get("vehicle_damage_3", "")
                ]
                damage_locations = [d for d in damage_locations if d and d != ""]
                
                # Get contributing factors
                factors = [
                    factor for factor in [
                        vehicle.get("contributing_factor_1", ""),
                        vehicle.get("contributing_factor_2", "")
                    ] if factor and factor != ""
                ] or ["No factors reported"]
                
                accidents.append({
                    "date": formatted_date,
                    "time": crash_time,
                    "vehicle": vehicle_details,
                    "driver": driver_details,
                    "crash": crash_details,
                    "damage_locations": damage_locations,
                    "public_property_damage": vehicle.get("public_property_damage", "Unknown"),
                    "contributing_factors": factors,
                    "sort_date": parse_datetime(crash_date, crash_time)
                })
            except Exception as e:
                logger.error(f"Error processing vehicle record: {str(e)}")
                continue
        
        # Sort accidents by date and time in descending order
        accidents.sort(key=lambda x: x["sort_date"], reverse=True)
        
        # Remove the sort_date field before sending to frontend
        for accident in accidents:
            del accident["sort_date"]
        
        logger.info(f"Returning {len(accidents)} accidents")
        return {"accidents": accidents}
    except Exception as e:
        logger.error(f"Error in get_accidents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 