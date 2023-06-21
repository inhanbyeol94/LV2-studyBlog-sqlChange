require('dotenv').config();

const { DB_HOST, DB_PORT, DB_ID, DB_PW, DB_NAME } = process.env;
const mysql = require('mysql2/promise');

const con = mysql.createPool({
  host: DB_HOST,
  user: DB_ID,
  password: DB_PW,
  database: DB_NAME,
  dateStrings: 'date',
  multipleStatements: true,
});

module.exports = {
  db: async (sql) => {
    const connection = await con.getConnection(async (conn) => conn);

    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(sql);
      await connection.commit();

      return rows;
    } catch (err) {
      await connection.rollback();
      connection.release();
      return err;
    } finally {
      connection.release();
    }
  },
};
