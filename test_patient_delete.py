import requests
import json

# Login
login_response = requests.post('http://127.0.0.1:8000/api/login/', 
    json={'username': 'hospital@111.com', 'password': 'hospital111'})

if login_response.status_code == 200:
    token = login_response.json()['access']
    print("✓ Logged in successfully")
    
    # Get patients list
    list_response = requests.get('http://127.0.0.1:8000/api/hospital/patients/',
        headers={'Authorization': f'Bearer {token}'})
    
    print(f"Patient list status: {list_response.status_code}")
    
    if list_response.status_code == 200:
        data = list_response.json()
        # Handle pagination
        patients = data.get('results', data) if isinstance(data, dict) else data
        
        print(f"Total patients: {len(patients) if isinstance(patients, list) else data.get('count', 0)}")
        
        if isinstance(patients, list) and len(patients) > 0:
            patient_id = patients[0]['user']['id']
            print(f"Testing delete on patient ID: {patient_id}")
            
            # Try to delete
            delete_response = requests.delete(f'http://127.0.0.1:8000/api/hospital/patients/{patient_id}/manage/',
                headers={'Authorization': f'Bearer {token}'})
            
            print(f"Delete status: {delete_response.status_code}")
            if delete_response.status_code == 204:
                print("✓ Patient deleted successfully!")
            else:
                print(f"Response: {delete_response.text}")
