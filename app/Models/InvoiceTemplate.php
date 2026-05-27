<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InvoiceTemplate extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'company_id',
        'user_id',
        'name',
        'description',
        'base_invoice_type',
        'layout',
        'preset',
    ];

    protected function casts(): array
    {
        return [
            'preset' => 'array',
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
}
