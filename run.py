# from api.app import app
import asyncio
import sys

from domination_telegram import bot


import os, logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)


if __name__ == "__main__":
   asyncio.run(bot.main())
