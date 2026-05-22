<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Company extends Model
{
    /** @use HasFactory<\Database\Factories\CompanyFactory> */
    use HasFactory;
    protected $fillable = [
        'name',
        'slug',
        'address',
        'city',
        'state',
        'postal_code',
        'tax_id',
        'tax_id_label',
        'email',
        'phone',
        'gst',
        'pan',
        'account_number',
        'swift_bic',
        'logo_data_url',
        'seller_notes',
        'default_tax_type',
        'default_tax_label',
        'default_tax_rate',
        'tax_calculation_mode',
        'tax_per_line',
        'default_invoice_template',
        'default_invoice_type',
        'default_custom_template_id',
    ];

    protected function casts(): array
    {
        return [
            'default_tax_rate' => 'decimal:4',
            'tax_per_line' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function buyers(): HasMany
    {
        return $this->hasMany(Buyer::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function invoiceTemplates(): HasMany
    {
        return $this->hasMany(InvoiceTemplate::class);
    }

    public static function uniqueSlugFromName(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (static::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
