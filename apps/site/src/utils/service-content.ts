import type { PortableTextBlock } from "emdash";

const PHONE_RE = /9043047266|35642646/i;

function blockText(block: PortableTextBlock): string {
	if (block._type !== "block" || !("children" in block)) return "";
	return (block.children as { text?: string }[])
		.map((child) => child.text ?? "")
		.join("");
}

function isHeading(block: PortableTextBlock, style = "h2"): boolean {
	return block._type === "block" && "style" in block && block.style === style;
}

/** Remove redundant description copy and trailing phone CTAs from service body content. */
export function prepareServiceContent(
	content: PortableTextBlock[] | undefined,
	excerpt?: string | null,
): PortableTextBlock[] | undefined {
	if (!content?.length) return content;

	let blocks = [...content];

	while (blocks.length > 0) {
		const last = blocks.at(-1);
		if (!last) break;

		if (
			last._type === "block" &&
			"style" in last &&
			last.style === "normal" &&
			!("listItem" in last && last.listItem)
		) {
			const text = blockText(last);
			if (PHONE_RE.test(text)) {
				blocks.pop();
				const previous = blocks.at(-1);
				if (
					previous &&
					isHeading(previous) &&
					/^cta$/i.test(blockText(previous).trim())
				) {
					blocks.pop();
				}
				continue;
			}
		}

		break;
	}

	if (excerpt && blocks.length >= 2) {
		const [first, second] = blocks;
		if (
			isHeading(first) &&
			/^description$/i.test(blockText(first).trim()) &&
			second._type === "block" &&
			"style" in second &&
			second.style === "normal" &&
			!("listItem" in second && second.listItem) &&
			blockText(second).trim() === excerpt.trim()
		) {
			blocks = blocks.slice(2);
		}
	}

	return blocks;
}
