import User from '../models/User.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from './demoAccounts.js';

let seeding = null;

// Seeds demo data the first time the API runs against an empty database.
export async function ensureSeed() {
  if (seeding) return seeding;
  seeding = (async () => {
    const exists = await User.exists({ email: DEMO_ACCOUNTS.admin.email });
    if (exists) return;
    await seedDemoUsers();
  })().catch((err) => {
    seeding = null;
    throw err;
  });
  return seeding;
}

export async function seedDemoUsers() {
  for (const account of Object.values(DEMO_ACCOUNTS)) {
    await User.create({ ...account, password: DEMO_PASSWORD, isDemo: true });
  }
}
