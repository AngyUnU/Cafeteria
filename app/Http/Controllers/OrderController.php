<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const CATALOG = [
        'latte' => ['name' => 'Latte de la casa', 'price' => 65],
        'mocha' => ['name' => 'Mocha nube', 'price' => 72],
        'cold-brew' => ['name' => 'Cold brew cítrico', 'price' => 68],
        'croissant' => ['name' => 'Croissant de mantequilla', 'price' => 48],
        'toast-aguacate' => ['name' => 'Toast de aguacate', 'price' => 89],
        'matcha' => ['name' => 'Matcha vainilla', 'price' => 76],
    ];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:6'],
            'items.*.product_id' => ['required', 'string', 'distinct', Rule::in(array_keys(self::CATALOG))],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $order = DB::transaction(function () use ($validated): Order {
            $items = collect($validated['items'])->map(function (array $item): array {
                $product = self::CATALOG[$item['product_id']];

                return [
                    'product_id' => $item['product_id'],
                    'product_name' => $product['name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $product['price'],
                    'subtotal' => $product['price'] * $item['quantity'],
                ];
            });

            $order = Order::create([
                'total' => $items->sum('subtotal'),
                'status' => 'received',
            ]);

            $order->items()->createMany($items->all());

            return $order;
        });

        return response()->json([
            'id' => $order->id,
            'total' => $order->total,
            'status' => $order->status,
            'message' => 'Tu pedido se guardó correctamente.',
        ], 201);
    }
}
