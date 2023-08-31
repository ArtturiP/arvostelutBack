var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE energia (
            id integer PRIMARY KEY NOT NULL,
            merkki text NOT NULL,
            nimi text NOT NULL,
            maku text NOT NULL,
            arvosana decimal(3,1) NOT NULL,
            arvostelu text NOT NULL
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO energia (merkki, nimi, maku, arvosana, arvostelu) VALUES (?,?,?,?,?)'
                db.run(insert, ["Euro Shopper","ES","Original",1.0,"Halvan makuista"])
                db.run(insert, ["Battery","Jungled","Exotic Fruit",4.8,"Herkullisen hedelmäinen"])
            }
        });  
    }
});


module.exports = db
