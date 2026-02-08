# Fachschafts-Webapplikation

Dieses Projekt ist eine Webapplikation für die Fachschaft, die im Rahmen der
Portfolioprüfung im Fach **Cloud Computing** entwickelt wird.

Die Anwendung besteht aus einem **Node.js + Express Backend** und einem
**Astro-Frontend mit SolidJS** und deckt die Render-Methoden **SSG, SSR und SPA** ab.

---

## 📌 Projektidee

Die Webapplikation bietet:

- Öffentliche Informationsseiten über die Fachschaft
- Eine Übersicht über anstehende Events
- Anzeige der aktuellen Büro-Öffnungszeiten
- Eine Inventarübersicht mit Möglichkeit, Gegenstände auszuleihen
- Einen geschützten Verwaltungsbereich für Mitglieder und Vorstand

---

## 🧱 Architekturübersicht

---

## Datenmodell

```mermaid
erDiagram
    USERS ||--o{ BORROW_REQUESTS : recives  
    ITEMS ||--o{ BORROW_REQUESTS : requested_for
    USERS ||--o{ EVENTS : creates
    USERS ||--o{ OPENING_HOURS : updates
    USERS ||--o{ NEWS : writes

    USERS {
        int id PK
        string username
        string email
        string password_hash
        int role_id FK
        boolean active
    }

    

    ITEMS {
        int id PK
        string name
        string description
        string category
        boolean available
    }

    BORROW_REQUESTS {
        int id PK
        date start_date
        date end_date
        string status
    }
```