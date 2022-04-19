const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
    host    : '172.30.1.50',
    user    : 'root',
    password: 'xxxx',
    database: 'icare'
});

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(req, res) {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM tb_member WHERE member_id = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				// Redirect to home page
				res.redirect('/home');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

// app.get('/home', function(req, res) {
//     if (req.session.loggedin) {
//         res.send('Welcome back', +req.session.username + '!');
//     } else {
//         res.send('Please login to view this page!');
//     }
//     res.end();
// });

app.get('/home', function(req, res) {
    connection.query('SELECT * FROM tb_member ', function(err, rows, fields) {
        connection.end();
        if (!err) {
            var data = '<html><head><title>mysql test</title><head>'
            data += '<h1>사용자</h1>'
            data += '<table border = \'1\'>'
            data += '<tr><th>Memeber_sq</th><th>Member_id</th><th>Name</th><th>Reg_datetime</th><tr>'

            for (var i in rows) {
                data += '<tr>'
                data += '<td>' + rows[i].member_sq + '</td>'
                data += '<td>' + rows[i].member_id+'</td>'
                data += '<td>' + rows[i].name+'</td>'
                data += '<td>' + rows[i].reg_datetime+'</td>'
                data += '</tr>'
            }
            data += '</table></html>'
            res.send(data);
        }
        else
            console.log('Error while performing Query');
    });
});

app.listen(3000);