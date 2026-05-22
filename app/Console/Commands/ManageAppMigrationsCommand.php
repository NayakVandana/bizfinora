<?php

namespace App\Console\Commands;

use App\Support\Migrations\AppMigrationRegistry;
use Illuminate\Console\Command;

class ManageAppMigrationsCommand extends Command
{
    protected $signature = 'app-migrations
                            {action=list : list, check, or sync-readme}
                            {--sync-readme : After check, update database/README.md when clean}';

    protected $description = 'List, validate, and sync README for existing 2026_01_01_* migrations';

    public function __construct(private readonly AppMigrationRegistry $registry)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        return match ($this->argument('action')) {
            'list' => $this->listMigrations(),
            'check' => $this->checkMigrations(),
            'sync-readme' => $this->syncReadme(),
            default => $this->invalidAction(),
        };
    }

    private function listMigrations(): int
    {
        $ran = array_flip($this->registry->ranMigrations());
        $rows = [];

        foreach ($this->registry->all() as $record) {
            $rows[] = [
                $record->sequence,
                $record->slug,
                $record->table,
                $record->type,
                isset($ran[$record->file]) ? 'yes' : 'no',
            ];
        }

        $this->components->info('Bizfinora app migrations (2026_01_01_*)');
        $this->table(['#', 'File', 'Table', 'Type', 'Ran'], $rows);
        $this->newLine();
        $this->line('Next sequence: <fg=cyan>'.$this->registry->nextSequence().'</>');
        $this->line('Check: <fg=yellow>php artisan app-migrations check</>');
        $this->line('Sync README: <fg=yellow>php artisan app-migrations sync-readme</>');

        return self::SUCCESS;
    }

    private function checkMigrations(): int
    {
        $problems = $this->registry->check();

        if ($problems === []) {
            $this->components->info('All '.count($this->registry->all()).' app migrations follow project rules.');

            if ($this->option('sync-readme') || $this->confirm('Update database/README.md from disk?', true)) {
                $this->syncReadme(silent: true);
            }

            return self::SUCCESS;
        }

        $this->components->error(count($problems).' migration(s) need attention:');

        foreach ($problems as $item) {
            $record = $item['record'];
            $this->newLine();
            $this->line("<fg=red>{$record->file}</>");
            foreach ($item['issues'] as $issue) {
                $this->line("  • {$issue}");
            }
        }

        return self::FAILURE;
    }

    private function syncReadme(bool $silent = false): int
    {
        if (! $this->registry->syncReadme()) {
            $this->components->error('Could not update database/README.md (markers missing).');

            return self::FAILURE;
        }

        if (! $silent) {
            $this->components->info('database/README.md migration table synced from existing files.');
        }

        return self::SUCCESS;
    }

    private function invalidAction(): int
    {
        $this->components->error('Unknown action. Use: list, check, sync-readme');

        return self::FAILURE;
    }
}
