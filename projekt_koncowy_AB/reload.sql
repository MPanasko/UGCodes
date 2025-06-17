-- Usunięcie istniejących typów i tabel (jeśli istnieją)
DROP TABLE kon;
DROP TABLE hodowla;
DROP TABLE kraj;
DROP TYPE IF EXISTS plec_enum;
DROP TYPE IF EXISTS rasa_enum;
DROP TYPE IF EXISTS masc_enum;

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

-- Tabela krajów
 INSERT INTO kraj (id, nazwa) VALUES
('PL', 'Polska'),
('DE', 'Niemcy'),
('FR', 'Francja'),
('AT', 'Austria'),
('SE', 'Szwecja');

-- Wstawienie 3 hodowli
INSERT INTO hodowla (nazwa, kraj) VALUES
('Hodowla Polskie Kuce', 'PL'),
('Hodowla Alpejskie Ogary', 'AT'),
('Hodowla Skandynawskie Rasy', 'SE');

-- Wstawienie 4 koni dla pierwszej hodowli (id_hodowli = 1)
INSERT INTO kon (id_hodowli, kraj, plec, rasa, imie, rok_urodzenia, matka, ojciec, masc) VALUES
(1, 'PL', 'klacz', 'OO', 'Mila', 2020, NULL, NULL, 'Kasztanowa'),
(1, 'PL', 'ogier', 'XO', 'Reks', 2019, NULL, NULL, 'Gniada'),
(1, 'PL', 'walach', 'XX', 'Borys', 2018, NULL, NULL, 'Kara'),
(1, 'PL', 'klacz', 'XXOO', 'Lilia', 2021, NULL, NULL, 'biala');

-- Wstawienie 4 koni dla drugiej hodowli (id_hodowli = 2)
INSERT INTO kon (id_hodowli, kraj, plec, rasa, imie, rok_urodzenia, matka, ojciec, masc) VALUES
(2, 'AT', 'ogier', 'OO', 'Alpen', 2020, NULL, NULL, 'Kasztanowa'),
(2, 'AT', 'klacz', 'XO', 'Tina', 2019, NULL, NULL, 'Gniada'),
(2, 'AT', 'walach', 'XX', 'Hektor', 2017, NULL, NULL, 'Kara'),
(2, 'AT', 'ogier', 'XXOO', 'Vigo', 2022, NULL, NULL, 'biala');

-- Wstawienie 4 koni dla trzeciej hodowli (id_hodowli = 3)
INSERT INTO kon (id_hodowli, kraj, plec, rasa, imie, rok_urodzenia, matka, ojciec, masc) VALUES
(3, 'SE', 'klacz', 'OO', 'Sofia', 2021, NULL, NULL, 'Kasztanowa'),
(3, 'SE', 'ogier', 'XO', 'Thor', 2020, NULL, NULL, 'Gniada'),
(3, 'SE', 'walach', 'XX', 'Olaf', 2019, NULL, NULL, 'Kara'),
(3, 'SE', 'klacz', 'XXOO', 'Freya', 2023, NULL, NULL, 'biala');