# Ideias de Design — Calculadora de Rentabilidade Airbnb

<response>
<text>
## Opção A: Dark Cosmos com Glow Azul (inspiração direta no Halo)

**Design Movement:** Dark Tech / Cosmic Minimalism — inspirado no Halo template com fundo preto profundo e halos de luz azul difusa.

**Core Principles:**
1. Fundo preto absoluto (#000) com blobs de luz azul-céu difusos como elemento de profundidade
2. Tipografia bold/black em branco puro para headings, cinza suave para labels
3. Cards translúcidos com bordas de 1px rgba(255,255,255,0.08) e backdrop-blur
4. Resultados em destaque com glow azul e números grandes

**Color Philosophy:** Preto como base de poder e sofisticação. Azul céu (#7DD3FC, #BAE6FD) como acento de confiança e tecnologia — a mesma linguagem do Halo. Verde esmeralda (#34D399) para indicadores positivos de rentabilidade.

**Layout Paradigm:** Tela única com scroll suave. Hero com título grande centralizado e blob de luz. Abaixo, layout assimétrico: painel de inputs à esquerda (40%) e resultados à direita (60%) em cards flutuantes.

**Signature Elements:**
1. Blob de luz azul difusa no background (idêntico ao Halo)
2. Cards com glassmorphism sutil (backdrop-blur + border translúcida)
3. Números de resultado em fonte grande com glow verde/azul

**Interaction Philosophy:** Sliders e inputs que atualizam resultados em tempo real com transições suaves. Hover em cards com leve elevação e border glow.

**Animation:** Fade-in ao carregar (0.6s ease-out), números animados ao calcular (contador), hover em cards (transform: translateY(-2px), border glow 0.3s).

**Typography System:** 
- Display: Geist ou Inter Black (800) para números grandes e headings
- Body: Inter Regular (400) para labels e descrições
- Accent: Mono para valores numéricos nos resultados
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Opção B: Editorial Escuro com Tipografia Expressiva

**Design Movement:** Dark Editorial — jornais financeiros premium em versão digital dark.

**Core Principles:**
1. Fundo quase-preto (#0A0A0A) com textura grain sutil
2. Tipografia serif bold para headings (Playfair Display), sans para dados
3. Linha divisória dourada (#D4AF37) como elemento de luxo
4. Grid editorial assimétrico

**Color Philosophy:** Preto editorial com dourado como acento de prestígio financeiro. Branco puro para dados críticos.

**Layout Paradigm:** Layout de duas colunas tipo jornal financeiro. Coluna esquerda estreita com inputs. Coluna direita larga com resultados em hierarquia editorial.

**Signature Elements:**
1. Linha dourada horizontal como separador de seções
2. Números em fonte serif bold com tamanho editorial
3. Badges de cenário fiscal (Bruto/Holding/PF) em estilo de tag de jornal

**Interaction Philosophy:** Inputs minimalistas sem bordas visíveis, apenas underline. Resultados com transição de fade.

**Animation:** Entrada suave dos elementos, números rolando ao calcular.

**Typography System:**
- Display: Playfair Display Bold para headings
- Data: Space Grotesk para números
- Labels: Inter Light para descrições
</text>
<probability>0.06</probability>
</response>

<response>
<text>
## Opção C: Neomorphism Dark com Gradientes Sutis

**Design Movement:** Dark Neomorphism — superfícies que parecem moldadas em material escuro.

**Core Principles:**
1. Fundo #111827 (gray-900) com sombras duplas para efeito neomorfo
2. Elementos que parecem pressionados ou elevados na superfície
3. Gradientes muito sutis de azul-escuro para preto
4. Inputs com efeito de "entalhe" na superfície

**Color Philosophy:** Cinza escuro como material base. Azul (#3B82F6) como acento de interação. Resultados em verde (#10B981).

**Layout Paradigm:** Card central único com seções internas. Wizard de 3 passos: Imóvel → Operação → Resultados.

**Signature Elements:**
1. Inputs com sombra interna (neomorfo)
2. Botões com sombra dupla (claro/escuro)
3. Gauge circular para rentabilidade

**Interaction Philosophy:** Feedback tátil visual em cada interação. Sliders com thumb grande e sombra.

**Animation:** Transição de passos com slide horizontal. Gauge animado ao calcular.

**Typography System:**
- Display: DM Sans Bold
- Body: DM Sans Regular
- Numbers: DM Mono
</text>
<probability>0.05</probability>
</response>

---

## Decisão: Opção A — Dark Cosmos com Glow Azul

A Opção A é a escolha ideal por replicar fielmente a identidade visual do Halo template (fundo preto + blob azul difuso + glassmorphism) enquanto adapta a linguagem para uma calculadora financeira premium. O glow azul cria profundidade sem distração, e os cards translúcidos organizam os dados de forma elegante.
