import pandas as pd
import numpy as np
from datetime import datetime
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def load_and_process_data():
    """Load all CSVs, join them, and derive necessary columns."""

    # ── Load CSVs ──────────────────────────────────────────────
    patients = pd.read_csv(os.path.join(DATA_DIR, "patients.csv"))
    encounters = pd.read_csv(os.path.join(DATA_DIR, "encounters.csv"))
    organizations = pd.read_csv(os.path.join(DATA_DIR, "organizations.csv"))
    providers = pd.read_csv(os.path.join(DATA_DIR, "providers.csv"))
    payers = pd.read_csv(os.path.join(DATA_DIR, "payers.csv"))

    # ── Parse dates ────────────────────────────────────────────
    encounters["START"] = pd.to_datetime(encounters["START"], utc=True)
    encounters["STOP"] = pd.to_datetime(encounters["STOP"], utc=True)
    patients["BIRTHDATE"] = pd.to_datetime(patients["BIRTHDATE"])

    # ── Derive encounter time columns ──────────────────────────
    encounters["YEAR"] = encounters["START"].dt.year
    encounters["MONTH"] = encounters["START"].dt.month

    # ── Derive patient age and age group ───────────────────────
    reference_date = datetime.now()
    patients["AGE"] = patients["BIRTHDATE"].apply(
        lambda bd: (reference_date - bd).days // 365
    )

    def assign_age_group(age):
        if age <= 18:
            return "0-18"
        elif age <= 34:
            return "19-34"
        elif age <= 50:
            return "35-50"
        elif age <= 65:
            return "51-65"
        else:
            return "65+"

    patients["AGE_GROUP"] = patients["AGE"].apply(assign_age_group)

    # ── Derive coverage level ──────────────────────────────────
    patients["HEALTHCARE_EXPENSES"] = pd.to_numeric(patients["HEALTHCARE_EXPENSES"], errors="coerce")
    patients["HEALTHCARE_COVERAGE"] = pd.to_numeric(patients["HEALTHCARE_COVERAGE"], errors="coerce")

    def assign_coverage_level(row):
        if row["HEALTHCARE_EXPENSES"] == 0:
            return "Low"
        ratio = row["HEALTHCARE_COVERAGE"] / row["HEALTHCARE_EXPENSES"]
        if ratio < 0.3:
            return "Low"
        elif ratio < 0.6:
            return "Medium"
        else:
            return "High"

    patients["COVERAGE_LEVEL"] = patients.apply(assign_coverage_level, axis=1)

    # ── Rename columns before joining to avoid conflicts ───────
    patients_slim = patients[[
        "Id", "BIRTHDATE", "GENDER", "CITY", "STATE", "COUNTY", "ZIP",
        "LAT", "LON", "AGE", "AGE_GROUP", "COVERAGE_LEVEL",
        "HEALTHCARE_EXPENSES", "HEALTHCARE_COVERAGE", "INCOME"
    ]].rename(columns={
        "Id": "PATIENT_ID",
        "LAT": "PATIENT_LAT",
        "LON": "PATIENT_LON",
        "CITY": "PATIENT_CITY",
        "STATE": "PATIENT_STATE",
        "ZIP": "PATIENT_ZIP"
    })

    organizations_slim = organizations[[
        "Id", "NAME", "CITY", "STATE", "LAT", "LON", "UTILIZATION"
    ]].rename(columns={
        "Id": "ORG_ID",
        "NAME": "ORG_NAME",
        "CITY": "ORG_CITY",
        "STATE": "ORG_STATE",
        "LAT": "ORG_LAT",
        "LON": "ORG_LON"
    })

    providers_slim = providers[[
        "Id", "SPECIALITY", "NAME"
    ]].rename(columns={
        "Id": "PROVIDER_ID",
        "NAME": "PROVIDER_NAME",
        "SPECIALITY": "PROVIDER_SPECIALITY"
    })

    payers_slim = payers[[
        "Id", "NAME", "OWNERSHIP"
    ]].rename(columns={
        "Id": "PAYER_ID",
        "NAME": "PAYER_NAME",
        "OWNERSHIP": "PAYER_OWNERSHIP"
    })

    # ── Join into master dataset ───────────────────────────────
    master = encounters.merge(
        patients_slim, left_on="PATIENT", right_on="PATIENT_ID", how="left"
    )
    master = master.merge(
        organizations_slim, left_on="ORGANIZATION", right_on="ORG_ID", how="left"
    )
    master = master.merge(
        providers_slim, left_on="PROVIDER", right_on="PROVIDER_ID", how="left"
    )
    master = master.merge(
        payers_slim, left_on="PAYER", right_on="PAYER_ID", how="left"
    )

    # ── Derive out-of-pocket cost ──────────────────────────────
    master["TOTAL_CLAIM_COST"] = pd.to_numeric(master["TOTAL_CLAIM_COST"], errors="coerce")
    master["PAYER_COVERAGE"] = pd.to_numeric(master["PAYER_COVERAGE"], errors="coerce")
    master["OUT_OF_POCKET"] = master["TOTAL_CLAIM_COST"] - master["PAYER_COVERAGE"]

    print(f"   Data loaded: {len(master)} encounter records")
    print(f"   Unique patients: {master['PATIENT'].nunique()}")
    print(f"   Unique organizations: {master['ORGANIZATION'].nunique()}")
    print(f"   Year range: {master['YEAR'].min()} – {master['YEAR'].max()}")

    return master


