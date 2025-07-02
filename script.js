document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Button clicked:', button.textContent);
            // Add more functionality here
        });
    });
});
