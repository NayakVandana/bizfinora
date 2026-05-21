<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Buyer extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'email',
        'phone',
        'tax_id',
        'tax_id_label',
        'address',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'account_number',
        'swift_bic',
        'notes',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
