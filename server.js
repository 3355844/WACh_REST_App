var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 3000;

var products = [
    {
        id: 1,
        name: 'laptop'
    }, {
        id: 2,
        name: 'microwawe'
    }
];

var currentId = 2;

app.use(express.static(__dirname));
app.use(bodyParser.json());


app.get('/products', function (req, res) {
    console.log('GET URL products');
    res.send({products: products});
});

app.post('/products', function (req, res) {
    console.log('POST URL products');
    var productName = req.body.name;
    currentId++;
    products.push({
        id: currentId,
        name: productName
    });
    res.send('Successfully created');
});

app.put('/products/:id', function (req, res) {
    console.log('PUT URL products');
    var id = req.params.id;
    var newName = req.body.newName;
    var found = false;
    products.forEach(function (product, index) {
        if(!found && product.id === Number(id)){
            product.name = newName;
        }
    });

    res.send('Successfully updated product');
});

app.delete('/products/:id', function (req, res) {
    console.log('DELETE URL products');
    var id = req.params.id;
    var found = false;

    products.forEach(function (product, index) {
        if(!found && product.id === Number(id)){
            products.splice(index, 1);
        }
    });

    res.send('Successfully deleted product');
});

io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('chat message', function(msg){
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
