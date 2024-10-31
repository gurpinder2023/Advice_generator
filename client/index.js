document.getElementById('registerForm').addEventListener('submit', submitForm);

async function submitForm(event) {
    event.preventDefault(); // Prevent the default form submission
    
    const name = document.getElementById('name').value; // Get name input
    const email = document.getElementById('email').value; // Get email input
    const password = document.getElementById('password').value; // Get password input

    const userData = {
        name: name,
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:5000/register', { // Replace with your backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const result = await response.json();
            alert('Registration successful!'); // You can handle success here
            console.log(result); // Log result or redirect the user
        } else {
            const error = await response.json();
            alert('Registration failed: ' + error.message); // Handle errors
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    }
}
