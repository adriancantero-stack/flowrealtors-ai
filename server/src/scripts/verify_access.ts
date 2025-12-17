
import fetch from 'node-fetch';

async function verify() {
    const API = 'http://localhost:5001'; // Running default backend port? 5001 based on previous summary
    const token = 'mock-jwt-token-1'; // Adrian (ID 1)

    try {
        const res = await fetch(`${API}/api/admin/brokers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        try {
            const json = await res.json();
            console.log('Data:', JSON.stringify(json, null, 2));
        } catch {
            console.log('Response text:', await res.text());
        }

    } catch (err) {
        console.error(err);
    }
}

verify();
