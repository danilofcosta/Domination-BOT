// Constantes usadas em middlewares e outras partes do código

// Configurações para o rate limiter (limitação de mensagens por usuário por segundo)
export const TIMEFAME = 1000; // 1 segundo
export const LIMIT = 15; // Limite de 15 mensagens por segundo

// Duração do bloqueio em milissegundos (15 minutos)
export const BLOCK_DURATION_MS = 15 * 60 * 1000;

// Limite diário de capturas por usuário
export const DAILY_LIMIT = 50;

// Configurações para o sistema de drop de personagens
export const DROP = 100;
// O UNDROP é o número de mensagens após o DROP em que o drop deve ser resetado
export const UNDROP = DROP + 40;
