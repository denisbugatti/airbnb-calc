/**
 * fotosPagina.ts — dado o link de uma PÁGINA (site da Vitacon, pasta do Google
 * Drive…), devolve todas as imagens encontradas nela, para o usuário escolher
 * quais entram no PDF.
 *
 * Três casos, resolvidos nesta ordem:
 *   1. O link já é uma imagem (content-type image/*) → devolve ele mesmo.
 *   2. Pasta pública do Google Drive → extrai os IDs dos arquivos do HTML e
 *      devolve o endpoint de thumbnail em alta (funciona sem autenticação para
 *      arquivos "qualquer pessoa com o link").
 *   3. Página HTML comum → varre <img src/srcset>, <source srcset>, og:image e
 *      background-image, absolutiza, deduplica e filtra ícones/logos óbvios.
 *
 * Usado nos dois runtimes, como o imgProxy: middleware do Vite em dev e rota
 * Express em produção.
 */
import type { IncomingMessage, ServerResponse } from "http";

const HOST_PRIVADO = /^(localhost$|127\.|0\.0\.0\.0$|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|\[::1\]$)/i;
const LIMITE_HTML = 6 * 1024 * 1024;
const MAX_FOTOS = 80;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// Ruído típico que não é foto de empreendimento
const RUIDO = /(logo|icon|favicon|sprite|placeholder|avatar|badge|selo|whatsapp|instagram|facebook|linkedin|youtube|arrow|seta|play-|loading|spinner|pixel|tracking|social-share|share-square|flags[.@]|_next\/static|\.svg(\?|$)|\.gif(\?|$)|data:)/i;
const EXT_IMG = /\.(jpe?g|png|webp|avif)(\?|$)/i;

/** Do srcset, fica com a candidata de maior largura. */
function maiorDoSrcset(srcset: string): string | null {
  let melhor: string | null = null;
  let melhorW = -1;
  for (const parte of srcset.split(",")) {
    const [url, desc] = parte.trim().split(/\s+/);
    if (!url) continue;
    const w = desc?.endsWith("w") ? parseInt(desc) : desc?.endsWith("x") ? parseFloat(desc) * 1000 : 0;
    if (w > melhorW) { melhorW = w; melhor = url; }
  }
  return melhor;
}

function extrairDeHtml(html: string, base: URL): string[] {
  const achadas = new Set<string>();
  const adicionar = (bruta: string | null | undefined) => {
    if (!bruta) return;
    const limpa = bruta.trim().replace(/&amp;/g, "&");
    if (!limpa || limpa.startsWith("data:")) return;
    try {
      let abs = new URL(limpa, base);
      // Otimizadores de imagem (Next.js e afins) embrulham o original em
      // ?url=… — desembrulha para ficar com a foto em resolução cheia e para
      // as variantes (w=640, w=1080…) deduplicarem num arquivo só.
      const interno = abs.searchParams.get("url");
      if (interno && /^https?:/i.test(interno)) abs = new URL(interno);
      const s = abs.toString();
      if (!/^https?:/i.test(s) || RUIDO.test(s)) return;
      achadas.add(s);
    } catch { /* URL inválida — ignora */ }
  };

  // <img src> e <img srcset>
  for (const m of Array.from(html.matchAll(/<img\b[^>]*>/gi))) {
    const tag = m[0];
    const srcset = tag.match(/srcset\s*=\s*["']([^"']+)["']/i)?.[1];
    if (srcset) adicionar(maiorDoSrcset(srcset));
    else adicionar(tag.match(/src\s*=\s*["']([^"']+)["']/i)?.[1]);
  }
  // <source srcset> (picture)
  for (const m of Array.from(html.matchAll(/<source\b[^>]*srcset\s*=\s*["']([^"']+)["'][^>]*>/gi))) {
    adicionar(maiorDoSrcset(m[1]));
  }
  // og:image / twitter:image
  for (const m of Array.from(html.matchAll(/<meta\b[^>]*(?:property|name)\s*=\s*["'](?:og:image|twitter:image)["'][^>]*content\s*=\s*["']([^"']+)["']/gi))) {
    adicionar(m[1]);
  }
  // background-image: url(...)
  for (const m of Array.from(html.matchAll(/background(?:-image)?\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/gi))) {
    adicionar(m[1]);
  }
  // Filtro final: só o que parece foto (extensão de imagem OU host de CDN de imagem)
  return Array.from(achadas).filter((u) => EXT_IMG.test(u) || /(images|img|uploads|media|cdn|photos|fotos)[./]/i.test(u));
}

function extrairDoDrive(html: string, idPasta: string): string[] {
  const ids = new Set<string>();
  // IDs do Drive: começam com 1, ~33 chars. Aparecem em data-id e em arrays JS.
  for (const m of Array.from(html.matchAll(/data-id\s*=\s*["'](1[\w-]{20,})["']/gi))) ids.add(m[1]);
  for (const m of Array.from(html.matchAll(/["'](1[\w-]{27,})["']/g))) ids.add(m[1]);
  ids.delete(idPasta);
  return Array.from(ids).slice(0, MAX_FOTOS).map(
    (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w2048`,
  );
}

export async function handleFotosPagina(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const responder = (status: number, corpo: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(corpo));
  };

  let alvo: URL;
  try {
    const bruto = new URL(req.url ?? "/", "http://x").searchParams.get("url") ?? "";
    alvo = new URL(bruto);
  } catch {
    return responder(400, { erro: "Parâmetro url ausente ou inválido" });
  }
  if (alvo.protocol !== "https:" && alvo.protocol !== "http:") return responder(400, { erro: "Só links http(s)" });
  if (HOST_PRIVADO.test(alvo.hostname)) return responder(400, { erro: "Host não permitido" });

  try {
    const resp = await fetch(alvo, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,image/*;q=0.8,*/*;q=0.5" },
    });
    if (!resp.ok) return responder(502, { erro: `A origem respondeu ${resp.status}` });

    const tipo = (resp.headers.get("content-type") ?? "").split(";")[0].trim();

    // Caso 1: o link já é a imagem
    if (tipo.startsWith("image/")) return responder(200, { fotos: [alvo.toString()] });

    if (!tipo.includes("html")) {
      return responder(415, { erro: `A página respondeu ${tipo || "tipo desconhecido"} — esperava HTML ou imagem` });
    }

    let html = await resp.text();
    if (html.length > LIMITE_HTML) html = html.slice(0, LIMITE_HTML);

    // Caso 2: pasta do Google Drive
    const pastaDrive = alvo.hostname === "drive.google.com" && alvo.pathname.match(/\/folders\/([\w-]+)/);
    if (pastaDrive) {
      const fotos = extrairDoDrive(html, pastaDrive[1]);
      if (fotos.length === 0) {
        return responder(404, {
          erro: 'Não achei arquivos na pasta. Confira se ela está compartilhada como "qualquer pessoa com o link".',
        });
      }
      return responder(200, { fotos });
    }

    // Caso 3: página comum
    const fotos = extrairDeHtml(html, alvo).slice(0, MAX_FOTOS);
    if (fotos.length === 0) return responder(404, { erro: "Não encontrei imagens nessa página." });
    return responder(200, { fotos });
  } catch {
    return responder(502, { erro: "Falha ao buscar a página na origem" });
  }
}
