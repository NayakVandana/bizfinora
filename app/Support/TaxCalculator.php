<?php

namespace App\Support;

class TaxCalculator
{
    /**
     * @param  list<array{quantity?: float|int, unit_price?: float|int}>  $items
     */
    public static function grossLineSubtotal(array $items): float
    {
        $sum = 0.0;

        foreach ($items as $item) {
            $qty = max(0, (float) ($item['quantity'] ?? 0));
            $price = max(0, (float) ($item['unit_price'] ?? 0));
            $sum += round($qty * $price, 2);
        }

        return round($sum, 2);
    }

    /**
     * @param  list<array{quantity: float|int, unit_price: float|int, tax_rate?: float|int|null}>  $items
     * @return array{
     *   subtotal: float,
     *   tax_amount: float,
     *   total: float,
     *   discount_amount: float,
     *   line_totals: list<float>,
     *   tax_breakdown: list<array{rate: float, label: string, taxable: float, tax: float}>
     * }
     */
    public static function calculate(
        array $items,
        float $invoiceTaxRate = 0,
        string $taxType = 'vat',
        float $discountAmount = 0,
        string $calculationMode = 'exclusive',
        bool $taxPerLine = false,
        string $taxLabel = 'Tax',
    ): array {
        if ($taxType === 'none') {
            $invoiceTaxRate = 0;
        }

        $discountAmount = max(0, round($discountAmount, 2));
        $lineTotals = [];
        $lineNetExTax = [];
        $lineTaxes = [];
        $subtotal = 0.0;
        $taxAmount = 0.0;

        foreach ($items as $item) {
            $qty = max(0, (float) ($item['quantity'] ?? 0));
            $price = max(0, (float) ($item['unit_price'] ?? 0));
            $lineGross = round($qty * $price, 2);
            $lineTotals[] = $lineGross;

            $rate = $taxPerLine && isset($item['tax_rate']) && $item['tax_rate'] !== null
                ? max(0, (float) $item['tax_rate'])
                : max(0, $invoiceTaxRate);

            if ($taxType === 'none' || $rate <= 0) {
                $lineNetExTax[] = $lineGross;
                $lineTaxes[] = 0.0;

                continue;
            }

            if ($calculationMode === 'inclusive') {
                $tax = round($lineGross * ($rate / (100 + $rate)), 2);
                $net = round($lineGross - $tax, 2);
            } else {
                $net = $lineGross;
                $tax = round($net * ($rate / 100), 2);
            }

            $lineNetExTax[] = $net;
            $lineTaxes[] = $tax;
        }

        $grossSubtotal = round(array_sum($lineTotals), 2);
        $preDiscountNet = round(array_sum($lineNetExTax), 2);
        $preDiscountTax = round(array_sum($lineTaxes), 2);
        $appliedDiscount = min($discountAmount, $grossSubtotal);
        $taxAmount = $preDiscountTax;
        $subtotal = $grossSubtotal;

        if (! $taxPerLine && $taxType !== 'none' && $invoiceTaxRate > 0) {
            $taxableGross = max(0, round($grossSubtotal - $appliedDiscount, 2));

            if ($calculationMode === 'inclusive') {
                $taxAmount = round($taxableGross * ($invoiceTaxRate / (100 + $invoiceTaxRate)), 2);
                $total = $taxableGross;
            } else {
                $taxAmount = round($taxableGross * ($invoiceTaxRate / 100), 2);
                $total = round($taxableGross + $taxAmount, 2);
            }
        } elseif ($appliedDiscount > 0 && $grossSubtotal > 0) {
            $ratio = ($grossSubtotal - $appliedDiscount) / $grossSubtotal;
            $taxAmount = round($preDiscountTax * $ratio, 2);

            if ($calculationMode === 'inclusive') {
                $total = round($grossSubtotal - $appliedDiscount, 2);
            } else {
                $netAfter = round($preDiscountNet - min($appliedDiscount, $preDiscountNet), 2);
                $total = round($netAfter + $taxAmount, 2);
            }
        } else {
            if ($calculationMode === 'inclusive' && $taxType !== 'none') {
                $total = $grossSubtotal;
            } else {
                $total = round($preDiscountNet + $preDiscountTax, 2);
            }
        }

        $taxBreakdown = self::buildBreakdown($items, $lineNetExTax, $lineTaxes, $taxPerLine, $invoiceTaxRate, $taxLabel, $taxType);

        return [
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'discount_amount' => $appliedDiscount,
            'line_totals' => $lineTotals,
            'tax_breakdown' => $taxBreakdown,
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @param  list<float>  $lineNetExTax
     * @param  list<float>  $lineTaxes
     * @return list<array{rate: float, label: string, taxable: float, tax: float}>
     */
    private static function buildBreakdown(
        array $items,
        array $lineNetExTax,
        array $lineTaxes,
        bool $taxPerLine,
        float $invoiceTaxRate,
        string $taxLabel,
        string $taxType,
    ): array {
        if ($taxType === 'none') {
            return [];
        }

        $groups = [];

        foreach ($items as $index => $item) {
            $tax = $lineTaxes[$index] ?? 0;
            if ($tax <= 0) {
                continue;
            }

            $rate = $taxPerLine && isset($item['tax_rate']) && $item['tax_rate'] !== null
                ? (float) $item['tax_rate']
                : $invoiceTaxRate;
            $key = (string) $rate;

            if (! isset($groups[$key])) {
                $groups[$key] = ['rate' => $rate, 'label' => $taxLabel, 'taxable' => 0.0, 'tax' => 0.0];
            }

            $groups[$key]['taxable'] += $lineNetExTax[$index] ?? 0;
            $groups[$key]['tax'] += $tax;
        }

        return array_values(array_map(function (array $row) {
            $row['taxable'] = round($row['taxable'], 2);
            $row['tax'] = round($row['tax'], 2);

            return $row;
        }, $groups));
    }
}
