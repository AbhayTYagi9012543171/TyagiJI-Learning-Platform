# Page modules

`index.js` is the route-level export barrel used by `app/App.jsx`. Each route has its own module and can be migrated independently into feature-specific components and hooks.

For this compatibility release, established pages re-export their working implementation from `Pages.jsx` to preserve API calls, authentication behavior and existing route contracts. `about/AboutPage.jsx` and `achievements/AchievementsPage.jsx` are dedicated implementations. Do not remove `Pages.jsx` until all delegated pages have been migrated and covered by route/integration tests.
