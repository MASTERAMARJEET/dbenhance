import { createHash } from "node:crypto";

function sortBySlug(items = []) {
	return [...items].sort((a, b) => a.slug.localeCompare(b.slug));
}

function normalizeField(field) {
	return {
		slug: field.slug,
		type: field.type,
		required: Boolean(field.required),
		searchable: Boolean(field.searchable),
		translatable: field.translatable ?? undefined,
		options: field.options ?? undefined,
	};
}

function normalizeCollection(collection) {
	return {
		slug: collection.slug,
		supports: [...(collection.supports ?? [])].sort(),
		fields: sortBySlug(collection.fields ?? []).map(normalizeField),
	};
}

function normalizeTaxonomy(taxonomy) {
	return {
		name: taxonomy.name,
		hierarchical: Boolean(taxonomy.hierarchical),
		collections: [...(taxonomy.collections ?? [])].sort(),
	};
}

function normalizeMenu(menu) {
	return {
		name: menu.name,
		items: (menu.items ?? []).map((item) => ({
			type: item.type,
			label: item.label,
			referenceCollection: item.referenceCollection ?? null,
			customUrl: item.customUrl ?? null,
		})),
	};
}

function normalizeWidgetArea(area) {
	return {
		name: area.name,
		widgets: (area.widgets ?? []).map((widget) => ({
			type: widget.type,
			title: widget.title ?? null,
			menuName: widget.menuName ?? null,
			componentId: widget.componentId ?? null,
		})),
	};
}

export function buildSchemaSnapshot(seed) {
	return {
		collections: sortBySlug(seed.collections ?? []).map(normalizeCollection),
		taxonomies: [...(seed.taxonomies ?? [])]
			.map(normalizeTaxonomy)
			.sort((a, b) => a.name.localeCompare(b.name)),
		menus: [...(seed.menus ?? [])]
			.map(normalizeMenu)
			.sort((a, b) => a.name.localeCompare(b.name)),
		widgetAreas: [...(seed.widgetAreas ?? [])]
			.map(normalizeWidgetArea)
			.sort((a, b) => a.name.localeCompare(b.name)),
	};
}

export function fingerprintSchema(seed) {
	const snapshot = buildSchemaSnapshot(seed);
	return createHash("sha256")
		.update(JSON.stringify(snapshot))
		.digest("hex")
		.slice(0, 16);
}

export function diffSchemas(sourceSeed, targetSeed) {
	const source = buildSchemaSnapshot(sourceSeed);
	const target = buildSchemaSnapshot(targetSeed);
	const lines = [];

	const sourceCollections = new Map(source.collections.map((c) => [c.slug, c]));
	const targetCollections = new Map(target.collections.map((c) => [c.slug, c]));

	for (const slug of new Set([...sourceCollections.keys(), ...targetCollections.keys()])) {
		const left = sourceCollections.get(slug);
		const right = targetCollections.get(slug);
		if (!left) {
			lines.push(`+ collection "${slug}" exists only on target`);
			continue;
		}
		if (!right) {
			lines.push(`- collection "${slug}" exists only on source`);
			continue;
		}
		if (JSON.stringify(left) !== JSON.stringify(right)) {
			lines.push(`~ collection "${slug}" schema differs`);
		}
	}

	const sourceTaxonomies = new Map(source.taxonomies.map((t) => [t.name, t]));
	const targetTaxonomies = new Map(target.taxonomies.map((t) => [t.name, t]));
	for (const name of new Set([...sourceTaxonomies.keys(), ...targetTaxonomies.keys()])) {
		const left = sourceTaxonomies.get(name);
		const right = targetTaxonomies.get(name);
		if (!left) {
			lines.push(`+ taxonomy "${name}" exists only on target`);
		} else if (!right) {
			lines.push(`- taxonomy "${name}" exists only on source`);
		} else if (JSON.stringify(left) !== JSON.stringify(right)) {
			lines.push(`~ taxonomy "${name}" schema differs`);
		}
	}

	return lines;
}

export function countContent(seed) {
	const counts = {};
	for (const collection of seed.collections ?? []) {
		const slug = collection.slug;
		counts[slug] = (collection.content ?? []).length;
	}
	return counts;
}
