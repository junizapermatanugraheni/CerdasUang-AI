<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class GeminiService
{
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY') ?? $_ENV['GEMINI_API_KEY'] ?? null;

        if (!$this->apiKey) {
            throw new \Exception("API Key Gemini belum diatur di file .env kamu!");
        }
    }

    public function scanInvoice($imagePath)
    {
        try {
            // 1. Ambil file gambar dari storage
            if (!Storage::disk('public')->exists($imagePath)) {
                throw new \Exception("File nota tidak ditemukan di storage.");
            }

            // Ambil daftar semua kategori dari database secara dinamis
            $categories = \App\Models\Category::all();

            // Susun daftar kategori menjadi string untuk dimasukkan ke prompt
            $categoryListString = "";
            foreach ($categories as $cat) {
                $categoryListString .= "- ID {$cat->id}: {$cat->name}\n";
            }

            $fileContent = Storage::disk('public')->get($imagePath);
            $fullPath = storage_path('app/public/' . $imagePath);

            $imageData = base64_encode($fileContent);
            $mimeType = mime_content_type($fullPath);

            // 2. Siapkan instruksi (Prompt) yang dinamis dengan kategori dari database
            $prompt = "Kamu adalah sistem AI pemindai nota keuangan profesional. "
                . "Tolong analisis gambar nota/struk ini dan ekstrak informasi berikut dalam format JSON murni tanpa markdown, tanpa tulisan ```json.\n\n"
                . "Kamu harus mencocokkan nota ini ke dalam salah satu Kategori berikut (PILIH ID-NYA SAJA):\n"
                . $categoryListString . "\n"
                . "Format JSON harus tepat seperti ini: "
                . "{\"merchant_name\": \"Nama Toko/Vendor\", \"total_amount\": 150000, \"transaction_date\": \"YYYY-MM-DD\", \"category_id\": 1}.\n\n"
                . "Jika tanggal tidak terdeteksi, berikan null. Jika total nominal uang tidak terdeteksi, berikan 0. Jika kategori ragu-ragu atau tidak cocok dengan daftar di atas, berikan null.";

            // 3. Tembak API Gemini - URL SUDAH DIPERBAIKI
            $apiKeyClean = trim($this->apiKey);
            // KODE YANG BENAR (Bersih tanpa kurung atau teks ganda)
            $url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={$apiKeyClean}";
            $response = Http::timeout(60)->withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inlineData' => [
                                    'mimeType' => $mimeType,
                                    'data' => $imageData
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            // Jika HTTP request gagal (Termasuk Error 503 dari Google)
            if ($response->failed()) {
                throw new \Exception("Gemini API Error: " . $response->body());
            }

            // 4. Ambil teks hasil respon AI dan bersihkan dengan regex ketat
            $resultText = $response->json('candidates.0.content.parts.0.text');

            $cleanJson = trim($resultText);
            $cleanJson = preg_replace('/^```json\s*/i', '', $cleanJson); // Hapus pembuka ```json
            $cleanJson = preg_replace('/```$/', '', $cleanJson);        // Hapus penutup ```
            $cleanJson = trim($cleanJson);

            $result = json_decode($cleanJson, true);

            if (json_last_error() !== JSON_ERROR_NONE || !is_array($result)) {
                throw new \Exception("Format JSON dari AI rusak atau tidak valid.");
            }

            // Pastikan category_id bertipe integer atau null (menghindari error PostgreSQL)
            if (isset($result['category_id']) && $result['category_id'] !== 'null' && $result['category_id'] !== '') {
                $result['category_id'] = (int) $result['category_id'];
            } else {
                $result['category_id'] = null;
            }

            return $result;
        } catch (\Exception $e) {
            throw $e;

            // // Menangkap semua error (termasuk server Google penuh)
            // logger()->error('Gemini Scan Error: ' . $e->getMessage());
            // // Kembalikan data cadangan agar controller tidak error dan user bisa isi manual
            // return [
            //     'merchant_name' => 'Gagal scan otomatis (Server AI Sibuk)',
            //     'total_amount' => 0,
            //     'transaction_date' => now()->format('Y-m-d'),
            //     'category_id' => null,
            //     'is_failed' => true // Penanda untuk dibaca di controller
            // ];
        }
    }
}
