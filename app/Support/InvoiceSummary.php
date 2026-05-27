<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

class InvoiceSummary
{
    /**
     * @param  Builder<\App\Models\Invoice>  $query
     * @return array{
     *     total: int,
     *     all: array{count: int, amount: float},
     *     draft: array{count: int, amount: float},
     *     sent: array{count: int, amount: float},
     *     unpaid: array{count: int, amount: float},
     *     paid: array{count: int, amount: float},
     *     rejected: array{count: int, amount: float}
     * }
     */
    public static function fromQuery(Builder $query): array
    {
        $base = (clone $query)->reorder()->with([]);

        $byStatus = (clone $base)
            ->selectRaw('status, COUNT(*) as count, COALESCE(SUM(total), 0) as amount')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $count = fn (string $status): int => (int) ($byStatus->get($status)?->count ?? 0);
        $amount = fn (string $status): float => (float) ($byStatus->get($status)?->amount ?? 0);

        $totalCount = (clone $base)->count();
        $totalAmount = (float) (clone $base)->sum('total');

        return [
            'total' => $totalCount,
            'all' => ['count' => $totalCount, 'amount' => $totalAmount],
            'draft' => ['count' => $count('draft'), 'amount' => $amount('draft')],
            'sent' => ['count' => $count('sent'), 'amount' => $amount('sent')],
            'unpaid' => ['count' => $count('unpaid'), 'amount' => $amount('unpaid')],
            'paid' => ['count' => $count('paid'), 'amount' => $amount('paid')],
            'rejected' => ['count' => $count('rejected'), 'amount' => $amount('rejected')],
        ];
    }

    /**
     * @param  Builder<\App\Models\Invoice>  $query
     * @return array{
     *     invoices: array{total: int, draft: int, sent: int, unpaid: int, paid: int, rejected: int},
     *     amounts: array{draft: float, sent: float, unpaid: float, paid: float, rejected: float, all: float}
     * }
     */
    public static function forDashboard(Builder $query): array
    {
        $summary = self::fromQuery($query);

        return [
            'invoices' => [
                'total' => $summary['total'],
                'draft' => $summary['draft']['count'],
                'sent' => $summary['sent']['count'],
                'unpaid' => $summary['unpaid']['count'],
                'paid' => $summary['paid']['count'],
                'rejected' => $summary['rejected']['count'],
            ],
            'amounts' => [
                'draft' => $summary['draft']['amount'],
                'sent' => $summary['sent']['amount'],
                'unpaid' => $summary['unpaid']['amount'],
                'paid' => $summary['paid']['amount'],
                'rejected' => $summary['rejected']['amount'],
                'all' => $summary['all']['amount'],
            ],
        ];
    }
}
