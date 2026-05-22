<?php

namespace App\Support\Migrations;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
class AppMigrationRegistry
{
    public const PREFIX = '2026_01_01_';

    public const README_START = '<!-- APP_MIGRATIONS_START -->';

    public const README_END = '<!-- APP_MIGRATIONS_END -->';

    public function __construct(private readonly Filesystem $files) {}

    /**
     * @return list<AppMigrationRecord>
     */
    public function all(): array
    {
        $records = [];

        foreach ($this->migrationPaths() as $path) {
            $records[] = $this->parseFile($path);
        }

        usort($records, fn (AppMigrationRecord $a, AppMigrationRecord $b) => $a->sequence <=> $b->sequence);

        return $records;
    }

    public function nextSequence(): string
    {
        $max = 9;

        foreach ($this->all() as $record) {
            $max = max($max, (int) $record->sequence);
        }

        return str_pad((string) ($max + 1), 6, '0', STR_PAD_LEFT);
    }

    /**
     * @return list<array{record: AppMigrationRecord, issues: list<string>}>
     */
    public function check(): array
    {
        $results = [];

        foreach ($this->all() as $record) {
            $issues = $this->issuesFor($record);
            if ($issues !== []) {
                $results[] = ['record' => $record, 'issues' => $issues];
            }
        }

        return $results;
    }

    /**
     * @return list<string>
     */
    public function ranMigrations(): array
    {
        if (! Schema::hasTable($this->migrationsTable())) {
            return [];
        }

        return DB::table($this->migrationsTable())
            ->orderBy('id')
            ->pluck('migration')
            ->all();
    }

    public function readmeTableMarkdown(): string
    {
        $lines = [
            '| # | Migration file | `up()` | `down()` |',
            '|---|----------------|--------|----------|',
        ];

        foreach ($this->all() as $record) {
            $short = (int) $record->sequence;
            $lines[] = sprintf(
                '| %03d | `%s` | %s | %s |',
                $short,
                $record->slug,
                $record->upSummary,
                $record->downSummary,
            );
        }

        return implode("\n", $lines);
    }

    public function syncReadme(): bool
    {
        $readmePath = database_path('README.md');

        if (! $this->files->exists($readmePath)) {
            return false;
        }

        $contents = $this->files->get($readmePath);
        $table = $this->readmeTableMarkdown();
        $block = self::README_START."\n".$table."\n".self::README_END;

        if (str_contains($contents, self::README_START) && str_contains($contents, self::README_END)) {
            $pattern = '/'.preg_quote(self::README_START, '/').'.*?'.preg_quote(self::README_END, '/').'/s';
            $updated = preg_replace($pattern, $block, $contents, 1);
        } else {
            $marker = "### Bizfinora (`2026_01_01_*`)";
            $pos = strpos($contents, $marker);

            if ($pos === false) {
                return false;
            }

            $after = strpos($contents, "\n---\n", $pos);
            $insertAt = $after !== false ? $after : strlen($contents);
            $updated = substr_replace($contents, "\n\n".$block."\n", $insertAt, 0);
        }

        $this->files->put($readmePath, $updated);

        return true;
    }

    /**
     * @return list<string>
     */
    private function migrationPaths(): array
    {
        $paths = glob(database_path('migrations/'.self::PREFIX.'*.php')) ?: [];

        sort($paths);

        return $paths;
    }

    private function parseFile(string $path): AppMigrationRecord
    {
        $basename = basename($path, '.php');
        preg_match('/^2026_01_01_(\d+)_(.+)$/', $basename, $matches);

        $sequence = $matches[1] ?? '000000';
        $slug = $matches[2] ?? $basename;
        $contents = $this->files->get($path);

        $type = str_starts_with($slug, 'create_') ? 'create' : 'alter';
        $table = $this->tableFromContents($contents, $slug, $type);

        return new AppMigrationRecord(
            file: $basename,
            path: $path,
            sequence: $sequence,
            slug: $slug,
            type: $type,
            table: $table,
            upSummary: $this->upSummary($type, $table),
            downSummary: $this->downSummary($contents, $type, $table),
            contents: $contents,
        );
    }

    private function tableFromContents(string $contents, string $slug, string $type): string
    {
        if ($type === 'create' && preg_match("/Schema::create\(\s*['\"]([^'\"]+)['\"]/", $contents, $m)) {
            return $m[1];
        }

        if ($type === 'alter' && preg_match("/Schema::table\(\s*['\"]([^'\"]+)['\"]/", $contents, $m)) {
            return $m[1];
        }

        if (preg_match('/^create_(.+)_table$/', $slug, $m)) {
            return $m[1];
        }

        if (preg_match('/^add_.+_to_(.+)_table$/', $slug, $m)) {
            return $m[1];
        }

        return '?';
    }

    private function upSummary(string $type, string $table): string
    {
        return $type === 'create'
            ? "creates `{$table}`"
            : "changes `{$table}`";
    }

    private function downSummary(string $contents, string $type, string $table): string
    {
        if ($type === 'create') {
            return "drops `{$table}`";
        }

        if (preg_match_all("/dropColumn\(\s*['\"]([^'\"]+)['\"]/", $contents, $m)) {
            $cols = implode(', ', array_map(fn ($c) => '`'.$c.'`', $m[1]));

            return "removes {$cols} on `{$table}`";
        }

        return "reverts `{$table}`";
    }

    /**
     * @return list<string>
     */
    private function issuesFor(AppMigrationRecord $record): array
    {
        $issues = [];
        $c = $record->contents;

        if (! str_starts_with($record->slug, 'create_') && ! str_starts_with($record->slug, 'add_')) {
            $issues[] = 'Filename should start with create_ or add_.';
        }

        if (str_contains($c, '->constrained(')) {
            $issues[] = 'Remove ->constrained() (use foreignId() only).';
        }

        if (str_contains($c, 'dropConstrainedForeignId')) {
            $issues[] = 'Use dropColumn() instead of dropConstrainedForeignId().';
        }

        if (preg_match('/foreignId\([^)]+\)->(?:cascade|null)OnDelete/', $c)) {
            $issues[] = 'Remove cascadeOnDelete() / nullOnDelete() on foreignId().';
        }

        if ($record->type === 'create' && ! str_contains($c, 'Schema::create')) {
            $issues[] = 'Create migration should use Schema::create in up().';
        }

        if ($record->type === 'alter' && ! str_contains($c, 'Schema::table')) {
            $issues[] = 'Alter migration should use Schema::table in up().';
        }

        if ($record->type === 'create' && ! str_contains($c, 'dropIfExists')) {
            $issues[] = 'Create migration down() should use Schema::dropIfExists().';
        }

        if ($record->table === '?') {
            $issues[] = 'Could not detect table name from file.';
        }

        return $issues;
    }

    private function migrationsTable(): string
    {
        return config('database.migrations.table', 'migrations');
    }
}
