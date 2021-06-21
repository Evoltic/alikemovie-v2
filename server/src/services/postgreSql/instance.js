const { PostgreSql } = require('./index')

const postgreSql = new PostgreSql(
  process.env.POSTGRESQL_CONNECTION_STRING
    ? {
        connectionString: process.env.POSTGRESQL_CONNECTION_STRING
      }
    : {
        user: process.env.POSTGRESQL_USER,
        host: process.env.POSTGRESQL_HOST,
        database: process.env.POSTGRESQL_DATABASE,
        password: process.env.POSTGRESQL_PASSWORD,
        port: process.env.POSTGRESQL_PORT
      },
  process.env.IS_NOT_MAIN_INSTANCE === 'true'
    ? undefined
    : [
        `
    CREATE TABLE IF NOT EXISTS movies (
      id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      imdbId VARCHAR(100) NOT NULL UNIQUE,
      type VARCHAR(100) NOT NULL,
      title VARCHAR(1000) NOT NULL,
      startYear SMALLINT NOT NULL,
      endYear SMALLINT,
      runtimeMinutes INT,
      genres VARCHAR(100)[]
    );
    
    CREATE TABLE IF NOT EXISTS castAndCrew (
      id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      imdbId VARCHAR(100) UNIQUE,
      name VARCHAR(1000) NOT NULL,
      birthYear SMALLINT,
      deathYear SMALLINT,
      primaryProfession VARCHAR(1000)[]
    );
    
    CREATE TABLE IF NOT EXISTS moviesCastAndCrew (
      movieId INT REFERENCES movies (id),
      castAndCrewId INT REFERENCES castAndCrew (id),
      PRIMARY KEY (movieId, castAndCrewId),
      category VARCHAR(100),
      job VARCHAR(1000),
      characters VARCHAR(1000)[],
      "order" SMALLINT
    );

    CREATE TABLE IF NOT EXISTS moviesDocuments (
      movieId INT REFERENCES movies (id) NOT NULL UNIQUE,
      document TSVECTOR NOT NULL 
    );
    `
    ]
)

module.exports = { postgreSql }
