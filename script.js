document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading time
    setTimeout(function() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('background-audio').play();
    }, 3000); // 3 seconds loading time

    // Join WhatsApp Group and Channel buttons functionality
    document.getElementById('join-whatsapp-group').addEventListener('click', function() {
        window.open('https://chat.whatsapp.com/FyKE4VkFZiqAx82RjMBpnM?mode=r_c', '_blank');
        checkUserActions();
    });

    document.getElementById('join-whatsapp-channel').addEventListener('click', function() {
        window.open('https://whatsapp.com/channel/0029VbAhndjKLaHneeiTAy3J', '_blank');
        checkUserActions();
    });

    // Fork GitHub Repo button functionality
    document.getElementById('fork-github-repo').addEventListener('click', function() {
        window.open('YOUR_GITHUB_REPO_LINK', '_blank');
        checkUserActions();
    });

    // Function to check if user has performed all required actions
    function checkUserActions() {
        // For demonstration, assuming all actions are done when all three buttons are clicked
        // In a real scenario, you'd need to verify the actions through APIs or other means
        if (localStorage.getItem('joinedGroup') && localStorage.getItem('joinedChannel') && localStorage.getItem('forkedRepo')) {
            document.getElementById('bot-section').style.display = 'block';
        } else {
            // Simple demonstration: setting items on button click
            if (document.getElementById('join-whatsapp-group').clicked) localStorage.setItem('joinedGroup', true);
            if (document.getElementById('join-whatsapp-channel').clicked) localStorage.setItem('joinedChannel', true);
            if (document.getElementById('fork-github-repo').clicked) localStorage.setItem('forkedRepo', true);
        }
    }

    // Simple animation for the background
    const canvas = document.getElementById('animated-background');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Simple animation: drawing a circle that moves
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
        ctx.fill();
    }
    animate();
});
