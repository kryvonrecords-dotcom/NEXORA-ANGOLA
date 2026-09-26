import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  Download,
  CalendarDays,
  TrendingUp,
  Users,
  Globe2,
  Package,
  MonitorSmartphone,
  Link2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';

interface CountItem {
  name: string;
  count: number;
}

interface DailyItem {
  date: string;
  count: number;
}

interface AppDownloadStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  uniqueDevices: number;
  countries: CountItem[];
  versions: CountItem[];
  platforms: CountItem[];
  sources: CountItem[];
  daily: DailyItem[];
}

interface Props {
  onNavigate?: (path: string) => void;
}

export function AdminAppStats({ onNavigate }: Props) {
  const [stats, setStats] = useState<AppDownloadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStats = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await api.getAdminAppDownloadStats();
      setStats(data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas do aplicativo:', err);
      setError(
        err?.message ||
        'Não foi possível carregar as estatísticas do aplicativo.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const maxDaily = Math.max(
    ...(stats?.daily || []).map(item => item.count),
    1
  );

  const formatDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    return parsed.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const statCards = stats
    ? [
        {
          label: 'Total de instalações',
          value: stats.total,
          icon: Download,
          description: 'Total registrado'
        },
        {
          label: 'Hoje',
          value: stats.today,
          icon: CalendarDays,
          description: 'Instalações hoje'
        },
        {
          label: 'Últimos 7 dias',
          value: stats.last7Days,
          icon: TrendingUp,
          description: 'Últimos 7 dias'
        },
        {
          label: 'Últimos 30 dias',
          value: stats.last30Days,
          icon: Smartphone,
          description: 'Últimos 30 dias'
        },
        {
          label: 'Dispositivos únicos',
          value: stats.uniqueDevices,
          icon: Users,
          description: 'IDs únicos registrados'
        }
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando estatísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
        <p className="text-red-600 font-medium mb-4">{error}</p>

        <button
          onClick={() => loadStats(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FDECEF] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-[#A50D1F]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Estatísticas do Aplicativo
              </h1>
              <p className="text-sm text-gray-100">
                Instalações e utilização registrada do NEXORA ANGOLA
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 bg-white text-white hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-100">{card.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {card.value.toLocaleString('pt-AO')}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <p className="text-xs text-gray-300 mt-3">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Instalações nos últimos 30 dias
          </h2>
          <p className="text-sm text-gray-100">
            Evolução diária das instalações registradas
          </p>
        </div>

        <div className="h-64 flex items-end gap-1 sm:gap-2 overflow-x-auto pb-8">
          {(stats?.daily || []).map((item) => {
            const height =
              item.count > 0
                ? Math.max((item.count / maxDaily) * 100, 6)
                : 2;

            return (
              <div
                key={item.date}
                className="min-w-[24px] flex-1 h-full flex flex-col justify-end items-center gap-2"
                title={`${formatDate(item.date)}: ${item.count} instalação(ões)`}
              >
                <div className="text-[10px] text-gray-100">
                  {item.count > 0 ? item.count : ''}
                </div>

                <div
                  className="w-full max-w-[34px] bg-[#A50D1F] rounded-t-md hover:bg-[#A50D1F] transition-colors"
                  style={{ height: `${height}%` }}
                />

                <div className="text-[9px] text-gray-300 whitespace-nowrap">
                  {formatDate(item.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsList
          title="Países"
          icon={Globe2}
          items={stats?.countries || []}
          emptyText="Nenhum país registrado."
        />

        <StatsList
          title="Versões do aplicativo"
          icon={Package}
          items={stats?.versions || []}
          emptyText="Nenhuma versão registrada."
        />

        <StatsList
          title="Plataformas"
          icon={MonitorSmartphone}
          items={stats?.platforms || []}
          emptyText="Nenhuma plataforma registrada."
        />

        <StatsList
          title="Origem das instalações"
          icon={Link2}
          items={stats?.sources || []}
          emptyText="Nenhuma origem registrada."
        />
      </div>
    </div>
  );
}

interface StatsListProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: CountItem[];
  emptyText: string;
}

function StatsList({
  title,
  icon: Icon,
  items,
  emptyText
}: StatsListProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-100">
            {total.toLocaleString('pt-AO')} registros
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-300">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 8).map((item) => {
            const percentage =
              total > 0 ? (item.count / total) * 100 : 0;

            return (
              <div key={item.name}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-sm text-white truncate">
                    {item.name}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.count.toLocaleString('pt-AO')}
                  </span>
                </div>

                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A50D1F] rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminAppStats;
