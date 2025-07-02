document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and display bots, channels, apps, and courses
    // For now, just logging to console
    console.log('Fetching data...');

    // Example fetch call
    fetch('/api/bots')
        .then(response => response.json())
        .then(data => console.log(data));

    // Repeat for channels, apps, and courses
});
