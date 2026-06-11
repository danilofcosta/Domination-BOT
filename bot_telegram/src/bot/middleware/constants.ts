// Constantes usadas em middlewares e outras partes do código
export const GROUP_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

export const CAPTURE_LOCK_TIMEOUT_MS = 10000;
export const DELETE_TIMEOUT_MS = 60000;
export const PRISMA_TIMEOUT_MS = 10000;
export const UPLOAD_TIMEOUT_MS = 10000;
export const INLINE_QUERY_TIMEOUT_MS = 2500;


export const DELETE_AFTER_DROP_MS = 120000;

// Limite diário de capturas por usuário

export const DAILY_LIMIT = 50;

// Configurações para o rate limiter (limitação de mensagens por usuário por segundo)
export const TIMEFAME = 1000; // 1 segundo
export const LIMIT = 15; // Limite de 15 mensagens por segundo

// Duração do bloqueio em milissegundos (15 minutos)
export const BLOCK_DURATION_MS = 15 * 60 * 1000;



// Configurações para o sistema de drop de personagens

export const DROP = 100;
// O UNDROP é o número de mensagens após o DROP em que o drop deve ser resetado
export const UNDROP = DROP + 40;
