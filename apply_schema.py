#!/usr/bin/env python3
"""
Applica lo schema SQL al database Supabase
"""

import os
from pathlib import Path

def load_env(env_file=".env"):
    env_vars = {}
    if not Path(env_file).exists():
        print(f"❌ File {env_file} non trovato!")
        return env_vars

    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or not line:
                continue
            if "=" in line:
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip()

    return env_vars

def apply_schema():
    # Carica variabili
    env = load_env()
    database_url = env.get("DATABASE_URL")

    if not database_url:
        print("❌ DATABASE_URL non trovato in .env")
        return False

    # Leggi il file SQL
    schema_file = Path("prisma/init_schema.sql")
    if not schema_file.exists():
        print(f"❌ File {schema_file} non trovato!")
        return False

    with open(schema_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    try:
        import psycopg2
    except ImportError:
        print("❌ psycopg2 non installato. Installa con: pip install psycopg2-binary")
        return False

    # Rimuovi i parametri Prisma non compatibili con psycopg2
    clean_url = database_url.split("?")[0]  # Rimuovi query params

    try:
        print("\n⏳ Connessione al database...")
        conn = psycopg2.connect(clean_url)
        cursor = conn.cursor()
        print("✅ Connessione riuscita!")

        print("\n⏳ Applicazione dello schema...")
        cursor.execute(sql_content)
        conn.commit()
        print("✅ Schema applicato con successo!")

        # Verifica le tabelle
        cursor.execute("""
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
            ORDER BY tablename
        """)
        tables = cursor.fetchall()

        print(f"\n📋 Tabelle create ({len(tables)}):")
        for table in tables:
            print(f"   - {table[0]}")

        conn.close()
        print("\n✅ PRONTO PER PRISMA!")
        return True

    except Exception as e:
        print(f"\n❌ Errore: {type(e).__name__}: {e}")
        return False

if __name__ == "__main__":
    import sys
    success = apply_schema()
    sys.exit(0 if success else 1)
