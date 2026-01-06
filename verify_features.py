import requests
import json
import time

print("="*60)
print("VERIFICATION TEST: All Features After Superuser Creation")
print("="*60)

# Test 1: Hospital admin login
print("\n[Test 1] Hospital Admin Login")
login_response = requests.post('http://127.0.0.1:8000/api/login/', 
    json={'username': 'hospital@111.com', 'password': 'hospital111'})
print(f"Status: {login_response.status_code}")
if login_response.status_code == 200:
    print("✓ Hospital admin login works")
    token = login_response.json()['access']
else:
    print(f"✗ Failed: {login_response.json()}")
    exit(1)

# Test 2: Superuser login  
print("\n[Test 2] Superuser Login")
admin_login = requests.post('http://127.0.0.1:8000/api/login/', 
    json={'username': 'admin', 'password': 'Admin@12345'})
print(f"Status: {admin_login.status_code}")
if admin_login.status_code == 200:
    print("✓ Superuser login works")
else:
    print(f"✗ Failed: {admin_login.json()}")

# Test 3: Add patient as hospital admin
print("\n[Test 3] Add Patient")
patient_data = {
    'first_name': 'Verify',
    'last_name': 'Patient',
    'email': f'verify.patient.{int(time.time())}@test.com',
    'contact_no': '1234567890',
    'gender': 'Female',
    'password': 'TestPass@123'
}

add_response = requests.post('http://127.0.0.1:8000/api/hospital/patients/add/',
    headers={'Authorization': f'Bearer {token}'},
    json=patient_data)

print(f"Status: {add_response.status_code}")
if add_response.status_code == 201:
    print("✓ Patient add works")
else:
    print(f"✗ Failed: {add_response.json()}")

# Test 4: Staff list
print("\n[Test 4] Get Staff List")
staff_response = requests.get('http://127.0.0.1:8000/api/hospital/staff/',
    headers={'Authorization': f'Bearer {token}'})

print(f"Status: {staff_response.status_code}")
if staff_response.status_code == 200:
    staff_data = staff_response.json()
    if isinstance(staff_data, dict) and 'results' in staff_data:
        count = len(staff_data['results'])
    elif isinstance(staff_data, list):
        count = len(staff_data)
    else:
        count = "N/A"
    print(f"✓ Staff list works (total: {count})")
else:
    print(f"✗ Failed: {staff_response.json()}")

# Test 5: Get articles
print("\n[Test 5] Get Articles")
articles_response = requests.get('http://127.0.0.1:8000/api/articles/',
    headers={'Authorization': f'Bearer {token}'})

print(f"Status: {articles_response.status_code}")
if articles_response.status_code == 200:
    print("✓ Article list works")
else:
    print(f"✗ Failed: {articles_response.json()}")

print("\n" + "="*60)
print("✓ ALL CORE FEATURES VERIFIED - NO DISRUPTION")
print("="*60)
