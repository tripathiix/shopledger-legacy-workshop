'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var pricing = require('../lib/pricing');
var invoice = require('../lib/invoice');

test('Invoice figures match billed pricing for HSN GST and capped coupon', function () {
  var items = [
    { id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 1000, qty: 1 },
    { id: 2, name: 'Coffee', sku: 'COF-1', hsn: '9999', price: 2000, qty: 1 }
  ];
  var billed = pricing.computeTotals(items, 'SAVE10');
  var printed = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });

  assert.equal(printed.subtotal, billed.subtotal);
  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.cgst, billed.cgst);
  assert.equal(printed.sgst, billed.sgst);
  assert.equal(printed.total, billed.total);
  assert.deepEqual(printed.rows.map(function (row) { return row.gstPercent; }),
    billed.lines.map(function (line) { return line.gstPercent; }));
  assert.deepEqual(printed.rows.map(function (row) { return row.lineTax; }),
    billed.lines.map(function (line) { return line.tax; }));
});

test('Invoice rendering suppresses the reconciliation notice when figures match the billed total', function () {
  var order = {
    id: 42,
    date: '22/11/2026',
    customer: 'Walk-in',
    paymentMode: 'cash',
    status: 'completed',
    coupon: '',
    total: 1050,
    items: [
      { name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 1000, qty: 1 }
    ]
  };

  var html = invoice.render(order);

  assert.doesNotMatch(html, /Accountant Reconciliation Notice/);
  assert.doesNotMatch(html, /1180\.00/);
  assert.match(html, /1050\.00/);
});

test('CURRENT BEHAVIOUR: invoice rounds CGST to half the GST and assigns the remainder to SGST', function () {
  var printed = invoice.computeInvoiceFigures({
    items: [
      { name: 'Small item', price: 0.28, qty: 1 }
    ],
    coupon: ''
  });

  assert.equal(printed.tax, 0.05);
  assert.equal(printed.cgst, 0.03);
  assert.equal(printed.sgst, 0.02);
  assert.equal(printed.cgst + printed.sgst, printed.tax);
});
