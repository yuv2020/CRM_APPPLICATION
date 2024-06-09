module.exports = {
    production: {
      dialect: 'postgres',
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      logging: console.log,
      seederStorage: 'sequelize',
    }
}