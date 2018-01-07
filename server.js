var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://root:root@ds161136.mlab.com:61136/mydb');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jwt = require('jsonwebtoken');
var PORT = process.env.PORT || 3000;

var users;

app.use(express.static(__dirname));
app.use(bodyParser.json());

// MongoDB connection

app.use(function (req, res, next) {
    req.db = db;
    next();
});

// Methods


app.get('/admin', (req, res) => {
    res.redirect('/login.html');
});

app.post('/admin/login', (req, res) => {
    console.log('come to Post method');
    var adminName = req.body.adminLogin;
    var adminPass = req.body.adminPass;
    var adminUser;
    var token;
    adminUser = 'administrator';
    if (adminName === 'admin' && adminPass === 'admin') {
        token = jwt.sign({adminUser}, 'admin_key');
        console.log(token);
        res.json({
            success: true,
            token: token,
            user: adminUser
        });
    } else {
        res.json({
            success: false,
        });
    }
});

app.get('/admin/users', adminToken, (req, res) => {
    console.log('admin users URL');
    console.log();
    jwt.verify(req.token, 'admin_key', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            var db = req.db;
            console.log('GET URL users');
            var users = db.get('userlist');
            users.find({}, {}, function (e, docs) {
                res.json({userList: docs});
            });
        }
    });


});

function adminToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    console.log(bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        console.log(bearerHeader);
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        console.log('no token this');
        res.sendStatus(403);
    }
}

// Users URL

app.post('/api/login', (req, res) => {
    //    auth user
    var userEmail = req.body.emailForm;
    var userPass = req.body.passwordForm;
    var userTmp;
    var token;
    console.log('Come from form  ' + userEmail + ' - ' + userPass);

    var users = db.get('userlist');
    // Get User by email
    users.findOne({email: userEmail}, {}, function (err, user) {

        if (user) {
            if (user.userPass === userPass) {
                userTmp = user;
                token = jwt.sign({user}, 'my_secret_key');
            }
        } else {
            console.log('No such user');
        }
        console.log('Token val: ' + token);

        if (userTmp) {
            res.json({
                success: true,
                token: token,
                user: userTmp
            });
        } else {
            res.json({
                success: false,
            });
        }
    });
});

app.post('/api/logout', (req, res) => {
    console.log('POST Logout');
    res.json({
        success: true
    });
});

app.get('/api/protected', ensureToken, (req, res) => {
    jwt.verify(req.token, 'my_secret_key', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            console.log('is token');
            res.json({
                text: 'this protected api',
                data: data
            });
        }
    });
});

app.get('/users', function (req, res) {
    var db = req.db;
    console.log('GET URL users');
    var users = db.get('userlist');
    users.find({}, {}, function (e, docs) {
        res.json({userList: docs});
    });
});

app.post('/users', (req, res) => {
    console.log('POST URL users');

    // User fields
    var newUser = {
        username: req.body.userName,
        email: req.body.email,
        userPass: req.body.userPass,
        userPassCheck: req.body.regPassCheck,
        fullName: req.body.fullName,
        age: req.body.age,
        location: req.body.userLocation,
        gender: req.body.gender
    };

    var db = req.db;
    var users = db.get('userlist');
    users.insert(newUser, function (err, result) {
        res.send("Successfully created");
    });
});

app.put('/users/:id', ensureToken, (req, res) => {
    console.log('PUT URL users');
    var id = req.params.id;
    var newName = req.body.newName;
    console.log(newName);
    var users = db.get('userlist');
    // Update name
    users.findOneAndUpdate({_id: id}, {$set: {username: newName}}).then((updateDoc) => {
        // console.log(JSON.stringify(updateDoc));
        res.send(JSON.stringify(updateDoc));
    });
});

app.delete('/users/:id', ensureToken, (req, res) => {
    console.log('DELETE URL users');
    var id = req.params.id;
    var found = false;
    var users = db.get('userlist');
    users.remove({_id: id});
    res.send('Successfully deleted user');
});

// Sockets
io.on('connection', (socket) => {
    console.log('connect user');
    socket.on('chat message', (msg) => {
        //Put message to database
        var next = 0;
        var messeges = db.get('messages');
        messeges.insert({
            msg: msg,
            date: new Date()
        });
        //Get ten messages
        messeges.find({}, {sort: {date: -1}, limit: 5}, function (err, res) {
            console.log('message: ' + msg);
            // msg connection
            io.emit('chat message', JSON.stringify({messages: res}));
            console.log(JSON.stringify({messages: res}));
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnect');
    });
});

function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        console.log(bearerHeader);
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        console.log('no token');
        res.sendStatus(403);
    }
}

http.listen(PORT, () => {
    console.log('Server listen PORT: ' + PORT)
});
