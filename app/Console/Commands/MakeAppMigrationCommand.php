<?php

namespace App\Console\Commands;

use App\Support\Migrations\AppMigrationRegistry;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;
use InvalidArgumentException;

class MakeAppMigrationCommand extends Command
{
    protected $signature = 'make:app-migration
                            {name : e.g. create_products_table or add_sku_to_products_table}
                            {--table= : Table name (inferred from name when omitted)}
                            {--no-sync-readme : Skip updating database/README.md}';

    protected $description = 'Create a Bizfinora migration (numbered prefix, no DB foreign keys)';

    public function __construct(
        private readonly Filesystem $files,
        private readonly AppMigrationRegistry $registry,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $name = Str::snake(trim($this->argument('name')));
        $table = $this->resolveTable($name);
        $isCreate = str_starts_with($name, 'create_') && str_ends_with($name, '_table');
        $isAlter = str_starts_with($name, 'add_') && str_contains($name, '_to_') && str_ends_with($name, '_table');

        if (! $isCreate && ! $isAlter) {
            $this->components->error(
                'Name must be create_{table}_table or add_{column}_to_{table}_table.',
            );

            return self::FAILURE;
        }

        $sequence = $this->registry->nextSequence();
        $fileName = "2026_01_01_{$sequence}_{$name}.php";
        $path = database_path('migrations/'.$fileName);

        if ($this->files->exists($path)) {
            $this->components->error("Migration already exists: {$fileName}");

            return self::FAILURE;
        }

        $stub = $isCreate ? 'migration.create.stub' : 'migration.update.stub';
        $contents = $this->buildFromStub($stub, $table);

        $this->files->put($path, $contents);
        $this->components->info("Migration created: database/migrations/{$fileName}");
        $this->line('  Table: <fg=cyan>'.$table.'</>');
        $this->line('  Use <fg=yellow>foreignId()</> for references — no ->constrained().');
        $this->line('  Then: <fg=yellow>php artisan migrate</> (or migrate:fresh on local)');

        if (! $this->option('no-sync-readme')) {
            $this->registry->syncReadme();
            $this->line('  <fg=green>database/README.md</> synced.');
        }

        return self::SUCCESS;
    }

    private function resolveTable(string $name): string
    {
        if ($this->option('table')) {
            return Str::snake($this->option('table'));
        }

        if (str_starts_with($name, 'create_') && str_ends_with($name, '_table')) {
            return Str::singular(substr($name, 7, -6));
        }

        if (preg_match('/^add_.+_to_(.+)_table$/', $name, $matches)) {
            return $matches[1];
        }

        throw new InvalidArgumentException('Could not infer table name; pass --table=');
    }

    private function buildFromStub(string $stub, string $table): string
    {
        $stubPath = base_path('stubs/'.$stub);

        if (! $this->files->exists($stubPath)) {
            throw new InvalidArgumentException("Stub not found: {$stubPath}");
        }

        return str_replace('{{ table }}', $table, $this->files->get($stubPath));
    }
}
