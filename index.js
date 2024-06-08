const express = require("express");
const mysql = require("mysql");
const app = express();
const port = process.env.port || 3000;
const bodyParser = require("body-parser");
const cors= require('cors');

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));






const connection = mysql.createPool({
  // host: "localhost",
  // user: "root",
  // password: "",
  // database:"fiedex"

  host: "fiedex.com",
  user: "u743095106_fiedex_user",
  password: "osS?brJ=tO7",
  database:"u743095106_fiedex_db"
});





function handleDisconnect() {
  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to MySQL');
    
      connection.release();
    }
  });

}

handleDisconnect();








app.post("/register", (req, res) => {
  const { name, mobile_number, country_code, email, password, refer_code } = req.body;

  // Check if email already exists
  const emailCheckQuery = `SELECT COUNT(id) AS count FROM register WHERE email = ?`;
  connection.query(emailCheckQuery, [email], (err, result) => {
      if (err) {
          console.error('Error checking email existence: ' + err.stack);
          res.status(500).send('Error checking email existence');
          return;
      }
      
      if (result[0].count > 0) {
          // Email already exists, return error response
          res.status(400).send('Email already exists');
      } else {
          // Insert into register table
          const insertQuery = `INSERT INTO register (name, mobile_number, country_code, email, password, refer_code, status, entry_date) VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW())`;
          const values = [name, mobile_number, country_code, email, password, refer_code];

          connection.query(insertQuery, values, (insertErr, insertResult) => {
              if (insertErr) {
                  console.error('Error inserting into register table: ' + insertErr.stack);
                  res.status(500).send('Error inserting into register table');
                  return;
              }
              console.log('Inserted into register table with ID: ' + insertResult.insertId);
              res.status(200).send('Inserted into register table');
          });
      }
  });
});




app.get("/verify", (req, res) => {
    const { email, password } = req.query; // Use req.query instead of req.body

    console.log(email, password);

    const sql = `SELECT id, name, mobile_number, country_code, email, password, refer_code FROM register WHERE BINARY email = ? AND password = ?`;
    connection.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Error searching for user: ' + err.stack);
            res.status(500).send('Error searching for user');
            return;
        }

        if (result.length === 0) {
            console.log('User not found');
            res.status(404).send(null);
        } else {
            console.log('User found');
            res.status(200).json(result[0]); // Send the user data back as JSON
        }
    });
});

  



app.get("/quizQuestions",(req,res)=>{
  // console.log("quizQuestions api")
  connection.query(
    "SELECT * FROM `question` WHERE STATUS ='Active'",
    (error, results) => {
      if (error) {
        console.log(error);
      } else {

       
        res.json(results);
      }
    }
  );
})


app.get("/about",(req,res)=>{
  connection.query(
    "SELECT `page_menu`,`content` FROM `static_page` WHERE id = 12",
    (error, results) => {
      if (error) {
        console.log(error);
      } else {

       
        res.json(results);
      }
    }
  );
})

app.get("/privacy",(req,res)=>{
  connection.query(
    "SELECT `page_menu`,`content` FROM `static_page` WHERE id = 13",
    (error, results) => {
      if (error) {
        console.log(error);
      } else {

       
        res.json(results);
      }
    }
  );
})
app.get("/terms",(req,res)=>{
  connection.query(
    "SELECT `page_menu`,`content` FROM `static_page` WHERE id = 14",
    (error, results) => {
      if (error) {
        console.log(error);
      } else {

       
        res.json(results);
      }
    }
  );
})

app.get("/socials",(req,res)=>{
  
  connection.query(
    "SELECT `whatsapp`, `email`, `mobile_1` `cus_care_num` FROM `website_data`",
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.json(results);
      }
    }
  ); 
})


app.get("/wallet",(req,res)=>{
  
const {userId}= req.query
  
  const sql = `SELECT  user_id, amount FROM wallet_log WHERE user_id=? `
  connection.query(sql, [userId], (err, result) => {
      if (err) {
          console.error(' No User Found ', userId );
          return;
      }
      else{
        res.json(result);
      }

  });
})

app.get("/updateWallet", (req, res) => {
  const { userId, amount } = req.query;
  console.log(userId, amount);

  // First, retrieve the current amount from the database
  const selectSql = `SELECT amount FROM wallet_log WHERE user_id = ?`;
  connection.query(selectSql, [userId], (err, results) => {
      if (err) {
          console.error('Error fetching user data:', err);
          res.status(500).send('Error fetching user data');
          return;
      }

      if (results.length === 0) {
          console.error('No User Found:', userId);
          res.status(404).send('No User Found');
          return;
      }

      // Parse the current amount and the new amount to integers
      const currentAmount = parseInt(results[0].amount);
      const newAmountToAdd = parseInt(amount);

      // Check if the parsed values are valid numbers
      if (isNaN(currentAmount) || isNaN(newAmountToAdd)) {
          console.error('Invalid amount values');
          res.status(400).send('Invalid amount values');
          return;
      }

      // Calculate the new total amount
      const newTotalAmount = currentAmount + newAmountToAdd;

      // Update the amount in the database
      const updateSql = `UPDATE wallet_log SET amount = ? WHERE user_id = ?`;
      connection.query(updateSql, [newTotalAmount, userId], (err, result) => {
          if (err) {
              console.error('Error updating user data:', err);
              res.status(500).send('Error updating user data');
              return;
          }

          // Respond with the result of the update
          res.json(result);
      });
  });
});



app.get("/",(req,res)=>{
     res.send("hello")
})





app.listen(port, () => {
  console.log("server is running", {port});
});


