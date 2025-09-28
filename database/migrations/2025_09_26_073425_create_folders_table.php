<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tworzymy tabelę folders
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('folders')
                  ->onDelete('cascade');
            $table->timestamps();
        });

        // Dodajemy folder_id do tabeli user_files
        Schema::table('user_files', function (Blueprint $table) {
            $table->foreignId('folder_id')
                  ->nullable()
                  ->after('user_id')
                  ->constrained('folders')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Najpierw usuwamy kolumnę folder_id z user_files
        Schema::table('user_files', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });

        // Następnie drop tabeli folders
        Schema::dropIfExists('folders');
    }
};