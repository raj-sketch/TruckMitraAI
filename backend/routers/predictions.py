import pandas as pd
import statsmodels.api as sm
from fastapi import APIRouter, HTTPException
from backend.database import db
from datetime import timedelta

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/loads-forecast")
def get_load_forecast():
    """
    Predicts the number of loads for the next 7 days using a SARIMA time-series model.
    """
    try:
        # 1. Fetch data from Firestore
        docs = db.collection('loads').stream()
        posted_dates = [doc.to_dict().get('posted_date') for doc in docs if doc.to_dict().get('posted_date')]

        if not posted_dates:
            raise HTTPException(status_code=404, detail="No load data available to generate a forecast.")

        # 2. Preprocess the data with pandas
        df = pd.DataFrame(posted_dates, columns=['posted_date'])
        df['posted_date'] = pd.to_datetime(df['posted_date'])
        df.set_index('posted_date', inplace=True)
        df['loads'] = 1
        
        # Resample to get daily counts, filling missing days with 0
        daily_loads = df['loads'].resample('D').sum().asfreq('D', fill_value=0)

        # We need at least 15 data points to train a simple model
        if len(daily_loads) < 15:
            raise HTTPException(status_code=400, detail=f"Not enough data to create a forecast. Need at least 15 days of data, but only have {len(daily_loads)}.")

        # 3. Train a SARIMA time-series model
        # The (p,d,q) and (P,D,Q,m) orders are hyperparameters. These are common starting points.
        # m=7 indicates a weekly seasonal pattern.
        model = sm.tsa.SARIMAX(
            daily_loads,
            order=(1, 1, 1),
            seasonal_order=(1, 1, 1, 7),
            enforce_stationarity=False,
            enforce_invertibility=False
        )
        
        results = model.fit(disp=False)

        # 4. Get the 7-day forecast
        forecast = results.get_forecast(steps=7)
        predicted_mean = forecast.predicted_mean

        # Create the response
        last_date = daily_loads.index[-1]
        forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=7)
        
        forecast_data = [
            {"date": date.strftime('%Y-%m-%d'), "predicted_loads": max(0, round(value))}
            for date, value in zip(forecast_dates, predicted_mean)
        ]

        return forecast_data

    except Exception as e:
        # Catch-all for any other errors during processing
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the forecast: {str(e)}")