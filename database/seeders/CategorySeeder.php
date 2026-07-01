<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['id' => 1, 'name' => 'Makanan & Minuman'],
            ['id' => 2, 'name' => 'Transportasi & Bensin'],
            ['id' => 3, 'name' => 'Belanja & Kebutuhan Bulanan'],
            ['id' => 4, 'name' => 'Hiburan & Gaya Hidup'],
            ['id' => 5, 'name' => 'Lain-lain'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['id' => $cat['id']],
                [
                    'name' => $cat['name'],
                    'slug' => Str::slug($cat['name']),
                ]
            );
        }
    }
}
