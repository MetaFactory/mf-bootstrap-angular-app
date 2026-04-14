# Entity CRUD Operations — API Contracts (example: Organizer)

This document describes the API endpoints used for **CRUD operations on an entity**, using **Organizer** as the concrete example.

## Base URL

- **Base**: `https://api-test.fairmaster.nl`
- **Entity base path**: `/api/employee/organizer`

## 1) List (paged)

- **Method**: `GET`
- **URL**: `/api/employee/organizer?page=0&size=20`
- **Purpose**: Fetch a paged list of entities.

### Query parameters

- **Pagination**:
  - `page` (0-based)
  - `size`
- **Sorting**:
  - `sort=<field>,asc|desc`
- **Filtering** (when the UI filter bar is enabled):
  - Filter params are derived from the frontend `filterFields` schema and appended as query parameters.
  - The mapping rules are:
    - **TEXT/NUMBER/DATE/DATE_TIME/...**: `?<fieldName>=<value>`
    - **BOOLEAN**: `?<fieldName>=true|false`
    - **SELECT (enum)**:
      - single: `?<fieldName>=<option.id>`
      - multi: `?<fieldName>List=<option.id>` repeated for each selection
    - **SELECT (non-enum entity lookup)**:
      - single: `?<fieldName>Id=<option.id>`
      - multi: `?<fieldName>IdList=<option.id>` repeated for each selection

### Response (example)

```json
{
  "pageNumber": 0,
  "pageSize": 20,
  "pageCount": 1,
  "totalElements": 1,
  "items": [
    {
      "createdDate": "2025-09-09T09:55:01.934717Z",
      "createdBy": "sql",
      "lastModifiedDate": null,
      "lastModifiedBy": null,
      "version": 0,
      "id": 100,
      "name": "Messe Düsseldorf",
      "description": "Messe Düsseldorf"
    }
  ]
}
```

### Notes

- The list response is a **paged envelope** with: `items`, `totalElements`, `pageNumber`, `pageSize`, `pageCount`.

## 2) Filters (metadata)

- **Method**: `GET`
- **URL**: `/api/employee/organizer/filters`
- **Purpose**: Fetch filter definitions (used to render the filter bar).

### Response (example)

```json
{
  "filters": {
    "Organizer.name": {
      "type": "TEXT",
      "translationBase": "organizer.name",
      "multi": false,
      "options": []
    },
    "Organizer.description": {
      "type": "TEXT",
      "translationBase": "organizer.description",
      "multi": false,
      "options": []
    }
  }
}
```

### Filter schema rules (what the frontend expects)

- The response envelope must be: `{ "filters": { ... } }`
- Each filter key is `"EntityName.fieldName"` (example: `"Organizer.name"`).
- Each filter value can include:
  - `multi` (**boolean**): whether the filter supports multiple selections (mainly for `SELECT`)
  - `options` (**array**): option objects for `SELECT`/`BOOLEAN` filters
    - each option should include at least `id`
    - option label can be provided as:
      - `displayValue` (already human-readable), or
      - `translateString` (the UI will translate it)
  - `translationBase` (string): i18n base key for the filter label (optional but recommended)
  - `type` (string): may be present, but the UI prefers the `type` from the frontend schema’s `filterFields`

## 3) Read (details)

- **Method**: `GET`
- **URL**: `/api/employee/organizer/{id}`
- **Example**: `/api/employee/organizer/100`
- **Purpose**: Fetch a single entity by id.

### Response (example)

```json
{
  "createdDate": "2025-09-09T09:55:01.934717Z",
  "createdBy": "sql",
  "lastModifiedDate": null,
  "lastModifiedBy": null,
  "version": 0,
  "id": 100,
  "name": "Messe Düsseldorf",
  "description": "Messe Düsseldorf",
  "displayValue": "Messe Düsseldorf"
}
```

### Notes

- `displayValue` is a human-readable entity label.

## 4) Edit model (existing entity)

- **Method**: `GET`
- **URL**: `/api/employee/organizer/edit/{id}`
- **Example**: `/api/employee/organizer/edit/100`
- **Purpose**: Fetch the server-side edit model for an existing entity.

### Response (example)

```json
{
  "version": 0,
  "id": 100,
  "displayValue": "Messe Düsseldorf",
  "name": "Messe Düsseldorf",
  "description": "Messe Düsseldorf"
}
```

## 5) Edit model (new entity)

- **Method**: `GET`
- **URL**: `/api/employee/organizer/edit/new`
- **Purpose**: Fetch an empty edit model with defaults for creating a new entity.

### Response (example)

```json
{
  "version": null,
  "id": null,
  "displayValue": null,
  "name": null,
  "description": null
}
```

## 6) Save (create or update)

- **Method**: `PUT`
- **URL**: `/api/employee/organizer/edit`
- **Purpose**: Persist the edit model (used for both update and create).

### Update existing (example)

#### Request payload

```json
{
  "name": "Messe Düsseldorf",
  "description": "Messe Düsseldorf xx",
  "version": 0,
  "id": 100,
  "displayValue": "Messe Düsseldorf"
}
```

#### Response (example)

```json
{
  "version": 0,
  "id": 100,
  "displayValue": "Messe Düsseldorf",
  "name": "Messe Düsseldorf",
  "description": "Messe Düsseldorf xx"
}
```

### Create new (example)

#### Request payload

```json
{
  "name": "xxx",
  "description": null,
  "version": null,
  "id": null,
  "displayValue": null
}
```

#### Response (example)

```json
{
  "version": 0,
  "id": 101,
  "displayValue": "xxx",
  "name": "xxx",
  "description": null
}
```

## 7) Delete

- **Method**: `DELETE`
- **URL**: `/api/employee/organizer/{id}`
- **Example**: `/api/employee/organizer/101`
- **Purpose**: Delete an entity by id.

## Typical client call sequence

- **List page load**: `GET /organizer?page={page}&size={size}`
- **Load filter definitions**: `GET /organizer/filters`
- **Select item**: `GET /organizer/{id}`
- **Start editing**: `GET /organizer/edit/{id}`
- **Save**: `PUT /organizer/edit`
- **Start creating**: `GET /organizer/edit/new`
- **Save new**: `PUT /organizer/edit`
- **Delete**: `DELETE /organizer/{id}`

