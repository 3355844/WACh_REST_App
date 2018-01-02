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

// var users = [];

var currentId = 3;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    req.db = db;
    next();
});

// Methods

app.get('/api', (req, res) => {
    res.json({text: "api"});
});

app.post('/api/login', (req, res) => {
    //    auth user
    var userEmail = req.body.emailForm;
    var userPass = req.body.passwordForm;
    var userTmp;
    var token;
    console.log('Come from form  ' + userEmail + ' - ' + userPass);


    users.forEach((user, index) => {
        console.log(user.password + user.email);
        if (user.password === userPass && user.email === userEmail) {
            console.log('inside if ');
            userTmp = user;
            token = jwt.sign({user}, 'my_secret_key');
        }
    });
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
            user: userTmp
        });
    }
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
        console.log(JSON.stringify(docs));
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

app.put('/users/:id', (req, res) => {
    console.log('PUT URL users');
    var id = req.params.id;
    var newName = req.body.newName;
    var found = false;
    var users = db.get('userlist');





    users.forEach((user, index) => {
        if (!found && user._id === Number(id)) {
            user.name = newName;
        }
    });
    res.send('Successfully updated user');
});

app.delete('/users/:id', (req, res) => {
    console.log('DELETE URL users');
    var id = req.params.id;
    var found = false;

    users.forEach((user, index) => {
        if (!found && user.id === Number(id)) {
            users.splice(index, 1);
        }
    });

    res.send('Successfully deleted user');
});

// Sockets

io.on('connection', (socket) => {
    socket.on('userName', (userName) => {
        io.emit('userName', userName);
        console.log('connect user ' + userName);
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
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
