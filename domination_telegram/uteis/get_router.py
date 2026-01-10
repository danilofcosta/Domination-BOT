from aiogram import Router


def getRouter(name: str = None):
    return   Router(name=name)