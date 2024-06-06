document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Form Data:', { fname, lname, email, password });
    
    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fname, lname, email, password })
        });

        if (response.ok) {
            const responseData = await response.json();
            const token = responseData.token; 
            window.location.href = `/confirm/${token}`;
        } else {
            alert('Registration failed! Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred! Please try again later.');
    }
});
