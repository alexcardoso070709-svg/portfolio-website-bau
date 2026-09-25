# ACVISUALS – Website

Website für **ACVISUALS** – Foto- und Videografie für Unternehmen und Privatkunden.
Design und Bewegungen sind ein Nachbau der Webflow-Vorlage „Ariyana Studio"
(laut Webflow frei für private und kommerzielle Nutzung). Alle Texte, Bilder und Videos sind
eigene Platzhalter und sollen nach und nach durch echte Inhalte ersetzt werden.

Die Seite besteht nur aus einfachen Dateien (HTML, CSS, JavaScript). Es gibt kein
Baukastensystem, keine Datenbank und keinen „Build-Schritt": Was im Ordner liegt, ist die Website.

---

## 1. Was liegt wo?

| Datei / Ordner | Inhalt |
|---|---|
| `index.html` | Startseite |
| `ueber-uns.html` | Über uns |
| `leistungen.html` | Leistungen |
| `projekte.html` | Übersicht aller Projekte |
| `projekt-1.html` … `projekt-6.html` | Einzelne Projekte |
| `blog.html`, `blog-1.html` … `blog-4.html` | Blog-Übersicht und Artikel |
| `kontakt.html` | Kontakt mit Formular |
| `danke.html` | Seite nach dem Absenden des Formulars |
| `impressum.html`, `datenschutz.html` | Rechtliches (**gelb markierte Stellen ausfüllen!**) |
| `404.html` | Seite „nicht gefunden" |
| `bilder/` | Alle Fotos (JPG/PNG) |
| `videos/` | Alle Videos (WebM) |
| `icons/` | Kleine Grafiken und Kundenlogos (SVG) |
| `css/` | Aussehen. `vorlage.css` = Design der Vorlage (nicht ändern), `eigene.css` und `seiten.css` = Ergänzungen |
| `js/` | Bewegungen und Animationen |
| `fonts/` | Schriften (Bebas Neue, DM Sans) – lokal, deshalb DSGVO-freundlich |

---

## 2. Inhalte pflegen (ohne Vorkenntnisse)

