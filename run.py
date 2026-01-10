# from api.app import app
import asyncio
import sys

from domination_telegram import bot


from dotenv import load_dotenv
import os, logging
load_dotenv()
logging.basicConfig(level=logging.INFO, stream=sys.stdout)


if __name__ == "__main__":
   asyncio.run(bot.main())
