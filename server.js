var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jwt = require('jsonwebtoken');
var PORT = process.env.PORT || 3000;

var users = [
    {
        id: 1,
        name: 'Admin',
        password: '1234',
        email: 'admin@email.com'
    }, {
        id: 2,
        name: 'Andrei',
        password: 'aaaa',
        email: 'aaa@email.com'
    }
];

var currentId = 2;

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/api', (req, res) => {
    res.json({text: "api"});
});

app.post('/api/login', (req, res) => {
    //    auth user
    var userEmail = req.body.email;
    var userPass = req.body.password;

    users.forEach((user, index) => {
        console.log(userEmail + userPass);
        console.log(user.password + user.email);
        if (user.password === userPass && user.email === userEmail) {
            console.log('inside if ');
            var token = jwt.sign({user}, 'my_secret_key');
            res.json({
                success: true,
                token: token,
                user: user
            });
        }
    });
});

app.get('/api/protected', ensureToken, (req, res) => {
    jwt.verify(req.token, 'my_secret_key', function (err, data) {
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

function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        console.log('no token');
        res.sendStatus(403);
    }
}

app.get('/products', function (req, res) {
    console.log('GET URL products');
    res.send({products: users});
});

app.post('/products', (req, res) => {
    console.log('POST URL products');
    var userName = req.body.name;
    currentId++;
    users.push({
        id: currentId,
        name: userName

    });
    res.send('Successfully created');
});

app.put('/products/:id', (req, res) => {
    console.log('PUT URL products');
    var id = req.params.id;
    var newName = req.body.newName;
    var found = false;
    users.forEach(function (user, index) {
        if (!found && user.id === Number(id)) {
            user.name = newName;
        }
    });

    res.send('Successfully updated product');
});

app.delete('/products/:id', (req, res) => {
    console.log('DELETE URL products');
    var id = req.params.id;
    var found = false;

    users.forEach((user, index) => {
        if (!found && user.id === Number(id)) {
            users.splice(index, 1);
        }
    });

    res.send('Successfully deleted product');
});

io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function () {
        console.log('user disconnect');
    });


});

http.listen(PORT, function () {
    console.log('Server listen PORT: ' + PORT)
});
