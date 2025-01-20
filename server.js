const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

app.use(express.json());
app.use(express.static('public'));

// Verbindung zur PostgreSQL-Datenbank mit Pool
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '',
  database: 'iCal'
});

// Route zur Passwortüberprüfung
app.post('/api/check-password', async (req, res) => {
    const { password } = req.body;

    try {
        // Überprüfen, ob das Passwort in der Tabelle 'protected_contents1' existiert und der Status auf true gesetzt ist
        const contents = await pool.query(
            'SELECT * FROM protected_contents1 WHERE password = $1 AND status = true',
            [password]
        );

        // Extrahiere den Inhalt der Spalte "street" aus den Abfrageergebnissen
        const streets = contents.rows.map(row => row.street);
        console.log('Straßen:', streets); // Debugging: Ergebnisse der Straßen ausgeben

        console.log('Abfrageergebnisse:', contents.rows); // Debugging: Ergebnisse der Abfrage ausgeben

        if (contents.rows.length > 0) {
            // Wenn Inhalte gefunden werden, senden Sie sie als JSON-Antwort zurück
            res.json({
                success: true,
                streets: streets,
            });
        } else {
            
        // Wenn keine Inhalte gefunden werden, senden Sie eine Fehlermeldung zurück
        res.json({ 
            success: false, 
            message: 'Ungültiges Passwort oder das Einhorn ist noch unterwegs. Versuche es später nochmal.', 
        });
        
        }
    } catch (error) {
        // Fehlerbehandlung: Loggen Sie den Fehler und senden Sie eine Fehlermeldung zurück
        console.error('Fehler bei der Passwortüberprüfung:', error);
        res.status(500).json({ success: false, message: 'Serverfehler', error: error.message });
    }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
