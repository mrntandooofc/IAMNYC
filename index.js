<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LADYBUG.INC BOT</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading-screen">
        <h2>Loading...</h2>
    </div>

    <!-- Main Content -->
    <div id="main-content" style="display:none;">
        <!-- Background Audio -->
        <audio id="background-audio" loop>
            <source src="background-music.mp3" type="audio/mp3">
            Your browser does not support the audio element.
        </audio>

        <!-- Animated Background -->
        <canvas id="animated-background"></canvas>

        <!-- WhatsApp Group and Channel Join Section -->
        <div id="whatsapp-section">
            <h2>Join Our WhatsApp Group and Channel</h2>
            <button id="join-whatsapp-group">Join Group</button>
            <button id="join-whatsapp-channel">Join Channel</button>
        </div>

        <!-- GitHub Repo Fork Section -->
        <div id="github-section">
            <h2>Fork Our GitHub Repository</h2>
            <button id="fork-github-repo">Fork Repo</button>
        </div>

        <!-- Bot Section -->
        <div id="bot-section" style="display:none;">
            <h2>Welcome to LADYBUG.INC BOT</h2>
            <!-- Add your bot content here -->
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
