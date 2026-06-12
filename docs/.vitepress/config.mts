import { defineConfig } from 'vitepress';

function normalizeBase(value = '/'): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const base = normalizeBase(process.env.VITEPRESS_BASE);

const sidebar = [
  { text: 'Visão Geral', link: '/' },
  {
    text: 'Guia',
    items: [
      { text: '1. Executar o Projeto', link: '/getting-started/installation' },
      { text: '2. Configuração', link: '/getting-started/configuration' },
      { text: '3. Verificação de Portas', link: '/getting-started/ports' },
      { text: '4. Pontos de Acesso', link: '/getting-started/access' },
      { text: '5. Autenticação', link: '/usage/authentication' },
      { text: '6. Executar Testes', link: '/usage/testing' },
      { text: '7. Paginação', link: '/usage/pagination' },
      { text: '8. Checklist de Validação', link: '/usage/validation-checklist' },
    ],
  },
  {
    text: 'API',
    items: [
      { text: 'Autenticação', link: '/api/auth' },
      { text: 'Marcas', link: '/api/brands' },
      { text: 'Modelos', link: '/api/models' },
      { text: 'Veículos', link: '/api/vehicles' },
      { text: 'Usuários', link: '/api/users' },
    ],
  },
  {
    text: 'Arquitetura',
    items: [
      { text: 'Visão Geral', link: '/architecture/overview' },
      { text: 'Banco de Dados', link: '/architecture/database' },
      { text: 'Monitoramento', link: '/architecture/monitoring' },
      { text: 'CI/CD', link: '/architecture/cicd' },
    ],
  },
];

export default defineConfig({
  title: 'gestao_frotas_api',
  description: 'Documentação da API de Gestão de Frota',
  base,
  ignoreDeadLinks: [/^https?:\/\/localhost(:\d+)?/],
  themeConfig: {
    nav: [{ text: 'Início', link: '/' }],
    sidebar: {
      '/': sidebar,
      '/getting-started/': sidebar,
      '/usage/': sidebar,
      '/api/': sidebar,
      '/architecture/': sidebar,
    },
    footer: {
      message: 'Lançado sob a Licença MIT.',
    },
  },
});
