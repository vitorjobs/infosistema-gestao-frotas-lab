import { defineConfig } from 'vitepress';

function normalizeBase(value = '/'): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const base = normalizeBase(process.env.VITEPRESS_BASE);

const guideSidebar = [
  { text: 'Visão geral', link: '/guide/overview' },
  { text: 'Tecnologias', link: '/guide/technologies' },
  { text: 'Funcionalidades', link: '/guide/features' },
  { text: 'Docker', link: '/guide/docker-setup' },
  { text: 'Execução local', link: '/guide/local-setup' },
  { text: 'Ambiente e portas', link: '/guide/environment' },
  { text: 'API e Swagger', link: '/guide/api' },
  { text: 'Monitoramento', link: '/guide/monitoring' },
  { text: 'Banco de dados', link: '/guide/database' },
  { text: 'Testes', link: '/guide/tests' },
  { text: 'CI/CD', link: '/guide/cicd' },
  { text: 'Troubleshooting', link: '/guide/troubleshooting' },
];

const sidebar = [
  { text: 'Início', link: '/' },
  { text: 'Guia', items: guideSidebar },
];

export default defineConfig({
  title: 'Documentação - Projeto Gestão de Rotas',
  description: 'Documentação técnica do projeto de Gestão de Frota (Aivacol)',
  base,
  ignoreDeadLinks: [/^https?:\/\/localhost(:\d+)?/],
  themeConfig: {
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Guia', link: '/guide/overview' },
    ],
    sidebar: {
      '/': sidebar,
      '/guide/': sidebar,
    },
    footer: {
      message: 'Lançado sob a Licença MIT.',
    },
  },
});
