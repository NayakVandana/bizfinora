<?php

namespace App\Support;

class IndianTaxIdValidator
{
    public static function messageForGst(mixed $gst): ?string
    {
        $gst = strtoupper(trim((string) $gst));

        if ($gst === '') {
            return null;
        }

        if (strlen($gst) !== 15) {
            return 'GSTIN must be exactly 15 characters.';
        }

        if (! preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/', $gst)) {
            return 'Enter a valid GSTIN.';
        }

        return null;
    }

    public static function messageForPan(mixed $pan): ?string
    {
        $pan = strtoupper(trim((string) $pan));

        if ($pan === '') {
            return null;
        }

        if (strlen($pan) !== 10) {
            return 'PAN must be exactly 10 characters.';
        }

        if (! preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]$/', $pan)) {
            return 'Enter a valid PAN (e.g. ABCDE1234F).';
        }

        return null;
    }
}
