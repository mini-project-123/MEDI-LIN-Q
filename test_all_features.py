#!/usr/bin/env python
"""
Test script to verify all hospital dashboard functionality
"""
import requests
import json
from datetime import datetime

BASE_URL = 'http://127.0.0.1:8000/api'
HOSPITAL_EMAIL = 'hospital@111.com'
HOSPITAL_PASSWORD = 'hospital111'

def test_authentication():
    """Test login and get token"""
    print("\n=== Testing Authentication ===")
    response = requests.post(f'{BASE_URL}/login/', json={
        'username': HOSPITAL_EMAIL,  # Hospital admin uses email as username
        'password': HOSPITAL_PASSWORD
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        token = response.json().get('access')
        print(f"✓ Authentication successful")
        return token
    else:
        print(f"✗ Authentication failed: {response.text}")
        return None

def test_patient_list(token):
    """Test getting patient list"""
    print("\n=== Testing Patient List ===")
    response = requests.get(f'{BASE_URL}/hospital/patients/', headers={
        'Authorization': f'Bearer {token}'
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        patients = response.json()
        print(f"✓ Retrieved {len(patients)} patients")
        return patients
    else:
        print(f"✗ Failed to get patients: {response.text}")
        return []

def test_add_patient(token):
    """Test adding a new patient"""
    print("\n=== Testing Add Patient ===")
    payload = {
        'first_name': f'TestPatient{datetime.now().timestamp()}',
        'last_name': 'Test',
        'email': f'testpatient{int(datetime.now().timestamp())}@test.com',
        'password': 'TestPass@123',
        'contact_no': '+1234567890',
        'gender': 'Male',
        'blood_group': 'O+',
        'allergies': 'None'
    }
    response = requests.post(f'{BASE_URL}/hospital/patients/add/', 
        json=payload,
        headers={'Authorization': f'Bearer {token}'}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        patient = response.json()
        print(f"✓ Patient added: {patient.get('user', {}).get('first_name')}")
        return patient.get('user', {}).get('id')
    else:
        print(f"✗ Failed to add patient: {response.text}")
        return None

def test_staff_list(token):
    """Test getting staff list"""
    print("\n=== Testing Staff List ===")
    response = requests.get(f'{BASE_URL}/hospital/staff/', headers={
        'Authorization': f'Bearer {token}'
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        staff = response.json()
        print(f"✓ Retrieved {len(staff)} staff members")
        return staff
    else:
        print(f"✗ Failed to get staff: {response.text}")
        return []

def test_add_staff(token):
    """Test adding new staff"""
    print("\n=== Testing Add Staff ===")
    payload = {
        'first_name': f'TestStaff{datetime.now().timestamp()}',
        'last_name': 'Test',
        'email': f'teststaff{int(datetime.now().timestamp())}@test.com',
        'password': 'TestPass@123',
        'contact_no': '+1234567890',
        'gender': 'Female',
        'job_title': 'Nurse'
    }
    response = requests.post(f'{BASE_URL}/hospital/staff/add/', 
        json=payload,
        headers={'Authorization': f'Bearer {token}'}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        staff = response.json()
        print(f"✓ Staff added: {staff.get('user', {}).get('first_name')}")
        return staff.get('user', {}).get('id')
    else:
        print(f"✗ Failed to add staff: {response.text}")
        return None

def test_patient_history(token, patient_id):
    """Test getting patient history"""
    if not patient_id:
        print("\n=== Skipping Patient History (no patient_id) ===")
        return
    
    print("\n=== Testing Patient History ===")
    response = requests.get(f'{BASE_URL}/hospital/patients/{patient_id}/history/', 
        headers={'Authorization': f'Bearer {token}'}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        history = response.json()
        print(f"✓ Retrieved history with {len(history.get('appointments', []))} appointments and {len(history.get('medical_reports', []))} reports")
    else:
        print(f"✗ Failed to get patient history: {response.text}")

def test_article_list(token):
    """Test getting article list"""
    print("\n=== Testing Article List ===")
    response = requests.get(f'{BASE_URL}/articles/', headers={
        'Authorization': f'Bearer {token}'
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        articles = response.json()
        print(f"✓ Retrieved {len(articles) if isinstance(articles, list) else articles.get('count', 0)} articles")
    else:
        print(f"✗ Failed to get articles: {response.text}")

def main():
    print("=" * 50)
    print("HOSPITAL DASHBOARD API TEST SUITE")
    print("=" * 50)
    
    # Get auth token
    token = test_authentication()
    if not token:
        print("\n✗ Cannot proceed without authentication")
        return
    
    # Test patient operations
    patients = test_patient_list(token)
    new_patient_id = test_add_patient(token)
    test_patient_history(token, new_patient_id)
    
    # Test staff operations
    staff = test_staff_list(token)
    new_staff_id = test_add_staff(token)
    
    # Test articles
    test_article_list(token)
    
    print("\n" + "=" * 50)
    print("TEST SUITE COMPLETE")
    print("=" * 50)

if __name__ == '__main__':
    main()
