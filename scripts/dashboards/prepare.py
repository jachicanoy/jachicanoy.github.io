"""
Builds the aggregated JSON used by the /dashboards pages from the original Power BI models.

Usage:
    pip install pbixray pandas
    python scripts/dashboards/prepare.py <R4V_RMRP.pbix> <AFG_Country_Overview.pbix>

Only aggregates are written to src/data/dashboards/ (no row-level records). All inputs are
public datasets: R4V RMRP 2023 planning figures; World Bank WDI, OCHA HNO (via HDX),
IOM/OCHA displacement, INFORM Risk and ACLED (aggregated counts only, per ACLED terms).
"""
import json
import sys
from pathlib import Path

import pandas as pd
from pbixray import PBIXRay

OUT = Path(__file__).resolve().parents[2] / "src" / "data" / "dashboards"
OUT.mkdir(parents=True, exist_ok=True)


def num(x):
    return 0 if pd.isna(x) else int(round(float(x)))


def rmrp(path: str):
    m = PBIXRay(path)
    pin, tgt, pop, ben = (m.get_table(t) for t in ["PIN", "Target", "POP_Projections", "Beneficiaries"])
    countries = []
    for _, r in pop.sort_values("Country").iterrows():
        c = r["Country"]
        p = pin[pin.Country == c]
        t = tgt[tgt.Country == c]
        norm = lambda x: str(x).replace("ç", "c")  # source tables spell Curaçao inconsistently
        b = ben[(ben["Consolidated Country"].map(norm) == norm(c)) & (ben.Subsector == "Intersector")]
        pi, ti = p[p.Sector == "Intersector"], t[t.Sector == "Intersector"]
        countries.append({
            "name": c.replace("Curacao", "Curaçao"),
            "platform": r["Platform"],
            "pop": {
                "destination": num(r["Total 2023 In Destination"]),
                "transit": num(r["Total 2023 In Transit"]),
                "host": num(r["Total 2023 Host Community"]),
            },
            "pin": num(pi["PiN Total 2023"].sum()),
            "target": num(ti["Target Total 2023"].sum()),
            "pinSex": {k: num(pi[f"PiN {k} Total 2023"].sum()) for k in ["Girls", "Boys", "Women", "Men"]},
            "sectors": {
                s: {
                    "pin": num(p[p.Sector == s]["PiN Total 2023"].sum()),
                    "target": num(t[t.Sector == s]["Target Total 2023"].sum()),
                }
                for s in sorted(set(p.Sector) | set(t.Sector)) if s != "Intersector"
            },
            "reached": [
                {"month": str(mo)[:7], "value": num(v)}
                for mo, v in b.groupby("Month")["Accumulated Total"].sum().sort_index().items()
            ],
        })
    (OUT / "rmrp-2023.json").write_text(json.dumps({"countries": countries}, ensure_ascii=False))


def afghanistan(path: str):
    m = PBIXRay(path)
    wb = m.get_table("World_Bank").dropna(subset=["Series Name"]).set_index("Series Name")["2018 [YR2018]"]
    kpi = {
        "population_m": float(wb["Population, total"]),
        "poverty_pct": float(wb["Poverty headcount ratio at national poverty lines (% of population)"]),
        "life_expectancy": float(wb["Life expectancy at birth, total (years)"]),
        "u5_mortality": float(wb["Mortality rate, under-5 (per 1,000 live births)"]),
        "gni_pc": float(wb["GNI per capita, Atlas method (current US$)"]),
        "internet_pct": float(wb["Individuals using the Internet (% of population)"]),
    }
    codes = {"EDU": "edu", "FSA": "fsa", "HEA": "hea", "NUT": "nut", "PRO": "pro", "SHL": "shl", "WSH": "wsh", "Total": "all"}
    provinces = {}
    for t, key in codes.items():
        df = m.get_table(t)
        for _, r in df.iterrows():
            provinces.setdefault(r["Province"], {"region": r["Region"]})[key] = num(r["Total"])
    idp = m.get_table("IDPs")
    idp_prov = idp.groupby("DISP_PROV_NAME")["DISP_IND"].sum().sort_values(ascending=False)
    acled = m.get_table("conflict_data_afg")
    by_year = acled.groupby("year").agg(events=("event_id_cnty", "count"), fatalities=("Fatalities", "sum"))
    by_type = acled.groupby("event_type")["event_id_cnty"].count().sort_values(ascending=False)
    inf = m.get_table("INFORM Risk Mid2020 (a-z)")
    inf = inf[inf.ISO3 == "AFG"].iloc[0]
    out = {
        "kpi": kpi,
        "hno": {"provinces": [{"name": k, **v} for k, v in sorted(provinces.items())]},
        "idps": {
            "period": [str(idp.DISP_DATE.min())[:10], str(idp.DISP_DATE.max())[:10]],
            "total": num(idp.DISP_IND.sum()),
            "byProvince": [{"name": k, "value": num(v)} for k, v in idp_prov.head(10).items()],
        },
        "conflict": {
            "byYear": [{"year": int(y), "events": int(r.events), "fatalities": num(r.fatalities)} for y, r in by_year.iterrows()],
            "byType": [{"type": k, "value": int(v)} for k, v in by_type.items()],
        },
        "inform": {k: float(inf[k]) for k in ["HAZARD & EXPOSURE", "VULNERABILITY", "LACK OF COPING CAPACITY", "INFORM RISK"] if k in inf},
    }
    (OUT / "afghanistan.json").write_text(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    rmrp(sys.argv[1])
    afghanistan(sys.argv[2])
    print("written to", OUT)
