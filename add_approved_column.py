#!/usr/bin/env python3
import psycopg2
from pathlib import Path

def load_env():
    env_vars = {}
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('#') or not line or '=' not in line:
                continue
            key, value = line.split('=', 1)
            env_vars[key.strip()] = value.strip()
    return env_vars

try:
    env = load_env()
    db_url = env.get('DATABASE_URL').split('?')[0]

    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()

    print("⏳ Adding 'approved' column to AllowedUser...")
    cursor.execute('''
        ALTER TABLE "AllowedUser"
        ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false
    ''')

    conn.commit()
    print("✅ Column added successfully!")
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
