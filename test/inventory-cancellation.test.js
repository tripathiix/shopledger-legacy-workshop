'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

test('selling exactly all sellable stock is allowed', function () {
  var products = [
    { id: 1, name: 'Last unit', stock: 1, reserved: 0 },
    { id: 2, name: 'Last unreserved unit', stock: 4, reserved: 3 }
  ];

  assert.deepEqual(inventory.check(products, [
    { id: 1, qty: 1 },
    { id: 2, qty: 1 }
  ]), { ok: true });
});

test('cancelling an order restores its deducted quantities to product stock', function () {
  var product = { id: 7, name: 'Rice', stock: 8, reserved: 2 };
  var order = {
    id: 1007,
    status: 'pending',
    paymentMode: 'cash',
    items: [{ id: 7, qty: 2 }]
  };
  var db = { products: [product], orders: [order], customers: [] };

  var result = orders.cancel(db, order.id, 'Customer cancelled');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(product.stock, 10);
  assert.equal(product.reserved, 2);
});
