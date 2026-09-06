export function collectMediaReferences(seed) {
	const keys = new Set();

	const visit = (value) => {
		if (value == null) {
			return;
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				visit(item);
			}
			return;
		}
		if (typeof value !== "object") {
			return;
		}

		if (value.$media) {
			if (typeof value.$media === "string") {
				keys.add(value.$media);
			} else if (value.$media?.storageKey) {
				keys.add(value.$media.storageKey);
			} else if (value.$media?.id) {
				keys.add(value.$media.id);
			}
		}

		if (value.storageKey && typeof value.storageKey === "string") {
			keys.add(value.storageKey);
		}

		for (const nested of Object.values(value)) {
			visit(nested);
		}
	};

	visit(seed.settings);
	visit(seed.collections);
	visit(seed.bylines);
	visit(seed.menus);
	visit(seed.widgetAreas);
	visit(seed.redirects);
	visit(seed.sections);

	return [...keys].sort();
}

export function countContentEntries(seed) {
	const counts = {};
	for (const collection of seed.collections ?? []) {
		counts[collection.slug] = (collection.content ?? []).length;
	}
	return counts;
}
