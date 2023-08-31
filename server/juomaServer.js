// Create express app
var express = require("express")
var app = express()
var db = require("./juomaDatabase.js")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
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

{/*
const express = require('express');
const app = express();

const helmet = require('helmet');
app.use(helmet());

app.use(express.json());  
app.use(express.urlencoded({limit: '5mb', extended: true}));

const cors = require('cors');
app.use(cors());

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('juomat.db');
 
app.listen(8080, () => {
    console.log('Node toimii localhost:8080');
});

app.get('/', (req, res, next) => {
    return res.status(200).json({ error: false, message: 'Toimii' })
});

app.get('/ene/all', (req, res, next) => {
	db.all('select * from ene', function (error, result) {
		if (error) throw error;

		return res.status(200).json(result);
	});
})

app.get('/alko/all', (req, res, next) => {
	db.all('select * from alko', function (error, result) {
		if (error) throw error;

		return res.status(200).json(result);
	});
})

app.get('/ene/one/:id', (req, res, next) => {
	let id = req.params.id;

  db.get('SELECT * FROM ene where id=?', [id], (error, result) => {
    if (error) throw error;

    if (typeof(result) == 'undefined')  {
      return res.status(200).send({});
    }

    return res.status(200).json(result);
  })  // db.get
})


app.get('/alko/one/:id', (req, res, next) => {
	let id = req.params.id;

  db.get('SELECT * FROM alko where id=?', [id], (error, result) => {
    if (error) throw error;

    if (typeof(result) == 'undefined')  {
      return res.status(200).send({});
    }

    return res.status(200).json(result);
  })  // db.get
})


app.post('/ene/add', (req, res, next) => {
  let ene = req.body;

  db.run('INSERT INTO ene (merkki, nimi, maku, arvosana, arvostelu) VALUES (?, ?, ?, ?, ?)',  
    [ene.merkki, ene.nimi, ene.maku, ene.arvosana, ene.arvostelu], (error, result) => {
    if (error) throw error;

    return res.status(200).json( {count: 1} );
  })

})

app.post('/alko/add', (req, res, next) => {
  let alko = req.body;

  db.run('INSERT INTO alko (merkki, nimi, tyyppi, prosentti, arvosana, arvostelu) VALUES (?, ?, ?, ?, ?, ?)',  
    [alko.merkki, alko.nimi, alko.tyyppi, alko.prosentti, alko.arvosana, alko.arvostelu], (error, result) => {
    if (error) throw error;

    return res.status(200).json( {count: 1} );
  })

})

app.get('/ene/delete/:id', (req, res, next) => {
  let id = req.params.id;

  db.run('DELETE FROM ene WHERE id = ?', [id], function (error, result) {
    if (error) throw error;

    return res.status(200).json( {count: this.changes} );
  })
})

app.get('/alko/delete/:id', (req, res, next) => {
  let id = req.params.id;

  db.run('DELETE FROM alko WHERE id = ?', [id], function (error, result) {
    if (error) throw error;

    return res.status(200).json( {count: this.changes} );
  })
})

app.post('/ene/edit/:id', (req, res, next) => {
	let id = req.params.id;
	let ene = req.body;
  
  })

app.post('/alko/edit/:id', (req, res, next) => {
  let id = req.params.id;
  let alko = req.body;
  
  })

app.get('*', (req, res, next) => {
    return res.status(404).json({ error: true, message: 'Ei pyydettyä palvelua' })
})
*/}