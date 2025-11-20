import requests
import sys

BASE_URL = "http://localhost:8002"

def test_auth():
    email = "test@example.com"
    password = "password123"
    name = "Test User"

    # 1. Register
    print("Testing Register...")
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "name": name
    })
    
    if response.status_code == 200:
        print("Register Success:", response.json())
    elif response.status_code == 400 and "Email already registered" in response.text:
        print("User already exists, proceeding to login...")
    else:
        print("Register Failed:", response.text)
        sys.exit(1)

    # 2. Login
    print("\nTesting Login...")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })

    if response.status_code == 200:
        token_data = response.json()
        print("Login Success:", token_data)
        access_token = token_data["access_token"]
    else:
        print("Login Failed:", response.text)
        sys.exit(1)

    # 3. Get Me
    print("\nTesting Get Me...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)

    if response.status_code == 200:
        print("Get Me Success:", response.json())
    else:
        print("Get Me Failed:", response.text)
        sys.exit(1)

if __name__ == "__main__":
    test_auth()
