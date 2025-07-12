// This script updates all user documents to ensure they have type: 'user' and isActive: true, but does NOT overwrite the role field.
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

async function fixUserDocs() {
  const result = await db.find({ selector: { type: 'user' } });
  const users = result.docs;
  let updated = 0;
  for (const user of users) {
    let changed = false;
    const oldRole = user.role;
    if (user.type !== 'user') { user.type = 'user'; changed = true; }
    if (user.isActive === false || user.isActive === undefined) { user.isActive = true; changed = true; }
    if (changed) {
      await db.put(user);
      updated++;
      console.log(`Updated user: ${user._id} | role before: ${oldRole} | role after: ${user.role}`);
    } else {
      console.log(`No change for user: ${user._id} | role: ${user.role}`);
    }
  }
  console.log(`Done. Updated ${updated} user documents.`);
}

fixUserDocs().catch(console.error); 