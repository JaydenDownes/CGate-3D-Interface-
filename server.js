const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/tasks', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let tasks = JSON.parse(data).tasks;
        res.json({ tasks: tasks });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let updatedTask = req.body;
        let taskIndex = db.tasks.findIndex(task => task.id === updatedTask.id);
        if (taskIndex >= 0) {
            db.tasks[taskIndex] = updatedTask;
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.post('/api/tasks', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let newTask = req.body;
        // Generate a new ID for the task
        newTask.id = Date.now().toString();
        db.tasks.push(newTask);
        fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
            if (err) throw err;
            res.sendStatus(201);
        });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let taskId = req.params.id;
        let taskIndex = db.tasks.findIndex(task => task.id === taskId);
        if (taskIndex >= 0) {
            db.tasks.splice(taskIndex, 1);
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});


app.get('/api/rules', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let rules = JSON.parse(data).rules;
        res.json({ rules: rules });
    });
});

app.put('/api/rules/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let updatedRule = req.body;
        let ruleIndex = db.rules.findIndex(rule => rule.id === updatedRule.id);
        if (ruleIndex >= 0) {
            db.rules[ruleIndex] = updatedRule;
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.post('/api/rules', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let newRule = req.body;
        // Generate a new ID for the rule
        newRule.id = Date.now().toString();
        db.rules.push(newRule);
        fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
            if (err) throw err;
            res.sendStatus(201);
        });
    });
});

app.delete('/api/rules/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let ruleId = req.params.id;
        let ruleIndex = db.rules.findIndex(rule => rule.id === ruleId);
        if (ruleIndex >= 0) {
            db.rules.splice(ruleIndex, 1);
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.get('/api/scenes', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let scenes = JSON.parse(data).scenes;
        res.json({ scenes: scenes });
    });
});

app.put('/api/scenes/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let updatedScene = req.body;
        let sceneIndex = db.scenes.findIndex(scene => scene.id === updatedScene.id);
        if (sceneIndex >= 0) {
            db.scenes[sceneIndex] = updatedScene;
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.post('/api/scenes', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let newScene = req.body;
        // Generate a new ID for the scene
        newScene.id = Date.now().toString();
        db.scenes.push(newScene);
        fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
            if (err) throw err;;
            res.sendStatus(201);
        });
    });
});

app.delete('/api/scenes/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let sceneId = req.params.id;
        let sceneIndex = db.scenes.findIndex(scene => scene.id === sceneId);
        if (sceneIndex >= 0) {
            db.scenes.splice(sceneIndex, 1);
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.get('/api/devices', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let devices = JSON.parse(data).devices;
        res.json({ devices: devices });
    });
});

app.put('/api/devices/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let updatedDevice = req.body;
        if (db.devices[updatedDevice.id]) {
            db.devices[updatedDevice.id] = updatedDevice;
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.post('/api/devices', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let newDevice = req.body;
        // Generate a new ID for the device
        newDevice.id = Date.now().toString();
        db.devices[newDevice.id] = newDevice;
        fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
            if (err) throw err;
            res.sendStatus(201);
        });
    });
});

app.delete('/api/devices/:id', (req, res) => {
    fs.readFile('db.json', (err, data) => {
        if (err) throw err;
        let db = JSON.parse(data);
        let deviceId = req.params.id;
        if (db.devices[deviceId]) {
            delete db.devices[deviceId];
            fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.listen(3000, () => console.log('Server is running on port 3000'));
