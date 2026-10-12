<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_a_non_cacheable_csrf_token(): void
    {
        $this->getJson('/csrf-token')
            ->assertOk()
            ->assertJsonStructure(['token'])
            ->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_it_saves_an_order_and_its_items_using_catalog_prices(): void
    {
        $response = $this->postJson('/orders', [
            'items' => [
                ['product_id' => 'latte', 'quantity' => 2, 'price' => 1],
                ['product_id' => 'croissant', 'quantity' => 1],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('total', 178)
            ->assertJsonPath('status', 'received');

        $this->assertDatabaseHas('orders', [
            'id' => $response->json('id'),
            'total' => 178,
            'status' => 'received',
        ]);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $response->json('id'),
            'product_id' => 'latte',
            'product_name' => 'Latte de la casa',
            'quantity' => 2,
            'unit_price' => 65,
            'subtotal' => 130,
        ]);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $response->json('id'),
            'product_id' => 'croissant',
            'quantity' => 1,
            'unit_price' => 48,
            'subtotal' => 48,
        ]);
    }

    public function test_it_rejects_empty_or_unknown_products_without_saving_an_order(): void
    {
        $this->postJson('/orders', ['items' => []])
            ->assertUnprocessable();

        $this->postJson('/orders', [
            'items' => [
                ['product_id' => 'invented-product', 'quantity' => 1],
            ],
        ])->assertUnprocessable();

        $this->assertDatabaseCount('orders', 0);
    }
}
