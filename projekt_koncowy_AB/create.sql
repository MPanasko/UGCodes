-- Definicja typu ENUM dla płci
CREATE TYPE plec_enum AS ENUM ('klacz', 'ogier', 'walach');

-- Definicja typu ENUM dla rasy
CREATE TYPE rasa_enum AS ENUM ('XX', 'OO', 'XO', 'XXOO');

-- Definicja typu ENUM dla masci
CREATE TYPE masc_enum AS ENUM ('Kasztanowa', 'Gniada', 'Kara', 'biala');

CREATE TABLE kraj (
    id CHAR(2) PRIMARY KEY NOT NULL CHECK (id = UPPER(id)),
    nazwa VARCHAR(255) NOT NULL
);

CREATE TABLE hodowla (
    id SERIAL PRIMARY KEY NOT NULL,
    nazwa VARCHAR(255) NOT NULL,
    kraj CHAR(2) NOT NULL,
    FOREIGN KEY (kraj) REFERENCES kraj(id)
);

CREATE TABLE kon (
    id_konia SERIAL PRIMARY KEY,
    id_hodowli INT,
    kraj CHAR(2) NOT NULL,
    plec plec_enum,
    rasa rasa_enum,
    imie VARCHAR(255),
    rok_urodzenia INT,
    matka INT,
    ojciec INT,
    masc masc_enum,
    FOREIGN KEY (id_hodowli) REFERENCES hodowla(id),
    FOREIGN KEY (matka) REFERENCES kon(id_konia),
    FOREIGN KEY (ojciec) REFERENCES kon(id_konia)
);