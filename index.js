const express = require("express");
const mysql = require("mysql");
const app = express();
const port = process.env.port || 6000;
const bodyParser = require("body-parser");
const cors= require('cors');

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));



app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true); 
  next();
});


const connection = mysql.createPool({
  
  
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






app.get("/walletDetails",(req,res)=>{
  
  const {userId}= req.query
    
    const sql = `SELECT user_id, amount FROM wallet_log`
    connection.query(sql, [userId], (err, result) => {
        if (err) {
            console.error(' No User Found ');
            return;
        }
        else{
          


          res.json(result);
        }
  
    });
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
  console.log("update wallet is called");
  const { userId, amount } = req.query;

  // Parse amount to integer
  const newAmountToAdd = parseInt(amount);

  // Check if userId and amount are valid
  if (!userId || !newAmountToAdd || isNaN(newAmountToAdd)) {
    console.error("Invalid userId or amount");
    res.status(400).send("Invalid userId or amount");
    return;
  }

  // First, try to retrieve the current amount from the database
  const selectSql = `SELECT amount FROM wallet_log WHERE user_id = ?`;
  connection.query(selectSql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      res.status(500).send("Error fetching user data");
      return;
    }

    // Check if the user exists in the database
    const userExists = results.length > 0;

    // If the user doesn't exist, insert a new record
    if (!userExists) {
      const insertSql = `INSERT INTO wallet_log (user_id, amount, cdate, cby, status) VALUES (?, ?, NOW(), ?, '1')`;
      connection.query(
        insertSql,
        [userId, newAmountToAdd, userId],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Error inserting wallet data:", insertErr);
            res.status(500).send("Error inserting wallet data");
            return;
          }

          console.log("Insert successful for new user");
          res.json(insertResult);
        }
      );
    } else {
      // User exists, update the existing record
      const currentAmount = parseInt(results[0].amount);

      // Check if the current amount is a valid number
      if (isNaN(currentAmount)) {
        console.error("Invalid current amount value in database");
        res.status(500).send("Invalid current amount value in database");
        return;
      }

      // Calculate the new total amount
      const newTotalAmount = currentAmount + newAmountToAdd;

      // Update the amount in the database
      const updateSql = `UPDATE wallet_log SET amount = ? WHERE user_id = ?`;
      connection.query(
        updateSql,
        [newTotalAmount, userId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating user data:", updateErr);
            res.status(500).send("Error updating user data");
            return;
          }

          console.log("Wallet amount updated successfully");
          res.json(updateResult);
        }
      );
    }
  });
});



app.get("/",(req,res)=>{
     res.send("hello from fiedex")
})


app.listen(port, () => {
  console.log("server is running", {port});
});


