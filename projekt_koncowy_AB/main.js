const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = 3000;


const pool = new Pool({
  user: 'postgres',      
  host: 'localhost',
  database: 'konie', 
  password: '110303', 
  port: 5432,
});

const symulator = require('./sym.js'); 
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); 

//funkcja do dodania hodowli
app.post('/dodaj-hodowle', async (req, res) => {
  const { nazwa, kraj } = req.body;
  try {
    await pool.query(
      'INSERT INTO hodowla (nazwa, kraj) VALUES ($1, $2)',
      [nazwa, kraj]
    );
    res.send('Hodowla została dodana!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas dodawania hodowli');
  }
});

app.get('/hodowle', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hodowla');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas pobierania hodowli');
  }
});

app.post('/dodaj-kraj', async (req, res) => {
  const { id, nazwa } = req.body;
  try {
    await pool.query(
      'INSERT INTO kraj (id, nazwa) VALUES ($1, $2)',
      [id.toUpperCase(), nazwa]
    );
    res.send('Kraj dodany!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas dodawania kraju');
  }
});

app.get('/kraje', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kraj ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas pobierania krajów');
  }
});


/**
 * Dodawanie konia z logiką dziedziczenia rasy i maści oraz walidacją.
 * Jeśli rodzice nieznani, rasa i maść mogą być null (do ręcznego/lossowego uzupełnienia).
 */
app.post('/dodaj-konia', async (req, res) => {
  const { imie, id_hodowli, plec, rasa, masc, rok_urodzenia, matka, ojciec } = req.body;
  try {
    // Pobierz kraj z hodowli
    const hodowlaResult = await pool.query('SELECT kraj FROM hodowla WHERE id = $1', [id_hodowli]);
    const kraj = hodowlaResult.rows[0]?.kraj;
    if (!kraj) {
      return res.status(400).send('Nie znaleziono hodowli lub brak kraju w hodowli!');
    }

    let rasaValue = rasa ?? null;
    let mascValue = masc ?? null;

    // Jeśli podano matkę i ojca, sprawdź płeć i wylicz rasę oraz maść
    const matkaId = matka ? parseInt(matka, 10) : null;
    const ojciecId = ojciec ? parseInt(ojciec, 10) : null;

    if (matkaId && ojciecId) {
      // Pobierz dane matki i ojca
      const matkaResult = await pool.query('SELECT plec, rasa, masc, rok_urodzenia FROM kon WHERE id_konia = $1', [matkaId]);
      const ojciecResult = await pool.query('SELECT plec, rasa, masc, rok_urodzenia FROM kon WHERE id_konia = $1', [ojciecId]);
      const matkaRow = matkaResult.rows[0];
      const ojciecRow = ojciecResult.rows[0];

      if (!matkaRow || matkaRow.plec !== 'klacz') {
        return res.status(400).send('Matka musi być klaczą!');
      }
      if (!ojciecRow || ojciecRow.plec !== 'ogier') {
        return res.status(400).send('Ojciec musi być ogierem!');
      }

      // Walidacja wieku rodziców
      if (matkaRow.rok_urodzenia && rok_urodzenia < (matkaRow.rok_urodzenia + 3)) {
        return res.status(400).send('Koń nie może urodzić się wcześniej niż 3 lata po urodzeniu matki');
      }
      if (ojciecRow.rok_urodzenia && rok_urodzenia < (ojciecRow.rok_urodzenia + 3)) {
        return res.status(400).send('Koń nie może urodzić się wcześniej niż 3 lata po urodzeniu ojca');
      }

      // Dziedziczenie rasy
      const rasaMatki = matkaRow.rasa;
      const rasaOjca = ojciecRow.rasa;
      if (rasaMatki && rasaOjca) {
        if (rasaMatki === 'OO' && rasaOjca === 'OO') {
          rasaValue = 'OO';
        } else if (
          (rasaMatki === 'XO' && rasaOjca === 'XO') ||
          (rasaMatki === 'OO' && rasaOjca === 'XO') ||
          (rasaMatki === 'XO' && rasaOjca === 'OO') ||
          (rasaMatki === 'XX' && rasaOjca === 'XO') ||
          (rasaMatki === 'XO' && rasaOjca === 'XX')
        ) {
          rasaValue = 'XO';
        } else if (
          (rasaMatki === 'OO' && rasaOjca === 'XX') ||
          (rasaMatki === 'XX' && rasaOjca === 'OO') ||
          (rasaMatki === 'XXOO' || rasaOjca === 'XXOO')
        ) {
          rasaValue = 'XXOO';
        } else if (rasaMatki === 'XX' && rasaOjca === 'XX') {
          rasaValue = 'XX';
        } else {
          rasaValue = null;
        }
      } else {
        rasaValue = null;
      }

      // Dziedziczenie maści (losowo jedna z maści rodziców)
      if (matkaRow.masc && ojciecRow.masc) {
        mascValue = Math.random() < 0.5 ? matkaRow.masc : ojciecRow.masc;
      } else {
        mascValue = null;
      }
    }

    // Jeśli nie ma rodziców, nie sprawdzaj wieku rodziców
    // (walidacja roku urodzenia tylko jeśli podano matkę/ojca)
    if (matka && !matkaId) {
      return res.status(400).send('Nieprawidłowy identyfikator matki');
    }
    if (ojciec && !ojciecId) {
      return res.status(400).send('Nieprawidłowy identyfikator ojca');
    }

    await pool.query(
      'INSERT INTO kon (imie, id_hodowli, kraj, plec, rasa, masc, rok_urodzenia, matka, ojciec) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        imie,
        id_hodowli,
        kraj,
        plec,
        rasaValue,
        mascValue,
        rok_urodzenia,
        matkaId,
        ojciecId
      ]
    );
    res.send('Koń został dodany!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas dodawania konia');
  }
});


