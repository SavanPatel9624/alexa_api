const mysql = require("mysql");

 const dbcon = mysql.createConnection({
     port: 3306,
     connectionLimit: 1000,
     host:'sql6.freemysqlhosting.net',
     password:'nE8fZABJXe',
     user:'sql6463918',
     database:'sql6463918',
    charset: "utf8mb4",
    multipleStatements: true,
});

 dbcon.connect(function(err) {
    if (err) {
       console.error('error connecting: ' + err.stack);
       return;
    }
 });

module.exports = dbcon;