def get_filter_options(master):
    """Extract all unique filter values from the master dataset."""
    return {
        "years": sorted(master["YEAR"].dropna().unique().astype(int).tolist()),
        "months": sorted(master["MONTH"].dropna().unique().astype(int).tolist()),
        "states": sorted(master["PATIENT_STATE"].dropna().unique().tolist()),
        "cities": sorted(master["PATIENT_CITY"].dropna().unique().tolist()),
        "genders": sorted(master["GENDER"].dropna().unique().tolist()),
        "age_groups": ["0-18", "19-34", "35-50", "51-65", "65+"],
        "coverage_levels": ["Low", "Medium", "High"],
        "specialties": sorted(master["PROVIDER_SPECIALITY"].dropna().unique().tolist()),
        "payer_names": sorted(master["PAYER_NAME"].dropna().unique().tolist()),
    }


def apply_filters(master, filters):
    """Apply user-selected filters to the master dataset and return filtered copy."""
    df = master.copy()

    if filters.get("years"):
        df = df[df["YEAR"].isin(filters["years"])]

    if filters.get("months"):
        df = df[df["MONTH"].isin(filters["months"])]

    if filters.get("states"):
        df = df[df["PATIENT_STATE"].isin(filters["states"])]

    if filters.get("cities"):
        df = df[df["PATIENT_CITY"].isin(filters["cities"])]

    if filters.get("genders"):
        df = df[df["GENDER"].isin(filters["genders"])]

    if filters.get("age_groups"):
        df = df[df["AGE_GROUP"].isin(filters["age_groups"])]

    if filters.get("coverage_levels"):
        df = df[df["COVERAGE_LEVEL"].isin(filters["coverage_levels"])]

    if filters.get("specialties"):
        df = df[df["PROVIDER_SPECIALITY"].isin(filters["specialties"])]

    if filters.get("payer_names"):
        df = df[df["PAYER_NAME"].isin(filters["payer_names"])]

    return df


