import type { Lancamento } from '@/types/lancamento'

export const lancamentosIniciais: Lancamento[] = [
  {
    id: 'r1',
    tipo: 'receita',
    dataEmissao: '2026-10-05',
    descricao: 'Salário mensal',
    valor: 5200,
  },
  {
    id: 'r2',
    tipo: 'receita',
    dataEmissao: '2026-10-12',
    descricao: 'Freelance UI design',
    valor: 950,
  },
  {
    id: 'r3',
    tipo: 'receita',
    dataEmissao: '2026-10-18',
    descricao: 'Reembolso de deslocamento',
    valor: 300,
  },
  {
    id: 'd1',
    tipo: 'despesa',
    dataEmissao: '2026-10-02',
    descricao: 'Aluguel e condomínio',
    valor: 1850,
    vencimento: '2026-10-10',
  },
  {
    id: 'd2',
    tipo: 'despesa',
    dataEmissao: '2026-10-08',
    descricao: 'Internet fibra',
    valor: 139,
    vencimento: '2026-10-15',
  },
  {
    id: 'd3',
    tipo: 'despesa',
    dataEmissao: '2026-10-14',
    descricao: 'Fatura cartão de crédito',
    valor: 1130.5,
    vencimento: '2026-10-25',
  },
]
