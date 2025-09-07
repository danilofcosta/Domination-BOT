"""
Sistema de logging para o bot Domination
"""
import logging
import sys
from pathlib import Path

# Configurar logger principal
def setup_logger(name: str = "domination", level: int = logging.INFO) -> logging.Logger:
    """Configura e retorna um logger"""
    
    # Criar logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Evitar duplicação de handlers
    if logger.handlers:
        return logger
    
    # Formato das mensagens
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    
    # Handler para console
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Handler para arquivo (logs/)
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    file_handler = logging.FileHandler(log_dir / f"{name}.log", encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger

# Logger principal
logger = setup_logger()

# Loggers específicos por módulo
def get_module_logger(module_name: str) -> logging.Logger:
    """Retorna logger específico para um módulo"""
    return logging.getLogger(f"domination.{module_name}")

# Funções de conveniência
def log_info(message: str, module: str = "main"):
    """Log de informação"""
    get_module_logger(module).info(message)

def log_error(message: str, module: str = "main", exc_info: bool = False):
    """Log de erro"""
    get_module_logger(module).error(message, exc_info=exc_info)

def log_debug(message: str, module: str = "main"):
    """Log de debug"""
    get_module_logger(module).debug(message)

def log_warning(message: str, module: str = "main"):
    """Log de aviso"""
    get_module_logger(module).warning(message)

