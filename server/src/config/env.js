const path = require('node:path');
const dotenv = require('dotenv');

// Prefer server/.env when running the backend workspace directly, then fall
// back to the repository root .env. Explicit process environment wins in both.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
