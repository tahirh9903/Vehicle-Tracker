from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

vehicles = pd.read_csv("data/vehicle.csv", encoding="latin1", low_memory=False)
accidents = pd.read_csv("data/accident.csv", encoding="latin1", low_memory=False)
makes = pd.read_csv("data/make.csv", encoding="latin1")

vehicles.columns = vehicles.columns.str.strip().str.upper()
accidents.columns = accidents.columns.str.strip().str.upper()
makes.columns = makes.columns.str.strip().str.upper()

merged = pd.merge(vehicles, accidents, on="ST_CASE", how="left")
merged = pd.merge(merged, makes, left_on="MAKE", right_on="MAK", how="left")

@app.route("/", methods=["GET", "POST"])
def index():
    data = []
    if request.method == "POST":
        make_query = request.form["make"].upper().strip()
        filtered = merged[merged["MAKE_NAME"].str.upper() == make_query]

        # Expanded fields from vehicle, accident, and make data
        columns_to_show = ['MAKE_NAME', 'MOD_YEAR', 'BODY_TYP', 'DRV_AGEN', 'DRV_SEX', 'ROLLOVER', 'L_COMPL', 'L_STATUS', 'TRAV_SP', 'DEATHS', 'STATE', 'DAY', 'MONTH', 'HOUR', 'MINUTE', 'WEATHER', 'MAN_COLL', 'LIGHT_COND', 'ROUTE', 'RELJCT1', 'FATALS', 'LATITUDE', 'LONGITUD']
        available_cols = [col for col in columns_to_show if col in filtered.columns]
        data = filtered[available_cols].fillna("").to_dict(orient="records")
    return render_template("index.html", data=data)

if __name__ == "__main__":
    app.run(debug=True)
