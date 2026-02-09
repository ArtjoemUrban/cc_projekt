# Cloud Computing Projekt APIs

Diese Dokumentation beschreibt die API-Routen aus backend/src/routes.

## Allgemein

- Base-URL: http://localhost:3000
- Auth: JWT im Header `Authorization: Bearer <token>` (wo angegeben)
- Responses: JSON

---

## Health

### GET /health
Prüft den Serverstatus.

Response
- 200: `{ "status": "OK" }`

---

## Auth

### POST /auth/register
Erstellt einen neuen Benutzer (nur Admin).

Auth: erforderlich (Admin)

Body
- `username` (string, required)
- `password` (string, required)
- `role` (string, required; `admin` | `user`)

Response
- 201: `{ message, userId }`

### POST /auth/login
Login für bestehende Benutzer.

Body
- `username` (string, required)
- `password` (string, required)

Response
- 200: `{ message, token }`

---

## User

### GET /user/me
Gibt den aktuell eingeloggten Benutzer zurück.

Auth: erforderlich

Response
- 200: `{ id, username, role, created_at, updated_at }`

### GET /user
Liste aller Benutzer.

Auth: erforderlich

Response
- 200: `[{ id, username, role, created_at, updated_at }, ...]`

### GET /user/:username
Benutzer nach Username.

Auth: erforderlich

Response
- 200: `{ id, username, role, created_at, updated_at }`

### DELETE /user/:username
Löscht Benutzer (nur Admin).

Auth: erforderlich (Admin)

Response
- 200: `{ message }`

### PUT /user/change-password
Ändert das Passwort.

Auth: erforderlich

Body
- `username` (string, required)
- `oldPassword` (string, required)
- `newPassword` (string, required)

Response
- 200: `{ message }`

### PUT /user/change-username
Ändert den Benutzernamen.

Auth: erforderlich

Body
- `oldUsername` (string, required)
- `newUsername` (string, required)
- `password` (string, required)

Response
- 200: `{ message }`

### PUT /user/change-role
Ändert die Rolle (nur Admin).

Auth: erforderlich (Admin)

Body
- `username` (string, required)
- `newRole` (string, required; `admin` | `user`)

Response
- 200: `{ message }`

---

## Events

### POST /events/events
Erstellt ein Event.

Auth: erforderlich

Body
- `name` (string, required)
- `start_datetime` (string, required)
- `end_datetime` (string, required)
- `location` (string, required)

Response
- 201: `{ message }`

### GET /events/events
Liste aller Events.

Response
- 200: `[{ ... }, ...]`

### GET /events/events/:id
Event per ID.

Response
- 200: `{ ... }`

### PUT /events/events/:id
Aktualisiert ein Event (partiell möglich).

Auth: erforderlich

Body
- `name` (string, optional)
- `start_datetime` (string, optional)
- `end_datetime` (string, optional)
- `location` (string, optional)
- `description` (string, optional)

Response
- 200: `{ message }`

### DELETE /events/events/:id
Löscht ein Event.

Auth: erforderlich

Response
- 200: `{ message }`

---

## Inventory

### GET /inventory
Alle Inventar-Items.

Response
- 200: `[{ ... }, ...]`

### GET /inventory/available
Nur verfügbare Items.

Response
- 200: `[{ ... }, ...]`

### GET /inventory/categories
Liste aller Kategorien.

Response
- 200: `["category", ...]`

### GET /inventory/:id
Item per ID.

Response
- 200: `{ ... }`

### POST /inventory
Item anlegen.

Auth: erforderlich

Body
- `name` (string, required)
- `quantity` (number, required)
- `category` (string, required)
- `description` (string, optional)
- `is_available` (boolean, optional)
- `is_for_borrow` (boolean, optional)

Response
- 201: `{ id, name, quantity, description, category, is_available, is_for_borrow }`

### PATCH /inventory/:id
Item partiell aktualisieren.

Auth: erforderlich

Body
- `name` (string, optional)
- `quantity` (number, optional)
- `description` (string, optional)
- `category` (string, optional)
- `is_available` (boolean, optional)
- `is_for_borrow` (boolean, optional)

Response
- 200: `{ message, id }`

### DELETE /inventory/:id
Item löschen.

Auth: erforderlich

Response
- 200: `{ message, id }`

---

## Borrow Requests

### POST /borrow/borrow-request
Erstellt eine Ausleihanfrage.

Body
- `item_id` (number, required)
- `borrower_name` (string, required)
- `borrower_email` (string, required)
- `start_date` (string, required)
- `end_date` (string, required)

Response
- 201: `{ message }`

### GET /borrow/borrow-requests
Liste aller Ausleihanfragen.

Response
- 200: `[{ ... }, ...]`

### GET /borrow/borrow-requests/:id
Ausleihanfrage per ID.

Auth: erforderlich

Response
- 200: `{ ... }`

### DELETE /borrow/borrow-requests/:id
Ausleihanfrage löschen.

Auth: erforderlich

Response
- 200: `{ message }`

### POST /borrow/borrow-requests/:id/approve
Ausleihanfrage freigeben.

Auth: erforderlich

Response
- 200: `{ message }`

### POST /borrow/borrow-requests/:id/reject
Ausleihanfrage ablehnen.

Auth: erforderlich

Response
- 200: `{ message }`

### PUT /borrow/borrow-requests/:id/return
Ausleihanfrage als zurückgegeben markieren.

Auth: erforderlich

Response
- 200: `{ message }`

---

## Opening Hours

### POST /opening-hours
Öffnungszeiten anlegen.

Auth: erforderlich

Body
- `day_of_week` (string, required)
- `open_time` (string, required)
- `close_time` (string, required)

Response
- 201: `{ message }`

### GET /opening-hours
Öffnungszeiten abrufen.

Response
- 200: `[{ ... }, ...]`

### PUT /opening-hours/:id
Öffnungszeiten aktualisieren.

Auth: erforderlich

Body
- `day_of_week` (string, required)
- `open_time` (string, required)
- `close_time` (string, required)

Response
- 200: `{ message }`

### DELETE /opening-hours/:id
Öffnungszeiten löschen.

Auth: erforderlich

Response
- 200: `{ message }`

---

## Shifts

### GET /shifts
Alle Schichten.

Response
- 200: `[{ ... }, ...]`

### GET /shifts/:id
Schicht per ID.

Response
- 200: `{ ... }`

### POST /shifts
Schicht erstellen.

Auth: erforderlich

Body
- `user_id` (number, required)
- `start_time` (string, required)
- `end_time` (string, required)

Response
- 201: `{ message }`

### PUT /shifts/:id
Schicht aktualisieren.

Auth: erforderlich

Body
- `user_id` (number, required)
- `start_time` (string, required)
- `end_time` (string, required)

Response
- 200: `{ message }`

### DELETE /shifts/:id
Schicht löschen.

Auth: erforderlich

Response
- 200: `{ message }`

### POST /shifts/:id/join
Schicht beitreten.

Auth: erforderlich

Response
- 200: `{ message }`

### POST /shifts/:id/leave
Schicht verlassen.

Auth: erforderlich

Response
- 200: `{ message }`