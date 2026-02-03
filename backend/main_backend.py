from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

import asyncio
import os
from dotenv import load_dotenv

from domination_telegram import Domination
from domination_telegram.enuns import GeneroEnum

#rotas
from backend.routes import users

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users.router)

templates = Jinja2Templates(directory=f"backend/templates")
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request, 
       
        "status": "Online"
    })
@app.get("/web", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request, 
       # "bots": running_bots.keys(),
        "status": "Online"
    })

@app.post("/send")
async def send_test_message(bot_name: str = Form(...), message: str = Form(...)):
    bot_obj = running_bots.get(bot_name)
    if bot_obj:
        chat_id = os.getenv('GROUP_TEST')
        await bot_obj.bot.send_message(chat_id=chat_id, text=f"[Painel Web]: {message}")
        return {"status": "Enviado com sucesso!"}
    return {"status": "Bot não encontrado"}