app.get('/konie', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT k.*, h.nazwa AS hodowla_nazwa, h.kraj AS hodowla_kraj
      FROM kon k
      LEFT JOIN hodowla h ON k.id_hodowli = h.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas pobierania koni');
  }
});

// Edycja kraju
app.patch('/edytuj-kraj/:id', async (req, res) => {
  const { id } = req.params;
  const { nazwa } = req.body;
  if (!nazwa) return res.status(400).send('Brak nowej nazwy kraju');
  try {
    await pool.query('UPDATE kraj SET nazwa = $1 WHERE id = $2', [nazwa, id]);
    res.send('Kraj zaktualizowany!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas edycji kraju');
  }
});

// Edycja hodowli
app.patch('/edytuj-hodowle/:id', async (req, res) => {
  const { id } = req.params;
  const { nazwa, kraj } = req.body;
  if (!nazwa && !kraj) return res.status(400).send('Brak danych do aktualizacji');
  try {
    if (nazwa) {
      await pool.query('UPDATE hodowla SET nazwa = $1 WHERE id = $2', [nazwa, id]);
    }
    if (kraj) {
      // Sprawdź czy kraj istnieje
      const krajCheck = await pool.query('SELECT 1 FROM kraj WHERE id = $1', [kraj]);
      if (!krajCheck.rowCount) return res.status(400).send('Podany kraj nie istnieje');
      await pool.query('UPDATE hodowla SET kraj = $1 WHERE id = $2', [kraj, id]);
    }
    res.send('Hodowla zaktualizowana!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas edycji hodowli');
  }
});

// Edycja konia
app.patch('/edytuj-konia/:id', async (req, res) => {
  const { id } = req.params;
  const { imie, id_hodowli, kraj, plec, rasa, masc, rok_urodzenia, matka, ojciec } = req.body;
  try {
    // Walidacja typów (przykład dla plec, rasa, masc)
    if (plec && !['klacz', 'ogier', 'walach'].includes(plec)) {
      return res.status(400).send('Nieprawidłowa płeć');
    }
    if (rasa && !['XX', 'OO', 'XO', 'XXOO'].includes(rasa)) {
      return res.status(400).send('Nieprawidłowa rasa');
    }
    if (masc && !['Kasztanowa', 'Gniada', 'Kara', 'biała'].includes(masc)) {
      return res.status(400).send('Nieprawidłowa maść');
    }
    // Buduj dynamicznie zapytanie tylko dla podanych pól (poza id)
    const fields = [];
    const values = [];
    let idx = 1;
    if (imie) { fields.push(`imie = $${idx++}`); values.push(imie); }
    if (id_hodowli) { fields.push(`id_hodowli = $${idx++}`); values.push(id_hodowli); }
    if (kraj) { fields.push(`kraj = $${idx++}`); values.push(kraj); }
    if (plec) { fields.push(`plec = $${idx++}`); values.push(plec); }
    if (rasa) { fields.push(`rasa = $${idx++}`); values.push(rasa); }
    if (masc) { fields.push(`masc = $${idx++}`); values.push(masc); }
    if (rok_urodzenia) { fields.push(`rok_urodzenia = $${idx++}`); values.push(rok_urodzenia); }
    if (matka) { fields.push(`matka = $${idx++}`); values.push(matka); }
    if (ojciec) { fields.push(`ojciec = $${idx++}`); values.push(ojciec); }
    if (!fields.length) return res.status(400).send('Brak danych do aktualizacji');
    values.push(id);
    const sql = `UPDATE kon SET ${fields.join(', ')} WHERE id_konia = $${idx}`;
    await pool.query(sql, values);
    res.send('Koń zaktualizowany!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas edycji konia');
  }
});

app.delete('/usun-kraj/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kraj WHERE id = $1', [id]);
    res.send('Kraj usunięty!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas usuwania kraju');
  }
});

