<?php

return [
    'types' => [
        ['id' => 'none', 'label' => 'No tax', 'default_label' => '', 'default_rate' => 0],
        ['id' => 'vat', 'label' => 'VAT', 'default_label' => 'VAT', 'default_rate' => 20],
        ['id' => 'gst', 'label' => 'GST', 'default_label' => 'GST', 'default_rate' => 18],
        ['id' => 'sales_tax', 'label' => 'Sales tax', 'default_label' => 'Sales tax', 'default_rate' => 10],
        ['id' => 'custom', 'label' => 'Custom', 'default_label' => 'Tax', 'default_rate' => 0],
    ],

    'calculation_modes' => [
        ['id' => 'exclusive', 'label' => 'Tax exclusive (added on top of line amounts)'],
        ['id' => 'inclusive', 'label' => 'Tax inclusive (line amounts include tax)'],
    ],
];
