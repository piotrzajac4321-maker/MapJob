# Pomocniczy skrypt jednorazowy: wyciąga JSON z dumpa MCP do oferty-snapshot.json
import json, re, os

SRC = r"C:\Users\48721\.claude\projects\C--Users-48721-Desktop-AMapJob\a1e65c68-3aa1-42e5-9189-7e0a20399c32\tool-results\mcp-82fc2f65-5a44-4e20-ab81-ffbcfa1ac0ba-execute_sql-1779896079380.txt"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "oferty-snapshot.json")

raw = open(SRC, encoding="utf-8").read()
wrapper = json.loads(raw)
inner = wrapper["result"]
start = inner.find("[")
end = inner.rfind("]")
if start < 0 or end < 0:
    raise SystemExit("nie znaleziono nawiasów tablicy JSON")
offers = json.loads(inner[start:end+1])
print("Wyciągnięto ofert:", len(offers))

# Normalizuj numeric salary (Postgres zwraca jako string "6000.00")
for o in offers:
    for k in ("salary_min", "salary_max"):
        if o.get(k) is not None:
            try:
                o[k] = float(o[k])
            except (TypeError, ValueError):
                pass

snapshot = {
    "_meta": {
        "source": "Supabase job_offers WHERE status='active'",
        "fetched_at": "2026-05-27",
        "count": len(offers),
    },
    "offers": offers,
}
with open(OUT, "w", encoding="utf-8", newline="\n") as f:
    json.dump(snapshot, f, ensure_ascii=False, indent=2)
print("Zapisano:", OUT)
