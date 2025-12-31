# Database Migrations

This directory contains SQL migration files that manage database schema changes. Migrations allow multiple team members to work on schema changes independently without Git conflicts.

## How It Works

- **Migration files**: Each migration is a numbered SQL file (e.g., `001_initial_schema.sql`, `002_add_menu_items_columns.sql`)
- **Migration tracking**: Applied migrations are recorded in the `schema_migrations` table
- **Idempotent**: Migrations can be run multiple times safely (duplicate column/table errors are ignored)

## Creating a New Migration

When you need to add or modify database schema:

1. **Create a new migration file** with the next sequential number:
   ```
   server/migrations/005_your_migration_name.sql
   ```

2. **Use a descriptive name** that explains what the migration does:
   - Good: `005_add_user_preferences_table.sql`
   - Bad: `005_update.sql`

3. **Write SQL statements** in the file:
   ```sql
   -- Add new table
   CREATE TABLE IF NOT EXISTS user_preferences (
       user_id TEXT PRIMARY KEY,
       theme TEXT DEFAULT 'light',
       notifications INTEGER DEFAULT 1
   );

   -- Or modify existing tables
   ALTER TABLE menu_items ADD COLUMN dietary_info TEXT;
   ```

4. **Test your migration**:
   ```bash
   cd server
   npm run migrate
   ```

5. **Commit both the migration file and your code changes**:
   ```bash
   git add server/migrations/005_your_migration_name.sql
   git add server/db.js  # or other files that use the new schema
   git commit -m "Add user preferences table"
   ```

## Running Migrations

Migrations run automatically when the server starts (via `db.js`), but you can also run them manually:

```bash
cd server
npm run migrate
```

## Best Practices

1. **One logical change per migration**: Keep migrations focused on a single feature or change
2. **Never modify existing migration files**: Once committed, migration files should never be changed. Create a new migration to fix issues
3. **Test migrations**: Always test migrations on a copy of your database before committing
4. **Use IF NOT EXISTS**: For CREATE TABLE statements, use `CREATE TABLE IF NOT EXISTS` to make migrations idempotent
5. **Document breaking changes**: Add comments in migration files explaining any breaking changes

## File Naming Convention

Format: `NNN_descriptive_name.sql`

- `NNN`: 3-digit zero-padded number (001, 002, 003, ...)
- `descriptive_name`: Lowercase with underscores, describing what the migration does

Examples:
- `001_initial_schema.sql` - Creates all base tables
- `002_add_menu_items_columns.sql` - Adds columns to menu_items table
- `003_add_art_items_columns.sql` - Adds columns to art_items table

## Resolving Merge Conflicts

If you and a teammate both create migrations at the same time:

1. **One of you should renumber**: If you create `005_new_feature.sql` and your teammate also creates `005_other_feature.sql`, one of you should rename to `006_other_feature.sql`
2. **Communicate**: When creating migrations, coordinate with your team to avoid number conflicts
3. **Git will handle it**: Since migrations are text files (SQL), Git can merge them if they affect different tables

## Current Migrations

- `001_initial_schema.sql` - Creates all base tables (menu_items, art_items, workshops, orders, trending_items_7d)
- `002_add_menu_items_columns.sql` - Adds contextual recommendation columns to menu_items
- `003_add_art_items_columns.sql` - Adds extended columns to art_items
- `004_add_orders_payment_columns.sql` - Adds payment-related columns to orders

## Troubleshooting

**Migration fails with "duplicate column name"**: This is normal if the column already exists. The migration system ignores these errors to allow idempotent migrations.

**Migration doesn't run**: Check that:
1. The file is named correctly (`NNN_name.sql`)
2. The file is in `server/migrations/` directory
3. You're running migrations from the `server/` directory

**Need to rollback a migration**: SQLite doesn't support rolling back DDL (schema) changes easily. If you need to undo a migration, create a new migration that reverses the changes.

