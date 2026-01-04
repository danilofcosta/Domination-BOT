#!/usr/bin/env python3
try:
    from database.models import CharacterWaifu, CharacterHusbando, User, Event, Rarity
    print("[OK] All imports working")
except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
