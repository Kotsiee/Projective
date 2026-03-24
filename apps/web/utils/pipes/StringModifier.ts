export class StringModifier {
	/**
	 * Capitalizes the first letter of each word in a string.
	 * Example: "hello world" -> "Hello World"
	 */
	static titleCase(text: string): string {
		if (!text) return text;
		return text
			.toLowerCase()
			.split(/\s+/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	/**
	 * Capitalizes only the very first letter of the string.
	 * Example: "hello world" -> "Hello world"
	 */
	static capitalize(text: string): string {
		if (!text) return text;
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	}

	/**
	 * Converts a string to camelCase.
	 * Example: "Hello World" -> "helloWorld"
	 */
	static camelCase(text: string): string {
		if (!text) return text;
		return text
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
	}

	/**
	 * Converts a string to PascalCase.
	 * Example: "hello world" -> "HelloWorld"
	 */
	static pascalCase(text: string): string {
		if (!text) return text;
		const camel = this.camelCase(text);
		return camel.charAt(0).toUpperCase() + camel.slice(1);
	}

	/**
	 * Converts a string to snake_case.
	 * Example: "Hello World" -> "hello_world"
	 */
	static snakeCase(text: string): string {
		if (!text) return text;
		return text
			.replace(/\W+/g, ' ')
			.split(/ |\B(?=[A-Z])/)
			.map((word) => word.toLowerCase())
			.join('_');
	}

	/**
	 * Converts a string to kebab-case.
	 * Example: "Hello World" -> "hello-world"
	 */
	static kebabCase(text: string): string {
		if (!text) return text;
		return text
			.replace(/\W+/g, ' ')
			.split(/ |\B(?=[A-Z])/)
			.map((word) => word.toLowerCase())
			.join('-');
	}

	/**
	 * Reverses the characters in a string.
	 * Example: "hello" -> "olleh"
	 */
	static reverse(text: string): string {
		if (!text) return text;
		return text.split('').reverse().join('');
	}

	/**
	 * Truncates a string to a specified length and adds an ellipsis.
	 * Example: ("Hello World", 5) -> "Hello..."
	 */
	static truncate(text: string, maxLength: number, suffix: string = '...'): string {
		if (!text || text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + suffix;
	}

	/**
	 * Removes all whitespace from a string.
	 * Example: " h e l l o " -> "hello"
	 */
	static removeWhitespace(text: string): string {
		if (!text) return text;
		return text.replace(/\s+/g, '');
	}
}
