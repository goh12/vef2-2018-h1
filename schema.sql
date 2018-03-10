CREATE TABLE users (
  id serial primary key,
  username varchar(255) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  imgurl varchar(255),
  CONSTRAINT CHK_username CHECK (LENGTH(username) >= 3),
  CONSTRAINT CHK_password CHECK (LENGTH(password) >= 6),
  CONSTRAINT CHK_name CHECK (LENGTH(name) > 0)
);

CREATE TABLE categories (
  id serial primary key,
  name varchar(255) UNIQUE NOT NULL,
  CONSTRAINT CHK_name CHECK(LENGTH(name) > 0)
);

CREATE TABLE books (
  id serial primary key,
  title varchar(255) NOT NULL UNIQUE,
  ISBN13 char(13) NOT NULL UNIQUE,
  author varchar(255),
  description text,
  category varchar(255) NOT NULL REFERENCES categories(name),
  CONSTRAINT CHK_title CHECK (LENGTH(title) > 0)
);

CREATE TABLE readBooks (
  id serial,
  userId serial NOT NULL REFERENCES users(id),
  bookId serial NOT NULL REFERENCES books(id),
  userRating decimal(2,0) NOT NULL,
  userReview text,
  CONSTRAINT CHK_userRating CHECK (userRating >= 1 AND userRating <= 5)
);
