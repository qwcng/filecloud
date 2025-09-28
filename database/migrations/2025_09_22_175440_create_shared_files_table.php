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
        

    Schema::create('shared_files', function (Blueprint $table) {
        $table->id();
        $table->foreignId('file_id')->constrained('user_files')->onDelete('cascade');
        $table->string('access_code', 6);
        $table->boolean('active')->default(true);
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shared_files');
    }
};