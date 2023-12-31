// Create express app
var express = require("express")
var app = express()
var db = require("./juomaDatabase.js")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

// Server port
var port = process.env.PORT || 3000;
// Start server
app.listen(port, "0.0.0.0", () => {
    console.log("Server running on port %PORT%".replace("%PORT%",port))
});

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints
app.get("/api/energiat", (req, res, next) => {
  var sql = "select * from energia"
  var params = []
  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":rows
      })
    });
});

app.get("/api/energiat/:id", (req, res, next) => {
  var sql = "select * from energia where id = ?"
  var params = [req.params.id]
  db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

//lisää juomia
app.post("/api/energiat/", (req, res, next) => {
  var errors=[]
  if (!req.body.merkki){
      errors.push("No merkki specified");
  }
  if (!req.body.nimi){
      errors.push("No nimi specified");
  }
  if (!req.body.maku){
    errors.push("No maku specified");
  }
  if (!req.body.arvosana){
    errors.push("No arvosana specified");
  }
  if (!req.body.arvostelu){
    errors.push("No arvostelu specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      merkki: req.body.merkki,
      nimi: req.body.nimi,
      maku: req.body.maku,
      arvosana: req.body.arvosana,
      arvostelu: req.body.arvostelu
  }
  var sql ='INSERT INTO energia (merkki, nimi, maku, arvosana, arvostelu) VALUES (?,?,?,?,?)'
  var params =[data.merkki, data.nimi, data.maku, data.arvosana, data.arvostelu]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

//muokkaa
app.patch("/api/energiat/:id", (req, res, next) => {
  var data = {
      merkki: req.body.merkki,
      nimi: req.body.nimi,
      maku: req.body.maku,
      arvosana: req.body.arvosana,
      arvostelu: req.body.arvostelu
  }
  db.run(
      `UPDATE energia set 
         merkki = COALESCE(?,merkki), 
         nimi = COALESCE(?,nimi), 
         maku = COALESCE(?,maku),
         arvosana = COALESCE(?,arvosana),
         arvostelu = COALESCE(?,arvostelu),
         WHERE id = ?`,
      [data.merkki, data.nimi, data.maku, data.arvosana, data.arvostelu, req.params.id],
      function (err, result) {
          if (err){
              res.status(400).json({"error": res.message})
              return;
          }
          res.json({
              message: "success",
              data: data,
              changes: this.changes
          })
  });
})

//poista
app.delete("/api/energiat/:id", (req, res, next) => {
  db.run(
      'DELETE FROM energia WHERE id = ?',
      req.params.id,
      function (err, result) {
          if (err){
              res.status(400).json({"error": res.message})
              return;
          }
          res.json({"message":"deleted", changes: this.changes})
  });
})

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});

