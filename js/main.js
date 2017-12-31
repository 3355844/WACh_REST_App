$(() => {
    var token = 'bearer ';
    var userTitleName = document.getElementById('userTitleName');// SOCKETS

    //  SOCKETS
    var socket = io();
    $('#form-chat').submit(() => {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', (msg) => {
        console.log(msg);
        $('#messages').append($('<li>').text(msg));
    });

//  PROTECTED PAGE
    $('#profile').on('click', () => {
        console.log('is click');
        console.log(token);
        $.ajax({
            url: '/api/protected',
            method: 'GET',
            contentType: 'application/json',
            headers: {
                authorization: token
            }
        })
    });

//  GET/READ
    $('#get-button').on('click', () => {
        $.ajax({
            // cache: false,
            url: 'users',
            method: 'GET',
            contentType: 'application/json',
            success: function (res) {
                var tbodyEL = $('tbody');
                tbodyEL.html('');

                res.users.forEach(function (user) {
                    console.log('function res');
                    tbodyEL.append('\
                    <tr>\
                    <td class="id">' + user.id + '</td>\
                    <td><input type="text" class="name form-control" value="' + user.name + '"/></td>\
                    <td>\
                    <button class="update-button btn btn-outline-success">UPDATE/PUT</button>\
                    <button class="delete-button btn btn-outline-danger">DELETE</button>\
                    </td>\
                    </tr>');
                })
            }
        });
    });

//  LOGIN USER
    $('#login-form').on('submit', (event) => {
        console.log('Login button is pressed');
        event.preventDefault();
        var emailForm = $('#emailForm');
        var passwordForm = $('#passwordForm');
        console.log('values ' + emailForm.val() + ' - ' + passwordForm.val() + ' Username: ' + userTitleName.outerText);
        $.ajax({
            url: '/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                passwordForm: passwordForm.val(),
                emailForm: emailForm.val()
            }),
            success: (data) => {
                console.log('success: ' + data.success);
                console.log('token - ' + data.token);
                console.log('userName: ' + data.user.name);
                token += data.token;
                emailForm.val('');
                passwordForm.val('');
                userTitleName.innerText = data.user.name;
                $('#get-button').click();
            }
        })
    });

//  CREATE POST
    $('#create-form').on('submit', (event) => {
        console.log('Post button is pressed');
        event.preventDefault();
        var createInput = $('#create-input');

        $.ajax({
            url: '/users',
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
    $('table').on('click', '.update-button', () => {
        var rowEL = $(this).closest('tr');
        var id = rowEL.find('.id').text();
        var newName = rowEL.find('.name').val();
        console.log(newName);
        $.ajax({
            url: '/users/' + id,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({newName: newName}),
            success: (res) => {
                console.log(res);
                $('#get-button').click();
            }
        });
    });

//  DELETE
    $('table').on('click', '.delete-button', () => {
        console.log('delete button is pressed');
        var rowEl = $(this).closest('tr');
        var id = rowEl.find('.id').text();
        $.ajax({
            url: '/users/' + id,
            method: 'DELETE',
            contentType: 'application/json',
            success: function (res) {
                console.log(res);
                $('#get-button').click();
            }
        })
    })
});