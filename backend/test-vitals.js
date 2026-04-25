async function triggerCriticalVitals() {
  try {
    console.log('Logging in as nurse...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nurse1@hospital.com',
        password: 'nurse123'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Got token. Fetching patients...');
    
    const patientsRes = await fetch('http://localhost:5000/api/patients', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const patientsData = await patientsRes.json();
    
    if (patientsData.patients && patientsData.patients.length > 0) {
      const patient = patientsData.patients[0];
      console.log(`Found patient: ${patient.name} (${patient._id}). Updating vitals to critical...`);
      
      const updateRes = await fetch(`http://localhost:5000/api/patients/${patient._id}/vitals`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          pulse: 155, // Critical > 120
          bloodPressure: '180/110',
          temperature: 101.5,
          oxygenSaturation: 88 // Critical < 90
        })
      });
      
      console.log('Vitals updated successfully! Auto-alert should have fired.');
    } else {
      console.log('No patients found to update.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

triggerCriticalVitals();
