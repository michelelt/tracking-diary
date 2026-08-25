#!/usr/bin/env python3
"""Aggiungi un'email all'allowlist"""

import sys
from pathlib import Path

def load_env(env_file=".env"):
    env_vars = {}
    if not Path(env_file).exists():
        return env_vars
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or not line or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env_vars[key.strip()] = value.strip()
    return env_vars

def add_email(email):
    env = load_env()
    database_url = env.get("DATABASE_URL")

    if not database_url:
        print("❌ DATABASE_URL non trovato")
        return False

    # Rimuovi query params
    clean_url = database_url.split("?")[0]

    try:
        import psycopg2
        import uuid
    except ImportError:
        print("❌ Dipendenze mancanti. Installa: pip install psycopg2-binary")
        return False

    try:
        conn = psycopg2.connect(clean_url)
        cursor = conn.cursor()

        user_id = str(uuid.uuid4())
        cursor.execute(
            'INSERT INTO "AllowedUser" (id, email) VALUES (%s, %s)',
            (user_id, email)
        )
        conn.commit()

        print(f"✅ {email} aggiunto all'allowlist")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "michelecocca.mc@gmail.com"
    success = add_email(email)
    sys.exit(0 if success else 1)
