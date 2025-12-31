# Database Migration Guide

## Problem We Solved

Previously, database schema changes were made by directly modifying the `rabuste.db` file. This caused Git merge conflicts because:

- Database files are binary and cannot be merged by Git
- Multiple developers making schema changes simultaneously created conflicts
- Even logically independent changes (different tables) caused merge failures

## Solution: SQL Migration System

We now use **SQL migration files** to version database schema changes. This allows:

✅ Multiple developers to work on schema changes independently  
✅ Git to merge schema changes as text files (SQL)  
✅ Clear history of all database changes  
✅ Safe, reproducible database setup for all team members  

## Quick Start

### For New Schema Changes

1. **Create a new migration file** in `server/migrations/`:
   ```
   005_your_feature_name.sql
   ```
   (Use the next sequential number)

2. **Write your SQL** in the file:
   ```sql
   ALTER TABLE your_table ADD COLUMN new_column TEXT;
   ```

3. **Test it**:
   ```bash
   cd server
   npm run migrate
   ```

4. **Commit the migration file** along with your code changes

### For Existing Changes

If you have local schema changes that aren't in migrations yet:

1. **Create a migration file** with your changes
2. **Test it** works on your database
3. **Commit it** so your teammate can apply it

## What Changed

### Files Added
- `server/migrations/` - Directory containing SQL migration files
- `server/migrations/migrate.js` - Migration runner script
- `server/migrations/README.md` - Detailed migration documentation

### Files Modified
- `server/db.js` - Now runs migrations automatically on startup
- `.gitignore` - Added `*.db` to ignore database files
- `server/package.json` - Added `npm run migrate` script

### Files to Ignore
- `*.db` files are now in `.gitignore` - **DO NOT commit database files**

## Workflow for Your Current Situation

Since you're currently in a rebase with conflicts on `server/rabuste.db`:

### Option 1: Abort and Use Migrations (Recommended)

1. **Abort the current rebase**:
   ```bash
   git rebase --abort
   ```

2. **Remove the database file conflict**:
   ```bash
   git rm server/rabuste.db
   ```

3. **Ensure migrations are up to date**: The migration files should contain all schema changes from both branches

4. **Continue your rebase**: Git should now be able to merge since `.db` files are ignored

5. **Run migrations** after rebase completes:
   ```bash
   cd server
   npm run migrate
   ```

### Option 2: Resolve Manually (If Option 1 doesn't work)

1. **Accept one version** of the database file temporarily:
   ```bash
   git checkout --ours server/rabuste.db
   # or
   git checkout --theirs server/rabuste.db
   ```

2. **Remove it from Git tracking**:
   ```bash
   git rm server/rabuste.db
   ```

3. **Continue rebase**:
   ```bash
   git rebase --continue
   ```

4. **Run migrations** to recreate schema:
   ```bash
   cd server
   npm run migrate
   ```

## Creating Migrations from Existing Changes

If you have schema changes that aren't yet in migration files:

1. **Check what columns/tables exist** in your current database
2. **Create a new migration file** (e.g., `005_your_changes.sql`) with the ALTER TABLE or CREATE TABLE statements
3. **Test the migration** runs successfully
4. **Commit the migration file**

Your teammate should do the same for their changes in a separate migration file.

## Team Coordination

- **Coordinate migration numbers**: When creating new migrations, check what the highest number is to avoid conflicts
- **Different tables = different migrations**: If you modify `menu_items` and your teammate modifies `art_items`, create separate migration files
- **Review migrations in PRs**: Always review migration files in pull requests to understand schema changes

## Need Help?

See `server/migrations/README.md` for detailed documentation on:
- Creating migrations
- Best practices
- Troubleshooting
- File naming conventions

