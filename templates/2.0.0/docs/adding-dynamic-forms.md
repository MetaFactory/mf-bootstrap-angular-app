# Adding a new dynamic form (schema-driven pages)

This project uses **schema-driven forms** rendered by the shared `DynamicFormComponent`. To add a new “page” (list + details) you typically **do not** create an Angular page component; instead you:

- add a `*.schema.ts` file under `web/src/schema/`
- register it in the schema exports + `dynamicForms`
- register a matching **dynamic entity service** so the dynamic UI can load list/details data
- ensure the backend supports the **entity CRUD API contracts** used by the UI (list/details/edit/new/save/delete + filters)

---

## What you get automatically

When a schema is registered in `dynamicForms`:

- **Routes are generated** from `schema.path` in `web/src/_internal/app/getDynamicRoutes.ts`
  - `data-table` schemas get:
    - a list route at `/<schema.path>`
    - a details route at `/<schema.path>/:id`
  - `entity-panel` schemas get a route at `/<schema.path>`
- The UI is rendered by `DynamicFormComponent` and uses `schema.serviceName` to find the correct `EntityService` instance.

---

## Step-by-step checklist

### 1) Create the schema file

Create `web/src/schema/<entity>.schema.ts`.

Use the same pattern as `web/src/schema/user.schema.ts`:

- define `listFields` for the data table
- (optional) define `filterFields` to enable the **filter bar** on the list page
- define `fields` for the entity panel
- export:
  - `<entity>DataTableSchema` via `normalizeDataTableFormSchema({ ... })`
  - `<entity>EntityViewSchema` via `normalizeEntityPanelSchema({ ... })`

Minimal example (shape only):

```ts
import { FieldSchema } from '@common/types';
import { normalizeDataTableFormSchema, normalizeEntityPanelSchema } from '@common/utils';

const listFields: FieldSchema[] = [
  { name: 'id', type: 'NUMBER' },
  { name: 'name', type: 'TEXT' },
];

const filterFields: FieldSchema[] = [
  { name: 'name', type: 'TEXT' },
];

const fields: FieldSchema[] = [
  { name: 'name', type: 'TEXT', required: true },
];

export const exampleDataTableSchema = normalizeDataTableFormSchema({
  title: 'Examples',
  serviceName: 'examples',
  path: 'examples',
  fields: listFields,
  filterFields,
  canInsert: true,
});

export const exampleEntityViewSchema = normalizeEntityPanelSchema({
  title: 'Example',
  serviceName: 'examples',
  path: 'examples/:id',
  fields,
  canEdit: true,
  canDelete: true,
});
```

**Key rule**: `serviceName` must match the dynamic service name you register in step 4.

---

### 2) Export the schema from `web/src/schema/index.ts`

Add:

- `export * from './<entity>.schema';`

This allows `src/schema` imports used by `web/src/app/dynamic-entities.ts`.

---

### 3) Register the schema in `dynamicForms`

Edit `web/src/app/dynamic-entities.ts` and add your new schemas to the exported array:

- `export const dynamicForms = [ ..., <entity>DataTableSchema, <entity>EntityViewSchema ];`

These are the schemas used for:

- dynamic routing
- dynamic rendering
- general service initialization

---

### 4) Register a dynamic entity service

Edit `web/src/services/dynamic-services.ts` and add an entry:

```ts
{ name: '<serviceName>', path: '<apiPath>' }
```

Example for bookings:

- **name**: `bookings`
- **path**: `bookings`  → resolves to `GET /api/bookings` via the shared API base URL

This is required because `StoreServiceBase` constructs an `EntityService` for each entry (and `DynamicFormComponent` looks it up by `serviceName`).

---

### 5) Add a nav item (optional but typical)

Edit `web/src/app/nav-items.ts`:

```ts
{
  title: 'Bookings',
  path: '/bookings',
  icon: 'event'
}
```

The path should match your schema `path` (prefixed with `/`).

---

## Backend requirements (list endpoint contract)

For the full set of **entity CRUD API contracts** (list/read/edit/new/save/delete + filters), see:

- `assets/docs/entity-crud-apis.md`

The dynamic data table calls the list endpoint with pagination/sorting (and optionally filtering) query params:

- `page`
- `size`
- `sort=field,asc|desc`

When those params are present, the endpoint must return an **EntityListDto**-like shape:

```json
{
  "items": [ ... ],
  "totalElements": 123,
  "pageSize": 50,
  "pageNumber": 0,
  "pageCount": 3
}
```

Notes:

- If your backend already returns this shape, you’re done.
- If it returns a raw `List`, update it to return the DTO shape when pagination params are present (the Booking endpoint was adjusted to be backwards compatible by returning a raw list when no paging params are present).
- If you enable `filterFields` in the schema, the UI will also call `GET /<entity>/filters` and pass filter values as query params on the list call (see `assets/docs/entity-crud-apis.md` for the mapping rules).

---

## Quick verification

- Start web: `npm --workspace lumina-book-web run dev`
- Navigate to `/<schema.path>` (example: `/bookings`)
- Confirm:
  - list loads and shows columns from `listFields`
  - (if configured) the filter bar shows and filtering updates the list
  - clicking a row opens details (via the generated `/<path>/:id` route)
  - creating/editing works (requires `/edit/new`, `/edit/{id}`, and `PUT /edit` on the backend)

