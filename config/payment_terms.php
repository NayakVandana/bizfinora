<?php

return [

    'presets' => [
        [
            'id' => 'net14',
            'label' => 'Net 14 days',
            'text' => 'Payment due within 14 days.',
        ],
        [
            'id' => 'net30',
            'label' => 'Net 30 days',
            'text' => 'Payment within 30 days of invoice date.',
            'invoice_types' => ['commercial', 'export', 'import'],
        ],
        [
            'id' => 'retainer',
            'label' => 'Retainer',
            'text' => 'Advance payment before work begins.',
            'invoice_types' => ['retainer'],
        ],
        [
            'id' => 'past_due',
            'label' => 'Past due',
            'text' => 'Overdue — please pay immediately.',
            'invoice_types' => ['past_due'],
        ],
        [
            'id' => 'receipt',
            'label' => 'Receipt / paid',
            'text' => 'Payment received. Thank you.',
            'invoice_types' => ['receipt'],
        ],
    ],

];
