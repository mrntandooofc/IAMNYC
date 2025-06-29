// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup (using lowdb for simplicity)
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

// Initialize database
db.defaults({ 
    users: [],
    bots: [],
    transactions: [],
    messages: [] 
}).write();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// API Authentication middleware
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = db.get('users').find({ token }).value();
    if (!user) {
        return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
};

// API Endpoints

// User registration and login
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const existingUser = db.get('users').find({ username }).value();
    if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
    }
    
    const token = uuidv4();
    const user = {
        id: uuidv4(),
        username,
        password, // Note: In production, hash the password!
        token,
        coins: 20, // Starting coins
        lastClaim: null
    };
    
    db.get('users').push(user).write();
    res.json({ token, user: { id: user.id, username, coins: user.coins } });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.get('users').find({ username, password }).value();
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
        token: user.token,
        user: {
            id: user.id,
            username: user.username,
            coins: user.coins
        } 
    });
});

// Coin management
app.post('/api/claim-coins', authenticate, (req, res) => {
    const user = req.user;
    const now = new Date();
    
    if (user.lastClaim) {
        const lastClaim = new Date(user.lastClaim);
        const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
        
        if (hoursSince < 24) {
            const remaining = Math.ceil(24 - hoursSince);
            return res.status(400).json({ 
                error: `You can claim again in ${remaining} hours` 
            });
        }
    }
    
    db.get('users')
        .find({ id: user.id })
        .assign({ 
            coins: user.coins + 10,
            lastClaim: now.toISOString() 
        })
        .write();
    
    // Record transaction
    db.get('transactions').push({
        id: uuidv4(),
        userId: user.id,
        type: 'coin_claim',
        amount: 10,
        timestamp: now.toISOString()
    }).write();
    
    res.json({ 
        coins: user.coins + 10,
        lastClaim: now.toISOString() 
    });
});

// Bot management
app.get('/api/bots', authenticate, (req, res) => {
    const bots = db.get('bots').filter({ userId: req.user.id }).value();
    res.json(bots);
});

app.post('/api/bots', 
    authenticate, 
    upload.single('credsFile'), 
    (req, res) => {
        const { name, webhookUrl } = req.body;
        const file = req.file;
        const user = req.user;
        
        if (!name || !webhookUrl || !file) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (user.coins < 10) {
            return res.status(400).json({ error: 'Insufficient coins' });
        }
        
        try {
            // Read and validate the JSON file
            const creds = JSON.parse(fs.readFileSync(file.path, 'utf8'));
            
            // Create the bot
            const bot = {
                id: uuidv4(),
                userId: user.id,
                name,
                webhookUrl,
                status: 'running',
                credsPath: file.path,
                deployedOn: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                messagesProcessed: 0
            };
            
            // Deduct coins and save bot
            db.get('users')
                .find({ id: user.id })
                .assign({ coins: user.coins - 10 })
                .write();
                
            db.get('bots').push(bot).write();
            
            // Record transaction
            db.get('transactions').push({
                id: uuidv4(),
                userId: user.id,
                type: 'bot_deploy',
                amount: -10,
                timestamp: new Date().toISOString()
            }).write();
            
            // In a production app, you would actually start the bot process here
            startBotProcess(bot);
            
            res.status(201).json(bot);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: 'Invalid credentials file' });
        }
    }
);

app.put('/api/bots/:id/status', authenticate, (req, res) => {
    const { status } = req.body;
    const botId = req.params.id;
    
    if (!['running', 'stopped'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    const bot = db.get('bots').find({ id: botId, userId: req.user.id }).value();
    if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
    }
    
    db.get('bots')
        .find({ id: botId })
        .assign({ 
            status,
            lastActive: new Date().toISOString() 
        })
        .write();
        
    // In production, actually start/stop the bot process
    if (status === 'running') {
        startBotProcess(bot);
    } else {
        stopBotProcess(bot);
    }
    
    res.json({ 
        ...bot, 
        status,
        lastActive: new Date().toISOString() 
    });
});

// Message handling
app.post('/api/send-message', authenticate, (req, res) => {
    const { botId, phoneNumber, message } = req.body;
    
    if (!botId || !phoneNumber || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const bot = db.get('bots').find({ id: botId, userId: req.user.id }).value();
    if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
    }
    
    if (bot.status !== 'running') {
        return res.status(400).json({ error: 'Bot is not running' });
    }
    
    // In production, this would actually send the message via WhatsApp API
    const messageRecord = {
        id: uuidv4(),
        botId,
        userId: req.user.id,
        phoneNumber,
        message,
        status: 'queued',
        timestamp: new Date().toISOString()
    };
    
    db.get('messages').push(messageRecord).write();
    
    // Simulate processing
    setTimeout(() => {
        db.get('messages')
            .find({ id: messageRecord.id })
            .assign({ 
                status: 'delivered',
                deliveredAt: new Date().toISOString() 
            })
            .write();
            
        db.get('bots')
            .find({ id: botId })
            .update('messagesProcessed', n => n + 1)
            .write();
    }, 2000);
    
    res.json(messageRecord);
});

// Helper functions for bot processes (simplified)
function startBotProcess(bot) {
    console.log(`Starting bot ${bot.name} (${bot.id})`);
    // In production, this would spawn a real bot process
    // For demo, we just update the status
}

function stopBotProcess(bot) {
    console.log(`Stopping bot ${bot.name} (${bot.id})`);
    // In production, this would stop the bot process
}

// Serve frontend (in production you'd typically have a separate frontend server)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
