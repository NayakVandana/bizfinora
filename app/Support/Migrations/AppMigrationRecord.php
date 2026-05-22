<?php

namespace App\Support\Migrations;

class AppMigrationRecord
{
    public function __construct(
        public readonly string $file,
        public readonly string $path,
        public readonly string $sequence,
        public readonly string $slug,
        public readonly string $type,
        public readonly string $table,
        public readonly string $upSummary,
        public readonly string $downSummary,
        public readonly string $contents,
    ) {}
}
