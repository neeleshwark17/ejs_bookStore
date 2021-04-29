const sql = require('mysql')

const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'newDb'
})

conn.connect(() => {
    console.log('Connected to sql')
})

module.exports=conn;