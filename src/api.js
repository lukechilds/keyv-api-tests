import tk from 'timekeeper';
import delay from 'delay';

const keyvApiTests = (test, Keyv, store) => {
	test.beforeEach(async () => {
		const keyv = new Keyv({ store: store() });
		await keyv.clear();
	});

	test.serial('.set(key, value) returns a Promise', t => {
		const keyv = new Keyv({ store: store() });
		t.true(keyv.set('foo', 'bar') instanceof Promise);
	});

	test.serial('.set(key, value) resolves to true', async t => {
		const keyv = new Keyv({ store: store() });
		t.is(await keyv.set('foo', 'bar'), true);
	});

	test.serial('.set(key, value) sets a value', async t => {
		const keyv = new Keyv({ store: store() });
		await keyv.set('foo', 'bar');
		t.is(await keyv.get('foo'), 'bar');
	});

	test.serial('.set(key, value, ttl) sets a value that expires', async t => {
		const ttl = 1000;
		const keyv = new Keyv({ store: store() });
		await keyv.set('foo', 'bar', ttl);
		t.is(await keyv.get('foo'), 'bar');
		if (keyv.opts.store.ttlSupport === true) {
			await delay(ttl + 1);
		} else {
			tk.freeze(Date.now() + ttl + 1);
		}
		t.is(await keyv.get('foo'), undefined);
		tk.reset();
	});

	test.serial('.get(key) returns a Promise', t => {
		const keyv = new Keyv({ store: store() });
		t.true(keyv.get('foo') instanceof Promise);
	});

	test.serial('.get(key) resolves to value', async t => {
		const keyv = new Keyv({ store: store() });
		await keyv.set('foo', 'bar');
		t.is(await keyv.get('foo'), 'bar');
	});

	test.serial('.get(key) with nonexistent key resolves to undefined', async t => {
		const keyv = new Keyv({ store: store() });
		t.is(await keyv.get('foo'), undefined);
	});

	test.serial('.has(key) returns a Promise', async t => {
		const store = new Map();
		const keyv = new Keyv({ store });
		await keyv.set('foo', 'bar');
		t.true(keyv.has('foo') instanceof Promise);
	});

	test.serial('.has(key) resolves to true', async t => {
		const store = new Map();
		const keyv = new Keyv({ store });
		await keyv.set('foo', 'bar');
		t.is(await keyv.has('foo'), true);
		await keyv.set('buzz', null);
		t.is(await keyv.has('buzz'), true);
		await keyv.set('aldrin', undefined);
		t.is(await keyv.has('aldrin'), true);
	});

	test.serial('.has(key) resolves to false', async t => {
		const store = new Map();
		const keyv = new Keyv({ store });
		t.is(await keyv.has('fizz'), false);
	});

	test.serial('.has(key) resolves to false after .delete(key)', async t => {
		const store = new Map();
		const keyv = new Keyv({ store });
		await keyv.set('foo', 'bar');
		t.is(await keyv.has('foo'), true);
		await keyv.delete('foo');
		t.is(await keyv.has('foo'), false);
	});

	test.serial('.has(key) resolves to false after expiration', async t => {
		const startTime = Date.now();
		tk.freeze(startTime);
		const store = new Map();
		const keyv = new Keyv({ store });
		await keyv.set('foo', 'bar', 100);
		t.is(await keyv.has('foo'), true);
		tk.freeze(startTime + 150);
		t.is(await keyv.has('foo'), false);
		tk.reset();
	});

	test.serial('.delete(key) returns a Promise', t => {
		const keyv = new Keyv({ store: store() });
		t.true(keyv.delete('foo') instanceof Promise);
	});

	test.serial('.delete(key) resolves to true', async t => {
		const keyv = new Keyv({ store: store() });
		await keyv.set('foo', 'bar');
		t.is(await keyv.delete('foo'), true);
	});

	test.serial('.delete(key) with nonexistent key resolves to false', async t => {
		const keyv = new Keyv({ store: store() });
		t.is(await keyv.delete('foo'), false);
	});

	test.serial('.delete(key) deletes a key', async t => {
		const keyv = new Keyv({ store: store() });
		await keyv.set('foo', 'bar');
		t.is(await keyv.delete('foo'), true);
		t.is(await keyv.get('foo'), undefined);
	});

	test.serial('.clear() returns a Promise', async t => {
		const keyv = new Keyv({ store: store() });
		const returnValue = keyv.clear();
		t.true(returnValue instanceof Promise);
		await returnValue;
	});

	test.serial('.clear() resolves to undefined', async t => {
		const keyv = new Keyv({ store: store() });
		t.is(await keyv.clear(), undefined);
		await keyv.set('foo', 'bar');
		t.is(await keyv.clear(), undefined);
	});

	test.serial('.clear() deletes all key/value pairs', async t => {
		const keyv = new Keyv({ store: store() });
		await keyv.set('foo', 'bar');
		await keyv.set('fizz', 'buzz');
		await keyv.clear();
		t.is(await keyv.get('foo'), undefined);
		t.is(await keyv.get('fizz'), undefined);
	});

	test.after.always(async () => {
		const keyv = new Keyv({ store: store() });
		await keyv.clear();
	});
};

export default keyvApiTests;
