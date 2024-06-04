document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    document.getElementById('message').classList.remove('hidden');
    
    document.getElementById('registrationForm').reset();
});