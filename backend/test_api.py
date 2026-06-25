"""End-to-end smoke test for the Chefly backend.

Exercises every endpoint against a running server:
  meta (/ , /health) → time-aware suggestions → auth → save/saved → history.

Usage:
    BASE_URL=http://127.0.0.1:8099 python test_api.py
    python test_api.py                       # defaults to http://127.0.0.1:8099
    python test_api.py --with-images         # also test (slow, paid) image gen

Exit code is non-zero if any required check fails.
"""
import os
import sys
import time

import requests

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8099").rstrip("/")
WITH_IMAGES = "--with-images" in sys.argv
TIMEOUT = 90

passed, failed = 0, 0


def check(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅ {name}")
    else:
        failed += 1
        print(f"  ❌ {name} {('— ' + detail) if detail else ''}")


def section(title):
    print(f"\n=== {title} ===")


def main():
    print(f"Testing Chefly API at {BASE_URL}")

    # 1. Meta
    section("Meta")
    r = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
    check("GET / returns 200", r.status_code == 200, r.text)
    check("GET / mentions Chefly", "Chefly" in r.text)

    r = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
    body = r.json()
    check("GET /health is 200", r.status_code == 200)
    check("DB reachable", body.get("database") == "ok", str(body))
    check("AI configured", body.get("ai_configured") is True, str(body))

    # 2. Time-aware suggestions: morning vs evening should differ in meal_type.
    section("Time-aware suggestions")
    payload = {
        "ingredients": ["rice", "tomatoes", "onions", "pepper", "eggs"],
        "preferences": {"cuisine": "Nigerian", "spice_level": "Medium", "max_time": 45},
    }
    morning = requests.post(
        f"{BASE_URL}/recipes/suggest", json={**payload, "local_hour": 7}, timeout=TIMEOUT
    ).json()["recipes"]
    evening = requests.post(
        f"{BASE_URL}/recipes/suggest", json={**payload, "local_hour": 20}, timeout=TIMEOUT
    ).json()["recipes"]
    check("morning returns recipes", len(morning) > 0)
    check("evening returns recipes", len(evening) > 0)
    check("recipes carry why_now", all(r.get("why_now") for r in morning + evening))
    morning_types = {r["meal_type"] for r in morning}
    evening_types = {r["meal_type"] for r in evening}
    print(f"     morning meal_types={morning_types}  evening meal_types={evening_types}")
    check("morning leans Breakfast", "Breakfast" in morning_types, str(morning_types))
    check("evening leans Dinner", "Dinner" in evening_types, str(evening_types))
    check("max_time respected", all(r["estimated_time_minutes"] <= 45 for r in morning + evening))

    # 3. Auth
    section("Auth")
    email = f"chefly_test_{int(time.time())}@example.com"
    pw = "password123"
    r = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": email, "password": pw, "name": "Test Cook"},
        timeout=TIMEOUT,
    )
    check("register 200", r.status_code == 200, r.text)
    r = requests.post(
        f"{BASE_URL}/auth/login", json={"email": email, "password": pw}, timeout=TIMEOUT
    )
    check("login 200", r.status_code == 200, r.text)
    token = r.json().get("access_token", "")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=TIMEOUT)
    check("me returns same email", r.status_code == 200 and r.json().get("email") == email, r.text)

    # 4. Save + saved
    section("Save / Saved")
    recipe = evening[0]
    r = requests.post(f"{BASE_URL}/recipes/save", json=recipe, headers=headers, timeout=TIMEOUT)
    check("save 200", r.status_code == 200, r.text)
    r = requests.get(f"{BASE_URL}/recipes/saved", headers=headers, timeout=TIMEOUT)
    saved = r.json() if r.status_code == 200 else []
    check("saved contains the recipe", any(s["name"] == recipe["name"] for s in saved), r.text)

    # 5. History
    section("History")
    r = requests.post(
        f"{BASE_URL}/history",
        json={"ingredients": ["rice", "tomatoes"], "recipe_name": recipe["name"], "recipe": recipe},
        headers=headers,
        timeout=TIMEOUT,
    )
    check("log history 200", r.status_code == 200, r.text)
    r = requests.get(f"{BASE_URL}/history", headers=headers, timeout=TIMEOUT)
    hist = r.json().get("history", []) if r.status_code == 200 else []
    check("history returns the entry", any(h["recipe_name"] == recipe["name"] for h in hist), r.text)
    check("history requires auth", requests.get(f"{BASE_URL}/history", timeout=TIMEOUT).status_code == 401)

    # 6. Image generation (optional — slow + costs ~$0.04)
    if WITH_IMAGES:
        section("Image generation")
        r = requests.post(
            f"{BASE_URL}/images/generate",
            json={"recipe_name": recipe["name"], "recipe_description": recipe["description"]},
            timeout=TIMEOUT,
        )
        body = r.json()
        check("image generate 200", r.status_code == 200, r.text)
        check("image url returned", bool(body.get("image_url")), str(body)[:200])

    # Summary
    print(f"\n{'=' * 40}\nRESULT: {passed} passed, {failed} failed\n{'=' * 40}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
