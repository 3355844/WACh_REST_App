$(function () {
    var socket = io();
    $('#form-chat').submit(function () {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function (msg) {
        console.log(msg);
        $('#messages').append($('<li>').text(msg));
    });

//    GET/READ
    $('#get-button').on('click', function () {
        $.ajax({
            // cache: false,
            url: 'products',
            method: 'GET',
            contentType: 'application/json',
            success: function (res) {
                var tbodyEL = $('tbody');
                tbodyEL.html('');

                res.products.forEach(function (product) {
                    console.log('function res');
                    tbodyEL.append('\
                    <tr>\
                    <td class="id">' + product.id + '</td>\
                    <td><input type="text" class="name form-control" value="' + product.name + '"/></td>\
                    <td>\
                    <button class="update-button btn btn-outline-success">UPDATE/PUT</button>\
                    <button class="delete-button btn btn-outline-danger">DELETE</button>\
                    </td>\
                    </tr>');
                })
            }
        });
    });

//    LOGIN USER
    $('#login-form').on('submit', function (event) {
        console.log('Login button is pressed');
        event.preventDefault();
        var emailForm = $('#emailForm');
        var passwordForm = $('#passwordForm');
        console.log('values ' + emailForm + passwordForm);
        $.ajax({
            url: '/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                passwordForm: passwordForm.val(),
                emailForm: emailForm.val()
            }),
            success: function (res) {
                console.log(res);
                emailForm.val('');
                passwordForm.val('');
                $('#get-button').click();
            }
        })
    });

//  CREATE POST
    $('#create-form').on('submit', function (event) {
        console.log('Post button is pressed');
        event.preventDefault();
        var createInput = $('#create-input');

        $.ajax({
            url: '/products',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({name: createInput.val()}),
            success: function (res) {
                console.log(res);
                createInput.val('');
                $('#get-button').click();
            }
        })
    });

//  UPDATE/PUT
    $('table').on('click', '.update-button', function () {
        var rowEL = $(this).closest('tr');
        var id = rowEL.find('.id').text();
        var newName = rowEL.find('.name').val();
        console.log(newName);
        $.ajax({
            url: '/products/' + id,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({newName: newName}),
            success: function (res) {
                console.log(res);
                $('#get-button').click();
            }
        });
    });

//    DELETE
    $('table').on('click', '.delete-button', function () {
        console.log('delete button is pressed');
        var rowEl = $(this).closest('tr');
        var id = rowEl.find('.id').text();
        $.ajax({
            url: '/products/' + id,
            method: 'DELETE',
            contentType: 'application/json',
            success: function (res) {
                console.log(res);
                $('#get-button').click();
            }
        })
    })
});