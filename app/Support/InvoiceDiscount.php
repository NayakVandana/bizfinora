<?php

namespace App\Support;

class InvoiceDiscount
{
    public const PERCENT_MAX = 60;

    /**
     * @param  list<array{quantity?: float|int, unit_price?: float|int}>  $items
     */
    public static function resolveAmount(array $items, float $percent = 0): float
    {
        $lineGross = TaxCalculator::grossLineSubtotal($items);
        $pct = min(self::PERCENT_MAX, max(0, round($percent, 2)));

        if ($pct <= 0 || $lineGross <= 0) {
            return 0.0;
        }

        return round($lineGross * ($pct / 100), 2);
    }

    public static function normalizePercent(float $value): float
    {
        return min(self::PERCENT_MAX, max(0, round($value, 2)));
    }
}
