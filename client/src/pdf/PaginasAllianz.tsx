/**
 * PaginasAllianz.tsx — slides já prontos do material da Vitacon.
 * Hoje: Allianz Parque e PUC-SP (Perdizes) + Belas Artes (Vila Mariana).
 *
 * Estes slides já vêm com o texto embutido na arte, então a página apenas exibe
 * a imagem em tela cheia — sem sobrepor manchete, régua de números ou logo, que
 * duplicariam o que já está lá.
 */

/** Slide pronto ocupando os 1920×1080 inteiros. */
function SlidePronto({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#000" }}>
      <img src={src} alt={alt} onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

export function PaginaAllianzAbertura() {
  return (
    <SlidePronto
      src="/pdf-assets/allianz-abertura.jpg"
      alt="Allianz Parque — principal arena multiuso da América Latina, atrai diversos públicos que buscam hospedagem de curta duração"
    />
  );
}

export function PaginaAllianzDemanda() {
  return (
    <SlidePronto
      src="/pdf-assets/allianz-demanda.jpg"
      alt="Demanda embarcada — o maior gerador de demanda da América Latina: +40 shows e eventos por ano, +45 jogos por temporada, +2,5 milhões de espectadores por ano"
    />
  );
}

export function PaginaAllianzProximidade() {
  return (
    <SlidePronto
      src="/pdf-assets/allianz-proximidade.jpg"
      alt="A 2 minutos a pé do Allianz Parque, a maior arena multiuso da América Latina"
    />
  );
}

export function PaginaPucPerdizes() {
  return (
    <SlidePronto
      src="/pdf-assets/puc-perdizes.jpg"
      alt="PUC-SP, a universidade privada mais bem avaliada do estado: 25 mil alunos de graduação e pós, mais de 65 cursos e 35 mil pessoas de movimentação diária no entorno"
    />
  );
}

export function PaginaSpExpoAbertura() {
  return (
    <SlidePronto
      src="/pdf-assets/sp-expo-abertura.jpg"
      alt="Vem aí São Paulo Expo — centro de exposições e convenções, com público chegando ao pavilhão iluminado"
    />
  );
}

export function PaginaSpExpoNumeros() {
  return (
    <SlidePronto
      src="/pdf-assets/sp-expo-numeros.jpg"
      alt="São Paulo Expo: mais de 90 eventos durante o ano, mais de 2,4 milhões de visitantes e mais de 18.000 expositores"
    />
  );
}

export function PaginaAfya() {
  return (
    <SlidePronto
      src="/pdf-assets/afya-vitacon.jpg"
      alt="Demanda embarcada — Afya Educação Médica e Vitacon powered by Housi: 38 unidades de graduação, mais de 20 mil alunos matriculados, mais de 22 mil estudantes de medicina, mais de 55 milhões de consultas por ano, mais de 100 mil funcionários pelo Brasil, desconto nas diárias e alta taxa de ocupação"
    />
  );
}

export function PaginaG4() {
  return (
    <SlidePronto
      src="/pdf-assets/g4-vitacon.jpg"
      alt="Demanda embarcada — G4 Educação e Vitacon powered by Housi: mais de 45 mil empresas participantes, mais de 20 mil gestores formados em cursos presenciais, alta taxa de ocupação e benefícios exclusivos para associados"
    />
  );
}

export function PaginaPerdizesPolo() {
  return (
    <SlidePronto
      src="/pdf-assets/perdizes-polo.jpg"
      alt="Perdizes, um polo de educação, saúde e lazer: PUC Campus Monte Alegre a 160 m, futura estação PUC-Cardoso de Almeida a 400 m, Faculdade Santa Marcelina a 685 m, Einstein Hospital Israelita a 600 m, Parque da Água Branca a 700 m, Colégio Pueri Domus a 770 m, Nubank Arena a 1,2 km e Bourbon Shopping a 1,5 km"
    />
  );
}

export function PaginaBelasArtes() {
  return (
    <SlidePronto
      src="/pdf-assets/belas-artes.jpg"
      alt="Centro Universitário Belas Artes, em Vila Mariana, desde 1925: 8 mil alunos de graduação e pós, mais de 65 cursos e 35 mil pessoas de movimentação diária no entorno"
    />
  );
}
