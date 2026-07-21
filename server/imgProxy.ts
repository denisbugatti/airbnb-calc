/**
 * imgProxy.ts — proxy de imagens externas para o gerador de PDF.
 *
 * O PDF é rasterizado via canvas (html-to-image): imagem de origem externa sem
 * CORS contamina o canvas e sai em branco. Este handler busca a imagem no
 * servidor e a devolve same-origin, com cache e CORS liberado.
 *
 * Usado nos dois runtimes: middleware do Vite em dev e rota Express em produção
 * (a assinatura (req, res) do http básico funciona em ambos).
 */
import type { IncomingMessage, ServerResponse } from "http";

const LIMITE_BYTES = 25 * 1024 * 1024;
// Guarda simples anti-SSRF: bloqueia alvos óbvios de rede interna.
const HOST_PRIVADO = /^(localhost$|127\.|0\.0\.0\.0$|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|\[::1\]$)/i;

export async function handleImgProxy(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const responder = (status: number, corpo: string) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(corpo);
  };

  let alvo: URL;
  try {
    const bruto = new URL(req.url ?? "/", "http://x").searchParams.get("url") ?? "";
    alvo = new URL(bruto);
  } catch {
    return responder(400, "Parâmetro url ausente ou inválido");
  }
  if (alvo.protocol !== "https:" && alvo.protocol !== "http:") return responder(400, "Só links http(s)");
  if (HOST_PRIVADO.test(alvo.hostname)) return responder(400, "Host não permitido");

  try {
    const buscar = () =>
      // Teto por tentativa: uma origem pendurada não pode segurar a conexão para
      // sempre, mas 30s dá margem para origens lentas (Drive, sites pesados).
      fetch(alvo, {
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
        headers: {
          // Alguns CDNs bloqueiam o user-agent padrão do Node
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5",
        },
      });
    // Uma nova tentativa cobre falha transitória/timeout da origem (comum quando
    // o gerador busca muitas fotos de uma vez).
    let resp: Response;
    try {
      resp = await buscar();
      if (!resp.ok) resp = await buscar();
    } catch {
      resp = await buscar();
    }
    if (!resp.ok) return responder(502, `A origem respondeu ${resp.status}`);

    const tipo = (resp.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!tipo.startsWith("image/")) {
      return responder(
        415,
        `O link não aponta para uma imagem (content-type: ${tipo || "desconhecido"}). ` +
          'Em links do Google Drive, confira se o arquivo está compartilhado como "qualquer pessoa com o link".',
      );
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.byteLength > LIMITE_BYTES) return responder(413, "Imagem acima de 25 MB");

    res.writeHead(200, {
      "Content-Type": tipo,
      "Content-Length": String(buf.byteLength),
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(buf);
  } catch {
    return responder(502, "Falha ao buscar a imagem na origem");
  }
}
