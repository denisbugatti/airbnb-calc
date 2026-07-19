import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { handleImgProxy } from "./imgProxy";
import { handleFotosPagina } from "./fotosPagina";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Proxy de imagens externas do gerador de PDF (antes do catch-all de rotas)
  app.use("/api/img-proxy", (req, res) => {
    void handleImgProxy(req, res);
  });
  app.use("/api/fotos-pagina", (req, res) => {
    void handleFotosPagina(req, res);
  });

  // Assets e fontes têm hash/versão no nome — cache agressivo, como no nginx
  app.use(
    express.static(staticPath, {
      setHeaders(res, filePath) {
        if (/[/\\](assets|fonts)[/\\]/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
