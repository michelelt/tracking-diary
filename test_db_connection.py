#!/usr/bin/env python3
"""
Test script per verificare la connessione al database Supabase.
Esegui con: python test_db_connection.py
"""

import os
import sys
from pathlib import Path

# Carica le variabili dal .env.local
def load_env(env_file=".env"):
    env_vars = {}
    if not Path(env_file).exists():
        print(f"❌ File {env_file} non trovato!")
        return env_vars

    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # Salta commenti e righe vuote
            if line.startswith("#") or not line:
                continue
            if "=" in line:
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip()

    return env_vars

# Testa la connessione
def test_connection(database_url):
    print("\n📊 Test Connessione Supabase\n")
    print(f"DATABASE_URL: {database_url[:50]}...")

    try:
        import psycopg2
        print("✅ psycopg2 importato")
    except ImportError:
        print("❌ psycopg2 non installato. Installa con: pip install psycopg2-binary")
        return False

    try:
        print("\n⏳ Connessione in corso...")
        conn = psycopg2.connect(database_url)
        print("✅ Connessione riuscita!")

        # Testa le tabelle
        cursor = conn.cursor()
        cursor.execute("""
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        """)
        tables = cursor.fetchall()

        print(f"\n📋 Tabelle nel database ({len(tables)} trovate):")
        for table in tables:
            print(f"   - {table[0]}")

        # Testa se ci sono utenti
        cursor.execute('SELECT COUNT(*) FROM "AllowedUser"')
        count = cursor.fetchone()[0]
        print(f"\n👥 Utenti in allowlist: {count}")

        if count > 0:
            cursor.execute('SELECT email FROM "AllowedUser"')
            emails = cursor.fetchall()
            print("   Email autorizzate:")
            for email in emails:
                print(f"   - {email[0]}")

        conn.close()
        print("\n✅ Tutto funziona!")
        return True

    except Exception as e:
        print(f"\n❌ Errore: {type(e).__name__}: {e}")
        print("\n💡 Possibili cause:")
        print("   1. DATABASE_URL non è corretto")
        print("   2. Password ha caratteri speciali non correttamente escapati")
        print("   3. Il database Supabase non è raggiungibile")
        print("   4. La password è sbagliata")
        return False

def main():
    print("=" * 60)
    print("🧪 TEST DATABASE URL - Supabase")
    print("=" * 60)

    # Carica variabili
    env = load_env()

    if not env:
        print("❌ Nessuna variabile di ambiente trovata")
        return False

    database_url = env.get("DATABASE_URL")

    if not database_url:
        print("❌ DATABASE_URL non trovato in .env.local")
        print("\nVariabili trovate:")
        for key in env:
            print(f"   - {key}")
        return False

    print(f"✅ DATABASE_URL trovato\n")

    # Testa connessione
    success = test_connection(database_url)

    print("\n" + "=" * 60)
    if success:
        print("✅ PRONTO PER PRISMA MIGRATE!")
        print("Esegui: npx prisma migrate dev --name init")
    else:
        print("❌ CONTROLLA LA CONNESSIONE PRIMA")
    print("=" * 60)

    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