def compute_dashboard_data(df):
    """Compute all KPIs and chart data from a (filtered) dataframe."""

    # ── KPI Cards ──────────────────────────────────────────────
    total_patients = int(df["PATIENT"].nunique())
    total_encounters = len(df)
    avg_treatment_cost = round(float(df["TOTAL_CLAIM_COST"].mean()), 2) if len(df) > 0 else 0
    avg_out_of_pocket = round(float(df["OUT_OF_POCKET"].mean()), 2) if len(df) > 0 else 0

    # ── Avg Treatment Cost vs Coverage Level (Scatter) ─────────
    cost_vs_coverage = []
    if len(df) > 0:
        grouped = df.groupby("COVERAGE_LEVEL").agg(
            avg_cost=("TOTAL_CLAIM_COST", "mean"),
            patient_count=("PATIENT", "nunique"),
            encounter_count=("Id", "count")
        ).reset_index()
        for _, row in grouped.iterrows():
            cost_vs_coverage.append({
                "coverage_level": row["COVERAGE_LEVEL"],
                "avg_cost": round(row["avg_cost"], 2),
                "patient_count": int(row["patient_count"]),
                "encounter_count": int(row["encounter_count"]),
            })

    # ── Encounters by Age Group (Horizontal Stacked Bar) ───────
    encounters_by_age = []
    if len(df) > 0:
        age_cov = df.groupby(["AGE_GROUP", "COVERAGE_LEVEL"]).size().reset_index(name="count")
        for age_grp in ["0-18", "19-34", "35-50", "51-65", "65+"]:
            entry = {"age_group": age_grp, "Low": 0, "Medium": 0, "High": 0}
            sub = age_cov[age_cov["AGE_GROUP"] == age_grp]
            for _, row in sub.iterrows():
                entry[row["COVERAGE_LEVEL"]] = int(row["count"])
            encounters_by_age.append(entry)

    # ── Top Providers (Organizations) by Avg Cost per Visit ────
    top_providers = []
    if len(df) > 0:
        org_cost = df.groupby("ORG_NAME").agg(
            avg_cost=("TOTAL_CLAIM_COST", "mean"),
            encounter_count=("Id", "count")
        ).reset_index()
        org_cost = org_cost.sort_values("avg_cost", ascending=False).head(10)
        for _, row in org_cost.iterrows():
            top_providers.append({
                "name": row["ORG_NAME"],
                "avg_cost": round(row["avg_cost"], 2),
                "encounter_count": int(row["encounter_count"]),
            })

    # ── Insurance Impact on Out-of-Pocket Costs ────────────────
    insurance_impact = []
    if len(df) > 0:
        ins_grp = df.groupby("COVERAGE_LEVEL").agg(
            avg_out_of_pocket=("OUT_OF_POCKET", "mean"),
            avg_payer_coverage=("PAYER_COVERAGE", "mean"),
            avg_total_cost=("TOTAL_CLAIM_COST", "mean"),
        ).reset_index()
        for level in ["Low", "Medium", "High"]:
            sub = ins_grp[ins_grp["COVERAGE_LEVEL"] == level]
            if len(sub) > 0:
                row = sub.iloc[0]
                insurance_impact.append({
                    "coverage_level": level,
                    "out_of_pocket": round(row["avg_out_of_pocket"], 2),
                    "insurance_covered": round(row["avg_payer_coverage"], 2),
                    "total_cost": round(row["avg_total_cost"], 2),
                })

    # ── Patient Distribution by State ──────────────────────────
    patient_distribution = []
    if len(df) > 0:
        state_grp = df.groupby("PATIENT_STATE")["PATIENT"].nunique().reset_index(name="patient_count")
        for _, row in state_grp.iterrows():
            patient_distribution.append({
                "state": row["PATIENT_STATE"],
                "patient_count": int(row["patient_count"]),
            })

    # ── Top Providers by Cost with Coverage Breakdown ──────────
    top_providers_breakdown = []
    if len(df) > 0:
        org_cov = df.groupby(["ORG_NAME", "COVERAGE_LEVEL"]).agg(
            avg_cost=("TOTAL_CLAIM_COST", "mean"),
            avg_oop=("OUT_OF_POCKET", "mean"),
            avg_payer=("PAYER_COVERAGE", "mean"),
        ).reset_index()
        # Get top 5 orgs by overall avg cost
        top_org_names = df.groupby("ORG_NAME")["TOTAL_CLAIM_COST"].mean().nlargest(5).index.tolist()
        for org_name in top_org_names:
            entry = {"name": org_name}
            sub = org_cov[org_cov["ORG_NAME"] == org_name]
            for _, row in sub.iterrows():
                level = row["COVERAGE_LEVEL"]
                entry[f"{level}_oop"] = round(row["avg_oop"], 2)
                entry[f"{level}_covered"] = round(row["avg_payer"], 2)
            top_providers_breakdown.append(entry)

    # ── Year-over-Year Cost Trend ──────────────────────────────
    cost_trend = []
    if len(df) > 0:
        yearly = df.groupby("YEAR")["TOTAL_CLAIM_COST"].mean().reset_index()
        yearly = yearly.sort_values("YEAR")
        for _, row in yearly.iterrows():
            cost_trend.append({
                "year": int(row["YEAR"]),
                "avg_cost": round(row["TOTAL_CLAIM_COST"], 2),
            })

    return {
        "kpis": {
            "total_patients": total_patients,
            "total_encounters": total_encounters,
            "avg_treatment_cost": avg_treatment_cost,
            "avg_out_of_pocket": avg_out_of_pocket,
        },
        "cost_vs_coverage": cost_vs_coverage,
        "encounters_by_age": encounters_by_age,
        "top_providers": top_providers,
        "insurance_impact": insurance_impact,
        "patient_distribution": patient_distribution,
        "top_providers_breakdown": top_providers_breakdown,
        "cost_trend": cost_trend,
    }