### Texte ändern
1. Öffne auf GitHub das Repository und klicke auf die Seite, z. B. `index.html`.
2. Klicke oben rechts auf den **Stift** („Edit this file").
3. Suche mit `Strg + F` (Mac: `Cmd + F`) nach dem Text, den du ändern willst.
   Vor jedem Abschnitt steht ein Hinweis wie
   `<!-- ===== ABSCHNITT: Kundenstimmen – Texte hier ändern ===== -->`.
4. Ändere **nur den Text zwischen den spitzen Klammern**, zum Beispiel:
   `<h2 class="…">`**Dein neuer Text**`</h2>`.
   Alles mit `<` und `>` sowie `class="…"` bitte nicht anfassen.
5. Unten auf **Commit changes** klicken. Fertig – bei Netlify ist die Änderung nach etwa einer Minute online.

Tipps:
- Die großen Überschriften sind sehr groß. Lange Wörter passen dort nicht immer auf das Handy.
  Nach jeder Änderung auf dem Handy nachsehen.
- Menü und Footer stehen auf **jeder** Seite einzeln. Wenn du dort etwas änderst
  (z. B. Telefonnummer), musst du es auf allen Seiten ändern. Tipp: Die Suche auf GitHub
  (Taste `.` öffnet den Web-Editor) kann in allen Dateien gleichzeitig suchen und ersetzen.

### Bilder tauschen
Am einfachsten: **Neues Bild mit genau demselben Dateinamen hochladen.**
1. Bild vorbereiten: gleiches Seitenverhältnis wie das alte Bild (siehe Tabelle unten),
   als JPG speichern, möglichst unter 500 KB (z. B. mit squoosh.app verkleinern).
2. Auf GitHub in den Ordner `bilder/` gehen → **Add file → Upload files** → Datei hineinziehen
   → **Commit changes**. Heißt die Datei gleich, wird das alte Bild ersetzt.
3. Beschreibung für Suchmaschinen und blinde Menschen: In der HTML-Datei beim Bild den Text
   hinter `alt="…"` anpassen.

| Datei | Wo | Format |
|---|---|---|
| `hero.jpg` | Startseite ganz oben (Hintergrund) | 2400 × 1625 (quer) |
| `projekt-1.jpg` … `projekt-6.jpg` | Projektkarten | 1200 × 1200 (quadratisch) |
| `projekt-detail-1.jpg` … `-7.jpg` | Bilder auf den Projektseiten | wie vorhanden |
| `jahr-1.jpg` … `jahr-6.jpg` | Meilensteine auf der Startseite | 960 × 600 |
| `team-1.jpg` … `team-4.jpg` | Team auf „Über uns" | 780 × 900 (hoch) |
| `einblick-1.jpg` … `einblick-4.jpg` | Einblicke auf „Über uns" | 920 × 1240 (hoch) |
| `blog-1.jpg` … `blog-4.jpg` | Blog | 1680 × 700 (breit) |
| `kundenstimme-1.jpg` … `-3.jpg`, `gesicht-1.jpg` … `-10.jpg` | kleine Porträts | quadratisch |
| `og-bild.jpg` | Vorschaubild beim Teilen (WhatsApp, LinkedIn …) | 1200 × 630 |

### Videos tauschen
Videos liegen in `videos/` als `.webm`. Eigenes Video (z. B. Showreel) so vorbereiten:
kurz (10–20 s), ohne Ton, max. 1920 px breit, möglichst unter 5 MB.
Umwandeln in WebM z. B. mit HandBrake oder einem Online-Konverter, dann mit gleichem Namen
hochladen (`showreel.webm`, `leistung-1.webm` …). Das passende Standbild (`bilder/showreel.jpg`
usw.) ebenfalls ersetzen – es wird angezeigt, bis das Video lädt.

### Neues Projekt oder neuen Blog-Artikel anlegen
1. Eine vorhandene Datei kopieren (z. B. `projekt-6.html` → `projekt-7.html`):
   Datei öffnen → Inhalt komplett kopieren → **Add file → Create new file** → Namen eingeben → einfügen.
2. Texte und Bildnamen in der neuen Datei anpassen.
3. In `projekte.html` eine Projektkarte kopieren und den Link auf `projekt-7.html` ändern.
4. In `sitemap.xml` eine Zeile für die neue Seite ergänzen.

---

## 3. Veröffentlichen

### Variante A: Netlify (empfohlen, kostenlos für kleine Seiten)
1. Auf netlify.com mit dem GitHub-Konto anmelden.
2. **Add new site → Import an existing project → GitHub** → dieses Repository wählen.
3. Build command: leer lassen. Publish directory: `/` (bzw. leer). **Deploy** klicken.
4. Unter **Domain management** die eigene Domain verbinden (Netlify erklärt die DNS-Schritte).
5. Das Kontaktformular funktioniert automatisch über **Netlify Forms**
   (Nachrichten unter „Forms" im Netlify-Konto; E-Mail-Benachrichtigung dort einschalten).
6. Sicherheits-Header kommen aus der Datei `_headers`.

### Variante B: Klassischer Webspace (Strato, IONOS, All-Inkl …)
1. Alle Dateien **inklusive** `.htaccess` per FTP (z. B. FileZilla) in das Hauptverzeichnis laden.
   `.git`, `README.md` und `_headers` werden nicht gebraucht.
2. HTTPS/SSL-Zertifikat im Kundenmenü des Hosters aktivieren.
3. **Wichtig:** Das Kontaktformular braucht Netlify. Auf normalem Webspace entweder ein
   Formular-Skript des Hosters nutzen oder das Formular durch einen E-Mail-Link ersetzen.

### Nach dem Veröffentlichen
- In allen Dateien `https://www.acvisuals.de` durch die echte Domain ersetzen
  (betrifft `robots.txt`, `sitemap.xml` und die `<head>`-Bereiche der Seiten).

---

## 4. Offene Punkte für den Inhaber

Diese Stellen sind **Platzhalter** und müssen vor dem Start geprüft oder ersetzt werden:

### Pflicht (rechtlich)
- [ ] `impressum.html`: alle **gelb markierten** Angaben (Name, Anschrift, E-Mail, Telefon,
      USt-IdNr. bzw. Kleinunternehmer-Hinweis).
- [ ] `datenschutz.html`: gelb markierte Angaben (Verantwortlicher, **Hoster**, Formular-Dienst).
      Am besten von einer Fachperson prüfen lassen – die Texte sind keine Rechtsberatung.
- [ ] Hinweis: Wenn ACVISUALS von einer minderjährigen Person betrieben wird, gelten für das
      Gewerbe besondere Regeln (Zustimmung der Eltern / Familiengericht). Bitte klären.

### Kontakt und Marke
- [ ] E-Mail `hallo@acvisuals.de`, Telefon `+49 000 000 0000` und Adresse
      `Musterstraße 1, 00000 Musterstadt` auf **allen Seiten** ersetzen (Footer + Menü + Kontakt).
- [ ] Instagram- und TikTok-Links (zeigen noch auf die Startseiten der Netzwerke).
- [ ] Domain `https://www.acvisuals.de` prüfen/ersetzen.

### Inhalte
- [ ] Alle Fotos und Videos durch eigene Arbeiten ersetzen (siehe Abschnitt 2).
- [ ] Texte prüfen – sie sind improvisiert. Schreibt ihr als „wir" oder „ich"?
<!-- OFFENE-PUNKTE-INHALT -->

---

## 5. Technik (für Fortgeschrittene)

- Keine externen Anfragen: Schriften, Bibliotheken (GSAP 3.15 mit ScrollTrigger/SplitText,
  Lenis) und Medien liegen lokal. Keine Cookies, kein Tracking.
- Strenge Content-Security-Policy (im `<head>` jeder Seite und in `.htaccess`/`_headers`):
  keine Inline-Skripte und keine Inline-Styles.
- Ohne JavaScript bleibt alles lesbar; Animationen respektieren „Bewegung reduzieren"
  (`prefers-reduced-motion`).
- Schriften: Bebas Neue und DM Sans, SIL Open Font License (siehe `fonts/`).