// Usuwanie hodowli
app.delete('/usun-hodowle/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hodowla WHERE id = $1', [id]);
    res.send('Hodowla usunięta!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas usuwania hodowli');
  }
});

// Usuwanie konia
app.delete('/usun-konia/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kon WHERE id_konia = $1', [id]);
    res.send('Koń usunięty!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas usuwania konia');
  }
});

// Rekurencyjna funkcja do pobierania drzewa
async function pobierzDrzewo(pool, id_konia, poziom) {
  if (!id_konia || poziom <= 0) return null;
  const result = await pool.query('SELECT * FROM kon WHERE id_konia = $1', [id_konia]);
  if (!result.rows.length) return null;
  const kon = result.rows[0];
  return {
    id_konia: kon.id_konia,
    imie: kon.imie,
    plec: kon.plec,
    rasa: kon.rasa,
    masc: kon.masc,
    rok_urodzenia: kon.rok_urodzenia,
    matka: await pobierzDrzewo(pool, kon.matka, poziom - 1),
    ojciec: await pobierzDrzewo(pool, kon.ojciec, poziom - 1)
  };
}

// Endpoint do pobierania drzewa genealogicznego
app.get('/drzewo/:id_konia/:glebokosc', async (req, res) => {
  const { id_konia, glebokosc } = req.params;
  try {
    const drzewo = await pobierzDrzewo(pool, parseInt(id_konia, 10), parseInt(glebokosc, 10));
    if (!drzewo) return res.status(404).send('Koń nie znaleziony');
    res.json(drzewo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas generowania drzewa');
  }
});



// Rodowód
async function pobierzKoniaZKrajem(pool, id_konia) {
  const result = await pool.query(`
    SELECT k.*, h.nazwa AS hodowla_nazwa, kr.nazwa AS kraj_nazwa
    FROM kon k
    LEFT JOIN hodowla h ON k.id_hodowli = h.id
    LEFT JOIN kraj kr ON k.kraj = kr.id
    WHERE k.id_konia = $1
  `, [id_konia]);
  return result.rows[0] || null;
}

// Rekurencyjna funkcja do pobierania drzewa z nazwą kraju
async function pobierzDrzewo(pool, id_konia, poziom) {
  if (!id_konia || poziom <= 0) return null;
  const kon = await pobierzKoniaZKrajem(pool, id_konia);
  if (!kon) return null;
  return {
    id_konia: kon.id_konia,
    imie: kon.imie,
    plec: kon.plec,
    rasa: kon.rasa,
    masc: kon.masc,
    rok_urodzenia: kon.rok_urodzenia,
    kraj_nazwa: kon.kraj_nazwa,
    matka: await pobierzDrzewo(pool, kon.matka, poziom - 1),
    ojciec: await pobierzDrzewo(pool, kon.ojciec, poziom - 1)
  };
}

// Endpoint szczegóły konia + drzewo
app.get('/szczegoly-konia/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Pobierz szczegóły konia z nazwą kraju
    const kon = await pobierzKoniaZKrajem(pool, id);
    if (!kon) return res.status(404).send('Koń nie znaleziony');
    // Pobierz drzewo genealogiczne o głębokości 3
    const drzewo = await pobierzDrzewo(pool, kon.id_konia, 3);
    res.json({ kon, drzewo });
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas pobierania szczegółów konia');
  }
});

// ...existing code...

// Endpoint: pobierz potomstwo konia z filtrami
app.get('/potomstwo/:id_konia', async (req, res) => {
  const { id_konia } = req.params;
  const { plec, hodowca, rok_urodzenia } = req.query;
  try {
    let query = `
      SELECT k.*, h.nazwa AS hodowla_nazwa, h.kraj AS hodowla_kraj
      FROM kon k
      LEFT JOIN hodowla h ON k.id_hodowli = h.id
      WHERE (k.matka = $1 OR k.ojciec = $1)
    `;
    const params = [id_konia];
    let idx = 2;

    if (plec) {
      query += ` AND k.plec = $${idx++}`;
      params.push(plec);
    }
    if (hodowca) {
      query += ` AND k.id_hodowli = $${idx++}`;
      params.push(hodowca);
    }
    if (rok_urodzenia) {
      query += ` AND k.rok_urodzenia = $${idx++}`;
      params.push(rok_urodzenia);
    }
    query += ' ORDER BY k.rok_urodzenia DESC, k.imie';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas pobierania potomstwa');
  }
});



app.post('/generuj-konie', async (req, res) => {
  const { ile } = req.body;
  const liczba = parseInt(ile, 10);
  if (!liczba || liczba < 1 || liczba > 100) {
    return res.status(400).send('Podaj liczbę koni od 1 do 100');
  }
  try {
    for (let i = 0; i < liczba; i++) {
      await symulator.generujKonia(); // Funkcja eksportowana z sym.js
    }
    res.send(`Wygenerowano ${liczba} koni!`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd podczas generowania koni');
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});