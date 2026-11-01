# TyagiJI Client Architecture (V12 enhancement)

The client remains a React + Vite application and keeps the existing route, API, authentication and domain page contracts.

## Folder conventions

```text
client/src/
  app/                  Route composition and application boundaries
  components/
    common/              Application-wide fallbacks and accessibility helpers
    ui/                  Reusable design-system components
    courses/             Course-domain components
    dashboard/           Dashboard-domain components
    projects/             Project-domain components
    resources/            Resource-domain components
    admin/                Admin-domain components
  context/               Authentication and shared application context
  hooks/                 Reusable state/data hooks
  layouts/               Public and authenticated application shell
  pages/                 Route-level page components grouped by domain
  services/              API and integration clients
  styles/
    components/           Shared component styling
    pages/                Route/page styling
  tests/                 Component and workflow tests
```

## Shared UI library

The `components/ui` barrel exports Button, Card, Badge, PageHeader, SectionHeader, Container, EmptyState, LoadingState, ErrorState, SuccessState, SearchField, ProgressBar, StatCard, Avatar, Alert, Skeleton, Input, Select, Textarea, Modal, ConfirmDialog, Tabs, DataTable, Divider, IconButton, Checkbox, RadioGroup, FileUpload, Pagination, FilterBar, SortControl, Dropdown, Drawer, Tooltip and Toast.

Components are intentionally dependency-light and use the existing React and lucide-react dependencies. Keep business logic in page/domain modules and pass data/actions into UI components through props.

## Styling

- `styles/global.css` retains the established V9/V11 base styles.
- `styles/layout-premium.css` styles the shared navigation and application shell.
- `styles/components/ui.css` styles the reusable UI library.
- `styles/pages/enterprise-pages.css` enhances existing page layouts and the V11 career workspace.
- Theme variables follow the existing `data-theme="dark|light"` convention.

## API and data rules

The API client keeps cookie-based credentials (`credentials: include`), normalizes the base URL and supports 204 responses, JSON and non-JSON error responses, abort signals and convenience methods. It does not store access or refresh tokens in browser storage.

Career profile and roadmap screens call the existing `/career/profile` and `/career/roadmaps` endpoints. Do not add UI that claims to save data unless the matching server endpoint exists and returns success.

## Testing

Run `npm test` and `npm run build` from this folder after installing dependencies. Tests in `tests/ui-components.test.jsx` cover core design-system behavior. Add feature tests whenever a new page workflow or API contract is introduced.

## Domain components

`components/domain.js` exports CourseGrid, CourseProgressCard, ActivityTimeline, QuickActionCard, ProjectChecklist, ResourceCard, AchievementCard and PermissionGate. PermissionGate is only a UI convenience; backend endpoints must still authorize every request.
