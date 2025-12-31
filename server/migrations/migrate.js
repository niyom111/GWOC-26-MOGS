import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// migrate.js is in server/migrations/, so go up one level to server/
const serverDir = dirname(__dirname);
const dbPath = join(serverDir, 'rabuste.db');
const migrationsDir = __dirname; // Current directory contains the migration SQL files

async function runMigrations() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        db.serialize(() => {
            // Create migrations tracking table
            db.run(`
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
            `, (err) => {
                if (err) {
                    db.close();
                    return reject(err);
                }

                // Get list of applied migrations
                db.all('SELECT version FROM schema_migrations ORDER BY version', (err, rows) => {
                    if (err) {
                        db.close();
                        return reject(err);
                    }

                    const appliedVersions = new Set((rows || []).map(m => m.version));

                    // Read migration files
                    const files = fs.readdirSync(migrationsDir)
                        .filter(f => f.endsWith('.sql'))
                        .filter(f => f.match(/^\d+_.*\.sql$/))
                        .sort((a, b) => {
                            const numA = parseInt(a.split('_')[0]);
                            const numB = parseInt(b.split('_')[0]);
                            return numA - numB;
                        });

                    console.log(`Found ${files.length} migration file(s)`);

                    // Process migrations sequentially
                    let index = 0;

                    function runNextMigration() {
                        if (index >= files.length) {
                            console.log('All migrations completed successfully!');
                            db.close();
                            return resolve();
                        }

                        const file = files[index];
                        const version = parseInt(file.split('_')[0]);
                        const name = file.replace(/^\d+_/, '').replace(/\.sql$/, '');

                        if (appliedVersions.has(version)) {
                            console.log(`Migration ${version} (${name}) already applied, skipping...`);
                            index++;
                            return runNextMigration();
                        }

                        console.log(`Running migration ${version}: ${name}...`);

                        const sql = fs.readFileSync(join(migrationsDir, file), 'utf8');

                        // SQLite doesn't support running multiple statements in one exec,
                        // so we split by semicolon and run each statement
                        const statements = sql
                            .split(';')
                            .map(s => s.trim())
                            .filter(s => s.length > 0 && !s.match(/^--/));

                        db.run('BEGIN TRANSACTION', (beginErr) => {
                            if (beginErr) {
                                db.close();
                                return reject(beginErr);
                            }

                            let stmtIndex = 0;

                            function runNextStatement() {
                                if (stmtIndex >= statements.length) {
                                    // All statements executed, record migration
                                    db.run(
                                        'INSERT INTO schema_migrations (version, name) VALUES (?, ?)',
                                        [version, name],
                                        (insertErr) => {
                                            if (insertErr) {
                                                db.run('ROLLBACK', () => {
                                                    db.close();
                                                    reject(insertErr);
                                                });
                                                return;
                                            }

                                            db.run('COMMIT', (commitErr) => {
                                                if (commitErr) {
                                                    db.close();
                                                    return reject(commitErr);
                                                }

                                                console.log(`✓ Migration ${version} (${name}) applied successfully`);
                                                appliedVersions.add(version);
                                                index++;
                                                runNextMigration();
                                            });
                                        }
                                    );
                                    return;
                                }

                                const statement = statements[stmtIndex];
                                if (!statement) {
                                    stmtIndex++;
                                    return runNextStatement();
                                }

                                db.run(statement, (runErr) => {
                                    if (runErr && !runErr.message.includes('duplicate column name')) {
                                        // Ignore "duplicate column name" errors (idempotent migrations)
                                        db.run('ROLLBACK', () => {
                                            db.close();
                                            reject(runErr);
                                        });
                                        return;
                                    }

                                    stmtIndex++;
                                    runNextStatement();
                                });
                            }

                            runNextStatement();
                        });
                    }

                    runNextMigration();
                });
            });
        });
    });
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('migrate.js')) {
    runMigrations().catch((err) => {
        console.error('Failed to run migrations:', err);
        process.exit(1);
    });
}

export { runMigrations };

