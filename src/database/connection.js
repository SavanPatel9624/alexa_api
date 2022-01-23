const mysql = require("mysql");

 const dbcon = mysql.createConnection({
     port: 3306,
     connectionLimit: 1000,
     host:'db4free.net',
     password:'Patel@9624',
     user:'savanpatel',
     database:'alexaceramic',
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