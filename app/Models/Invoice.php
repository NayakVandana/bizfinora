<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Invoice extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'buyer_id',
        'invoice_number',
        'status',
        'issue_date',
        'due_date',
        'currency',
        'language',
        'template',
        'invoice_type',
        'tax_type',
        'tax_label',
        'tax_rate',
        'tax_calculation_mode',
        'tax_per_line',
        'subtotal',
        'tax_amount',
        'total',
        'share_token',
        'document',
        'date_of_service',
        'invoice_number_label',
        'date_format',
        'payment_method',
        'header_notes',
        'stripe_pay_url',
        'qr_code_data',
        'qr_code_description',
        'person_authorized_receive',
        'person_authorized_issue',
        'discount_amount',
        'vat_summary_visible',
        'field_visibility',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'date_of_service' => 'date',
            'discount_amount' => 'decimal:2',
            'vat_summary_visible' => 'boolean',
            'field_visibility' => 'array',
            'tax_rate' => 'decimal:4',
            'tax_per_line' => 'boolean',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'document' => 'array',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(InvoiceLineItem::class)->orderBy('sort_order');
    }

    public static function generateShareToken(): string
    {
        return Str::random(48);
    }

    public static function nextInvoiceNumber(int $companyId): string
    {
        $year = now()->format('Y');
        $prefix = "INV-{$year}-";
        $last = static::query()
            ->where('company_id', $companyId)
            ->where('invoice_number', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->value('invoice_number');

        $sequence = 1;
        if ($last !== null && preg_match('/-(\d+)$/', $last, $matches)) {
            $sequence = (int) $matches[1] + 1;
        }

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
