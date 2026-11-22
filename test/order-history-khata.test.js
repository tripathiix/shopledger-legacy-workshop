'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var orders = require('../lib/orders');
var ledger = require('../lib/ledger');

var sampleOrders = [
  { id: 1001, date: '28/12/2021', status: 'completed' },
  { id: 1004, date: '30/01/2022', status: 'completed' },
  { id: 1007, date: '04/03/2022', status: 'completed' },
  { id: 1008, date: '15/03/2022', status: 'completed' }
];

test('order history sorts DD/MM/YYYY dates newest first by calendar date', function () {
  var result = orders.list({ orders: sampleOrders }, { status: 'all' });

  assert.deepEqual(result.map(function (order) { return order.id; }), [1008, 1007, 1004, 1001]);
});

test('order history date range filters include only dates in the requested range', function () {
  var result = orders.list({ orders: sampleOrders }, {
    status: 'all',
    from: '2022-01-01',
    to: '2022-01-31'
  });

  assert.deepEqual(result.map(function (order) { return order.id; }), [1004]);
});

test('Khata settlement adds a numeric string as an amount instead of concatenating it', function () {
  var customer = {
    id: 9,
    name: 'Meera Joshi',
    openingBalance: 450,
    totalBilled: 1982.01,
    totalSettled: 1200,
    creditLimit: 5000
  };
  var db = { customers: [customer], settlements: [], nextSettlementId: 501 };

  var result = ledger.recordSettlement(db, 9, '500', 'upi', 'Counter payment');

  assert.equal(result.ok, true);
  assert.equal(customer.totalSettled, 1700);
  assert.equal(customer.balance, 732.01);
  assert.equal(result.settlement.amount, 500);
});
