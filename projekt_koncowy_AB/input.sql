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