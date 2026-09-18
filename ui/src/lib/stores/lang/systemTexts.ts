import { createLangStore } from "$lib/stores/lang/definition";

export const texts = createLangStore({
    overview: { PT: "Estado do sistema", EN: "System overview" },
    cpu: { PT: "Utilização do CPU", EN: "CPU usage" },
    ram: { PT: "Utilização da RAM", EN: "RAM usage" },
    disk: { PT: "Espaço em disco", EN: "Disk space" },
    temperature: { PT: "Temperatura do CPU", EN: "CPU temperature" },
    uptime: { PT: "Tempo de atividade", EN: "Uptime" },
    diskRead: { PT: "Leitura do disco", EN: "Disk read speed" },
    diskWrite: { PT: "Escrita do disco", EN: "Disk write speed" },
    live: { PT: "Em direto", EN: "Live" },
    loading: { PT: "A carregar…", EN: "Loading…" },
    stale: { PT: "Sem atualizações", EN: "Updates interrupted" },
    unavailable: { PT: "Indisponível", EN: "Unavailable" },
    history: { PT: "Últimas 60 amostras · intervalo de 1 s", EN: "Last 60 samples · 1 s interval" },
    secondsAgo: { PT: "Segundos antes da última amostra", EN: "Seconds before latest sample" },
    used: { PT: "utilizados", EN: "used" },
    boot: { PT: "Arranque", EN: "Booted" },
});
