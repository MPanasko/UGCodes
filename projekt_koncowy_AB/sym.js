const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'konie',
  password: '110303',
  port: 5432,
});

function losuj(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getAll(table) {
  const res = await pool.query(`SELECT * FROM ${table}`);
  return res.rows;
}

async function getAllKonie() {
  const res = await pool.query(`SELECT id_konia, plec, rasa, masc, rok_urodzenia FROM kon`);
  return res.rows;
}

async function generujKonia() {
  // Pobierz dane z bazy
  const kraje = await getAll('kraj');
  const hodowle = await getAll('hodowla');
  const rasy = ['XX', 'OO', 'XO', 'XXOO'];
  const masci = ['Kasztanowa', 'Gniada', 'Kara', 'biala'];
  const plecie = ['klacz', 'ogier', 'walach'];
  const konie = await getAllKonie();

  // Pobierz imiona z pliku imiona.json
  const imionaPath = path.join(__dirname, 'imiona.json');
  let imiona = [];
  try {
    imiona = JSON.parse(await fs.readFile(imionaPath, 'utf8'));
  } catch (e) {
    console.error('Błąd podczas czytania pliku imiona.json:', e);
    throw e;
  }

  // Losuj hodowlę i kraj
  const hodowla = losuj(hodowle);
  const id_hodowli = hodowla.id;
  const kraj = hodowla.kraj;

  // Losuj rodziców jeśli są dostępni (matka = klacz, ojciec = ogier)
  const klacze = konie.filter(k => k.plec === 'klacz');
  const ogiery = konie.filter(k => k.plec === 'ogier');
  let matka = null, ojciec = null, rasa = null, masc = null, rok_urodzenia = null;

  if (klacze.length && ogiery.length) {
    const matkaObj = losuj(klacze);
    const ojciecObj = losuj(ogiery);
    matka = matkaObj.id_konia;
    ojciec = ojciecObj.id_konia;

    // Dziedziczenie rasy (jak w main.js)
    const rasaMatki = matkaObj.rasa;
    const rasaOjca = ojciecObj.rasa;
    if (rasaMatki && rasaOjca) {
      if (rasaMatki === 'OO' && rasaOjca === 'OO') {
        rasa = 'OO';
      } else if (
        (rasaMatki === 'XO' && rasaOjca === 'XO') ||
        (rasaMatki === 'OO' && rasaOjca === 'XO') ||
        (rasaMatki === 'XO' && rasaOjca === 'OO') ||
        (rasaMatki === 'XX' && rasaOjca === 'XO') ||
        (rasaMatki === 'XO' && rasaOjca === 'XX')
      ) {
        rasa = 'XO';
      } else if (
        (rasaMatki === 'OO' && rasaOjca === 'XX') ||
        (rasaMatki === 'XX' && rasaOjca === 'OO') ||
        (rasaMatki === 'XXOO' || rasaOjca === 'XXOO')
      ) {
        rasa = 'XXOO';
      } else if (rasaMatki === 'XX' && rasaOjca === 'XX') {
        rasa = 'XX';
      } else {
        rasa = losuj(rasy);
      }
    } else {
      rasa = losuj(rasy);
    }

    // Dziedziczenie maści (losowo jedna z rodziców)
    masc = losuj([matkaObj.masc, ojciecObj.masc]);

    // Rok urodzenia: średnia wieku rodziców + 5 (zaokrąglona w dół)
    if (matkaObj.rok_urodzenia && ojciecObj.rok_urodzenia) {
      rok_urodzenia = Math.max(matkaObj.rok_urodzenia, ojciecObj.rok_urodzenia) + 3 + Math.floor(Math.random() * 5);
    } else {
      rok_urodzenia = Math.floor(Math.random() * 10) + 2015;
    }
  } else {
    // Brak rodziców - losowe wartości
    rasa = losuj(rasy);
    masc = losuj(masci);
    rok_urodzenia = Math.floor(Math.random() * 10) + 2015;
  }

  const imie = losuj(imiona);
  const plec = losuj(plecie);

  // Dodaj konia do bazy
  try {
    await pool.query(
      'INSERT INTO kon (imie, id_hodowli, kraj, plec, rasa, masc, rok_urodzenia, matka, ojciec) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [imie, id_hodowli, kraj, plec, rasa, masc, rok_urodzenia, matka, ojciec]
    );
    console.log(`Dodano konia: ${imie}, płeć: ${plec}, rasa: ${rasa}, maść: ${masc}, rok: ${rok_urodzenia}, hodowla: ${id_hodowli}, kraj: ${kraj}, matka: ${matka}, ojciec: ${ojciec}`);
  } catch (err) {
    console.error('Błąd podczas dodawania konia:', err);
    throw err;
  }
}

// Eksport funkcji do użycia w backendzie
module.exports = { generujKonia };

// Pozwala uruchomić pojedyncze generowanie z linii poleceń
if (require.main === module) {
  generujKonia()
    .then(() => pool.end())
    .catch(() => pool.end());
}