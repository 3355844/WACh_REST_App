$(() => {
    var userTitleName = document.getElementById('userTitleName');
    var token = 'bearer ';
    var socket = io();
    var userTmp = {
        username: userTitleName
    };
//  SOCKETS

    $('#form-chat').submit(() => {
        var mess = userTitleName.outerText + ': ' + $('#m').val();
        socket.emit('chat message', mess);
        socket.emit('userName', userTmp.username);
        $('#m').val('');
        return false;
    });

    socket.on('chat message', (res) => {
        console.log(res);
        var mess = JSON.parse(res);
        $('#messages').empty();
        var messReverse = mess.messages.reverse();
        messReverse.forEach(function (message) {
            $('#messages').append($('<li class="list-group-item">').text(message.msg));
        });

    });

    //  PROFILE PAGE
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

    //  GET/READ/
    $('#get-button').on('click', () => {
        $.ajax({
            // cache: false,
            url: 'users',
            method: 'GET',
            contentType: 'application/json',
            success: function (res) {
                var tbodyEL = $('tbody');
                tbodyEL.html('');
                res.userList.forEach(function (user) {
                    console.log('function res');
                    tbodyEL.append('\
                    <tr>\
                    <td>' + user.location + '</td>\
                    <td>' + user.username + '</td>\
                    </tr>');
                })
            }
        });
    });

    // LOGIN ADMIN
    $('#admin-login').on('click', (event) => {
        console.log('Admin login button is pressed');
        event.preventDefault();
        var adminLogin = $('#lg_username');
        var adminPass = $('#lg_password');
        console.log(adminPass.val() + " " + adminLogin.val());
        if (adminPass.val() === '' && adminPass.val() === '') {
            alert('Fill all fills please');
        } else {
            $.ajax({
                url: '/admin/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    adminLogin: adminLogin.val(),
                    adminPass: adminPass.val()
                }),
                success: (data) => {
                    console.log('This user token: ' + token);
                    token = 'bearer ' + data.token;
                    console.log(token);
                    userTitleName = data.user;
                    alert('Login successful');
                    console.log(data);
                    adminPass.val('');
                    adminLogin.val('');
                    $('#users-table').show();
                    $('#admin-get-users').click();
                },
                error: function () {
                    alert('Wrong username or password check please and try one more time');
                    $('#lg_password').val('');
                }
            });
        }
    });

    // ADMIN GET USERS
    $('#admin-get-users').on('click', () => {
        console.log(token);
        $.ajax({
            // cache: false,
            url: '/admin/users',
            method: 'GET',
            contentType: 'application/json',
            headers: {
                authorization: token
            },
            success: function (res) {
                $('#admin-login-form').hide();
                $('#admin-get-users').hide();
                var tbodyEL = $('tbody');
                tbodyEL.html('');

                res.userList.forEach(function (user) {
                    console.log('function res');
                    tbodyEL.append('\<tr>\
                        <td class="id">' + user._id + '</td>\
                        <td>' + user.location + '</td>\
                        <td><input type="text" class="name form-control" value="' + user.username + '"/></td>\
                        <td>\
                        <button class="update-button btn btn-outline-success">UPDATE/PUT</button>\
                        <button class="delete-button btn btn-outline-danger">DELETE</button>\
                        </td>\
                        </tr>');
                })
            }
        });
    });


//  LOGOUT USER
    $('#logout').on('click', (event) => {
        console.log('Logout is pressed!!!');
        $.ajax({
            url: '/api/logout',
            method: 'POST',
            contentType: 'application/json',
            success: (data) => {
                token = 'bearer ';
                userTitleName.innerText = 'WACh';
                console.log('title name is changed!!!');
            }
        })
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
                if (data.success === true) {
                    console.log('success: ' + data.success);
                    console.log('token - ' + data.token);
                    console.log('userName: ' + data.user.username);
                    token += data.token;
                    userTitleName.innerText = data.user.username;
                    emailForm.val('');
                } else {
                    alert('Try more or register');
                }
                passwordForm.val('');
                $('#get-button').click();
            }
        })
    });

//  CREATE POST
    $('#create-form').on('submit', (event) => {
        console.log('Post button is pressed');
        event.preventDefault();
        // User fills
        var regName = $('#register-name');
        var regEmail = $('#register-email');
        var regPass = $('#register-pass');
        var regPassCheck = $('#register-check-pass');
        var regFullName = $('#register-fullname');
        var regAge = $('#register-age');
        var regLocation = $('#register-location');
        var regGender = $('#register-gender');

        var errorCount = 0;
        // Check fills
        $('#create-form').find('input').each((index, input) => {
            console.log(index);
            console.log(input.value);
            if (input.value === '') {
                errorCount++;
            }
        });
        // Check passwords
        if (regPass !== regPassCheck) {
            errorCount++;
        }
        // Add User or Err
        if (errorCount === 0) {
            $.ajax({
                url: '/users',
                method: 'POST',
                contentType: 'application/json', // Send user details
                data: JSON.stringify({
                    userName: regName.val(),
                    email: regEmail.val(),
                    userPass: regPass.val(),
                    regPassCheck: regPassCheck.val(),
                    fullName: regFullName.val(),
                    age: regAge.val(),
                    userLocation: regLocation.val(),
                    gender: regGender.val()
                }),
                success: function (res) {
                    console.log(res);
                    // Clear fills if user success login
                    regName.val('');
                    regEmail.val('');
                    regPass.val('');
                    regPassCheck.val('');
                    regFullName.val('');
                    regAge.val('');
                    regLocation.val('');
                    regGender.val('');
                    $('#get-button').click();
                }
            });
        } else {
            alert('Fill all fields');
            $('#get-button').click();
        }
    });

//  UPDATE/PUT
    $('table').on('click', '.update-button', function () {
        console.log('Update button is pressed!!');
        var rowEL = $(this).closest('tr');
        var id = rowEL.find('.id').text();
        var newName = rowEL.find('.name').val();
        console.log("NewName: " + newName);
        console.log("Id: " + id);
        $.ajax({
            url: '/users/' + id,
            method: 'PUT',
            contentType: 'application/json',
            headers: {
                authorization: token
            },
            data: JSON.stringify({newName: newName}),
            success: function (res) {
                console.log(res);
                $('#admin-get-users').click();
            }
        });
    });

//  DELETE
    $('table').on('click', '.delete-button', function () {
        console.log('delete button is pressed');
        var rowEl = $(this).closest('tr');
        var id = rowEl.find('.id').text();
        $.ajax({
            url: '/users/' + id,
            method: 'DELETE',
            contentType: 'application/json',
            headers: {
                authorization: token
            },
            success: function (res) {
                console.log(res);
                $('#admin-get-users').click();
            }
        })
    });
})
;